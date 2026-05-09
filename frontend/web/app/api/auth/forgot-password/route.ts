import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rate-limit";
import { createHash } from "crypto";

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
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbError: any) {
      console.error("[auth/forgot-password] Database error:", dbError.message);
      // Don't reveal DB errors to client
      return NextResponse.json({
        message: "If an account with that email exists, you will receive a password reset link.",
      });
    }

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return NextResponse.json({
        message: "If an account with that email exists, you will receive a password reset link.",
      });
    }

    // Generate reset token
    const token = generateToken();
    const resetTokenStr = `reset_${token}`;
    const lookupHash = createHash("sha256").update(resetTokenStr).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in database (using Session model temporarily)
    try {
      const sessionData: any = {
        userId: user.id,
        token: resetTokenStr,
        lookupHash,
        expiresAt,
      };
      await prisma.session.create({
        data: sessionData,
      });
    } catch (dbError: any) {
      console.error("[auth/forgot-password] Token storage error:", dbError.message);
      return NextResponse.json({
        message: "If an account with that email exists, you will receive a password reset link.",
      });
    }

    // Log reset token (for development - implement proper email sending later)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    console.log(`Password reset link for ${user.email}: ${resetUrl}`);

    return NextResponse.json({
      message: "If an account with that email exists, you will receive a password reset link.",
    });
  } catch (error: any) {
    console.error("[auth/forgot-password] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
