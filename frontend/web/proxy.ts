import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // Skip API and static files
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/static") ||
    url.pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Admin route protection — require session cookie
  if (url.pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get("session")?.value;
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", url.pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Role check is handled by AdminContext (client) + API routes (server)
  }

  // Extract subdomain
  let subdomain: string | null = null;

  if (host && !host.includes("localhost") && !host.includes("vercel.app")) {
    const parts = host.split(".");
    if (parts.length >= 3) {
      subdomain = parts[0];
    }
  } else if (host.includes("localhost")) {
    // For local dev, check ?store=subdomain
    const storeParam = url.searchParams.get("store");
    if (storeParam) {
      subdomain = storeParam;
    }
  }

  if (subdomain) {
    // Rewrite to store route with subdomain in query
    url.pathname = `/store${url.pathname}`;
    url.searchParams.set("subdomain", subdomain);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
