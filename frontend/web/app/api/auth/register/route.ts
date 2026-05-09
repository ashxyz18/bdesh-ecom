import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { registerSchema } from "@bdesh/shared";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 5 registration attempts per minute per IP
  const rateResult = checkRateLimit(req, RATE_LIMITS.auth, getClientIdentifier(req));
  if (!rateResult.allowed) {
    return NextResponse.json(
      { message: "Too many registration attempts. Please try again later." },
      { status: 429, headers: rateResult.headers },
    );
  }

  try {
    const body = await req.json();

    // Validate input
    let parsed;
    try {
      parsed = registerSchema.parse(body);
    } catch {
      return NextResponse.json(
        { message: "Please fill in all required fields correctly" },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = parsed;

    // Check existing user
    let existing;
    try {
      existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { phone }] },
      });
    } catch (dbError: any) {
      console.error("[auth/register] Database error:", dbError.message);
      return NextResponse.json(
        { message: "Service temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { message: "Email or phone already registered" },
        { status: 409 }
      );
    }

    // Hash password and create user
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
    } catch (hashError: any) {
      console.error("[auth/register] Password hashing error:", hashError.message);
      return NextResponse.json(
        { message: "Registration failed. Please try again." },
        { status: 500 }
      );
    }

    let user;
    try {
      user = await prisma.user.create({
        data: {
          name,
          email,
          phone: phone || undefined,
          password: hashedPassword,
          role: "MERCHANT",
        },
      }) as any;
    } catch (dbError: any) {
      console.error("[auth/register] User creation error:", dbError.message);
      return NextResponse.json(
        { message: "Could not create account. Please try again." },
        { status: 500 }
      );
    }

    // Create session
    let token;
    try {
      token = await createSession(user.id);
    } catch (sessionError: any) {
      console.error("[auth/register] Session creation error:", sessionError.message);
      // User was created but session failed - still return success, user can login
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: "Account created. Please log in.",
      });
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
    console.error("[auth/register] Unexpected error:", error.message);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}