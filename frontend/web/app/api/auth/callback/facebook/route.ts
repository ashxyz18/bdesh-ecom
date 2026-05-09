import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "";
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookUserInfo {
  id: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
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

  const callbackUrl = req.cookies.get("oauth_callback_url")?.value || `${APP_URL}/api/auth/callback/facebook`;

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        redirect_uri: callbackUrl,
        code,
      })}`
    );

    if (!tokenResponse.ok) {
      console.error("[auth/callback/facebook] Token exchange failed");
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_token_failed`);
    }

    const tokenData: FacebookTokenResponse = await tokenResponse.json();

    // Get user info from Facebook
    const userResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,email,name,first_name,last_name,picture.width(200).height(200)&access_token=${tokenData.access_token}`
    );

    if (!userResponse.ok) {
      console.error("[auth/callback/facebook] Failed to fetch user info");
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_user_failed`);
    }

    const fbUser: FacebookUserInfo = await userResponse.json();

    if (!fbUser.email) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_no_email`);
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: fbUser.email },
    }) as any;

    if (!user) {
      // Create new user from Facebook profile
      user = await prisma.user.create({
        data: {
          email: fbUser.email,
          name: fbUser.name || `${fbUser.first_name || ""} ${fbUser.last_name || ""}`.trim() || "Facebook User",
          avatar: fbUser.picture?.data?.url || null,
          password: "", // OAuth users don't need a password
          role: "MERCHANT",
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
    console.error("[auth/callback/facebook] Error:", error.message);
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_error`);
  }
}
