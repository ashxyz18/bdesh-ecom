import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 3 requests per hour per IP
  const rateResult = checkRateLimit(req, RATE_LIMITS.auth, getClientIdentifier(req));
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: rateResult.headers }
    );
  }

  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return NextResponse.json({
        message: "If an account with that email exists, you will receive a password reset link.",
      });
    }

    // Generate reset token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in database (using Session model temporarily)
    await prisma.session.create({
      data: {
        userId: user.id,
        token: `reset_${token}`,
        expiresAt,
      },
    });

    // Log reset token (for development - implement proper email sending later)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    console.log(`Password reset link for ${user.email}: ${resetUrl}`);

    return NextResponse.json({
      message: "If an account with that email exists, you will receive a password reset link.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
