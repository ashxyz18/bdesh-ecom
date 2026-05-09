import { NextRequest, NextResponse } from "next/server";

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "";
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    return NextResponse.json(
      { message: "Facebook OAuth is not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET." },
      { status: 500 }
    );
  }

  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") || `${APP_URL}/api/auth/callback/facebook`;
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "email,public_profile",
    state,
  });

  // Store state in cookie for CSRF verification
  const response = NextResponse.redirect(
    `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`
  );

  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  response.cookies.set("oauth_callback_url", callbackUrl, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}
