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
    const { name, email, phone, password } = registerSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Email or phone already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || undefined,
        password: hashedPassword,
        role: "MERCHANT",
      },
    }) as any;

    const token = await createSession(user.id);

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
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 400 }
    );
  }
}