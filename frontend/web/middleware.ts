import { NextResponse, type NextRequest } from "next/server";

/**
 * Multi-tenant routing middleware.
 *
 * The platform itself is served on `bdesh.com` (or whatever NEXT_PUBLIC_PLATFORM_HOST
 * is set to). Stores live on:
 *   - `<subdomain>.bdesh.com` — auto-issued per store
 *   - `<custom-domain>` — pointed at the platform via DNS by the merchant
 *
 * For non-platform hosts we look up the storeId through a cached internal
 * resolver and *internally* rewrite the request to `/store/<id>/...`. The
 * URL bar keeps the merchant's domain — which is the entire point.
 *
 * Lookup is done via fetch (not Prisma) so this stays compatible with both
 * Edge and Node middleware runtimes, and so the result can be aggressively
 * edge-cached.
 */

const PLATFORM_HOST = (process.env.NEXT_PUBLIC_PLATFORM_HOST || "bdesh.com").toLowerCase();
const PLATFORM_HOSTS = new Set([
  PLATFORM_HOST,
  `www.${PLATFORM_HOST}`,
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
]);

// Paths that always bypass tenant rewriting. These are platform pages, the
// API, static assets, and the canonical /store/[storeId] tree itself.
const BYPASS_PREFIXES = [
  "/_next/",
  "/api/",
  "/dashboard",
  "/onboarding",
  "/login",
  "/signup",
  "/site-admin",
  "/admin-panel",
  "/store/",
  "/templates",
  "/favicon",
  "/images/",
  "/videos/",
  "/uploads/",
];

const STATIC_FILE_RE =
  /\.(png|jpe?g|gif|svg|ico|webp|avif|woff2?|ttf|eot|css|js|map|json|txt|xml|mp4|webm)$/i;

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  const hostHeader = request.headers.get("host") || "";
  const host = hostHeader.split(":")[0].toLowerCase();

  // Static assets / framework internals — always pass through.
  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p)) || STATIC_FILE_RE.test(pathname)) {
    return NextResponse.next();
  }

  // Platform host or Vercel preview — render normally.
  if (PLATFORM_HOSTS.has(host) || host.endsWith(".vercel.app")) {
    // Local dev convenience: visiting localhost?store=mystore acts like a
    // subdomain so devs don't need to edit /etc/hosts.
    if ((host === "localhost" || host === "127.0.0.1") && url.searchParams.has("store")) {
      const subdomain = url.searchParams.get("store") || "";
      const storeId = await resolveStoreId(`${subdomain}.${PLATFORM_HOST}`, request.url);
      if (storeId) {
        url.pathname = `/store/${storeId}${pathname === "/" ? "" : pathname}`;
        url.searchParams.delete("store");
        return NextResponse.rewrite(url);
      }
    }
    return NextResponse.next();
  }

  // Anything else: subdomain or custom domain. Look up the storeId.
  const storeId = await resolveStoreId(host, request.url);
  if (!storeId) {
    // Unknown host — let it 404 normally rather than bouncing around.
    return NextResponse.next();
  }

  url.pathname = `/store/${storeId}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.rewrite(url);
  // Tag responses so the storefront can detect it's running on a tenant host.
  response.headers.set("x-tenant-host", host);
  response.headers.set("x-store-id", storeId);
  return response;
}

async function resolveStoreId(host: string, originUrl: string): Promise<string | null> {
  try {
    const apiUrl = new URL(
      `/api/storefront/resolve?host=${encodeURIComponent(host)}`,
      originUrl,
    );
    // Edge fetch participates in Next's data cache, so identical lookups
    // within the same revalidation window cost ~0.
    const res = await fetch(apiUrl.toString(), {
      next: { revalidate: 300, tags: [`host:${host}`] },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { storeId: string | null };
    return data.storeId ?? null;
  } catch {
    return null;
  }
}

export const config = {
  // Run on every request except framework internals and obvious static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
