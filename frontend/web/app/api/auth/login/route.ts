import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@bdesh/shared";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 5 login attempts per minute per IP
  const rateResult = checkRateLimit(req, RATE_LIMITS.auth, getClientIdentifier(req));
  if (!rateResult.allowed) {
    return NextResponse.json(
      { message: "Too many login attempts. Please try again later." },
      { status: 429, headers: rateResult.headers },
    );
  }

  try {
    const body = await req.json();

    // Validate input
    let parsed;
    try {
      parsed = loginSchema.parse(body);
    } catch {
      return NextResponse.json(
        { message: "Please enter a valid email and password (min 6 characters)" },
        { status: 400 }
      );
    }

    const { email, password } = parsed;

    // Query user from database
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      }) as any;
    } catch (dbError: any) {
      console.error("[auth/login] Database error:", dbError.message);
      return NextResponse.json(
        { message: "Service temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    let valid;
    try {
      valid = await verifyPassword(password, user.password);
    } catch (authError: any) {
      console.error("[auth/login] Password verification error:", authError.message);
      return NextResponse.json(
        { message: "Authentication service error. Please try again." },
        { status: 500 }
      );
    }

    if (!valid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    let token;
    try {
      token = await createSession(user.id);
    } catch (sessionError: any) {
      console.error("[auth/login] Session creation error:", sessionError.message);
      return NextResponse.json(
        { message: "Could not create session. Please try again." },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[auth/login] Unexpected error:", error.message);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
