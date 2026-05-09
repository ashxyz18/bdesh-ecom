import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  // Handle user denial or OAuth error
  if (error) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_invalid`);
  }

  // Verify state for CSRF protection
  const storedState = req.cookies.get("oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_invalid_state`);
  }

  const callbackUrl = req.cookies.get("oauth_callback_url")?.value || `${APP_URL}/api/auth/callback/google`;

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("[auth/callback/google] Token exchange failed");
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_token_failed`);
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      console.error("[auth/callback/google] Failed to fetch user info");
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_user_failed`);
    }

    const googleUser: GoogleUserInfo = await userResponse.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_no_email`);
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    }) as any;

    if (!user) {
      // Create new user from Google profile
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || googleUser.given_name || "Google User",
          avatar: googleUser.picture || null,
          password: "", // OAuth users don't need a password
          role: "MERCHANT",
          emailVerified: googleUser.email_verified ? new Date() : null,
        },
      }) as any;
    }

    // Create session
    const token = await createSession(user.id);

    // Redirect to dashboard with session cookie
    const response = NextResponse.redirect(`${APP_URL}/dashboard`);

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Clean up OAuth cookies
    response.cookies.delete("oauth_state");
    response.cookies.delete("oauth_callback_url");

    return response;
  } catch (error: any) {
    console.error("[auth/callback/google] Error:", error.message);
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_error`);
  }
}
