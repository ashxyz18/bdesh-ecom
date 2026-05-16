import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PLATFORM_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "bdesh.com",
  "www.bdesh.com",
  "bixelbd.com",
  "www.bixelbd.com",
];

const EXCLUDED_PATHS = [
  "/api/",
  "/_next/",
  "/templates/",
  "/dashboard",
  "/onboarding",
  "/login",
  "/signup",
  "/site-admin",
  "/admin-panel",
  "/admin",
  "/store/",
  "/favicon",
  "/images/",
  "/videos/",
  "/static/",
];

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now > record.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count++;
  return false;
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimit.entries()) {
    if (now > record.resetAt) {
      rateLimit.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/videos/") ||
    pathname.startsWith("/images/") ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webp|avif|woff|woff2|ttf|eot|css|js|json)$/)
  ) {
    return NextResponse.next();
  }

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // Add API response headers
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX));
    response.headers.set("X-RateLimit-Window", String(RATE_LIMIT_WINDOW / 1000));
    return response;
  }

  // Skip excluded paths for subdomain/domain proxy logic
  if (EXCLUDED_PATHS.some((p) => url.pathname.startsWith(p))) {
    // Still apply cache headers for known public excluded paths before returning
    const response = NextResponse.next();
    if (
      pathname === "/" ||
      pathname === "/templates" ||
      pathname.startsWith("/templates/") ||
      pathname === "/login" ||
      pathname === "/signup"
    ) {
      response.headers.set(
        "Cache-Control",
        "public, max-age=60, s-maxage=300, stale-while-revalidate=86400"
      );
    }
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/site-admin")) {
      response.headers.set(
        "Cache-Control",
        "private, no-cache, no-store, must-revalidate"
      );
    }
    return response;
  }

  // Skip static file extensions
  if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif|map|json)$/i.test(url.pathname)) {
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
  }

  // Extract hostname without port
  const hostWithoutPort = host.split(":")[0];

  // For localhost, check ?store=subdomain param for local dev testing
  if (hostWithoutPort === "localhost" || hostWithoutPort === "127.0.0.1") {
    const storeParam = url.searchParams.get("store");
    if (storeParam) {
      url.pathname = `/store${url.pathname}`;
      url.searchParams.set("subdomain", storeParam);
      return NextResponse.rewrite(url);
    }
    // fall through to apply cache headers
  }

  // If the request is on a known platform domain, pass through
  if (PLATFORM_DOMAINS.includes(hostWithoutPort)) {
    // fall through to apply cache headers
  } else {
    // Check subdomain: mystore.bdesh.com
    const baseDomains = ["bdesh.com", "bixelbd.com"];
    let subdomain: string | null = null;

    for (const base of baseDomains) {
      if (hostWithoutPort.endsWith(`.${base}`)) {
        subdomain = hostWithoutPort.replace(`.${base}`, "");
        break;
      }
    }

    // Fallback: any host with 3+ parts (e.g., store.example.com)
    if (!subdomain) {
      const parts = hostWithoutPort.split(".");
      if (parts.length >= 3) {
        subdomain = parts[0];
      }
    }

    if (subdomain && subdomain !== "www") {
      url.pathname = `/store/by-subdomain/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }

    // Custom domain (e.g., www.myshoestore.com) — rewrite to domain lookup
    if (!PLATFORM_DOMAINS.includes(hostWithoutPort) && !subdomain) {
      url.pathname = `/store/by-domain/${hostWithoutPort}${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Apply cache/security headers for pages before returning
  const response = NextResponse.next();

  if (
    pathname === "/" ||
    pathname === "/templates" ||
    pathname.startsWith("/templates/") ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=60, s-maxage=300, stale-while-revalidate=86400"
    );
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/site-admin")) {
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
