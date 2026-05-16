import { NextResponse } from "next/server";

interface ApiResponseOptions {
  status?: number;
  headers?: Record<string, string>;
  cache?: {
    public?: boolean;
    maxAge?: number;
    sMaxAge?: number;
    staleWhileRevalidate?: number;
    noCache?: boolean;
  };
}

export function apiResponse<T>(
  data: T,
  options: ApiResponseOptions = {}
): NextResponse {
  const { status = 200, headers = {}, cache } = options;

  const responseHeaders = new Headers(headers);

  // Set content type
  responseHeaders.set("Content-Type", "application/json");

  // Set cache headers
  if (cache?.noCache) {
    responseHeaders.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  } else if (cache) {
    const directives: string[] = [];
    if (cache.public) directives.push("public");
    else directives.push("private");
    if (cache.maxAge !== undefined) directives.push(`max-age=${cache.maxAge}`);
    if (cache.sMaxAge !== undefined) directives.push(`s-maxage=${cache.sMaxAge}`);
    if (cache.staleWhileRevalidate !== undefined) {
      directives.push(`stale-while-revalidate=${cache.staleWhileRevalidate}`);
    }
    responseHeaders.set("Cache-Control", directives.join(", "));
  }

  // Security headers
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  responseHeaders.set("X-Frame-Options", "DENY");

  return NextResponse.json(data, { status, headers: responseHeaders });
}

export function apiError(
  message: string,
  status: number = 500,
  details?: Record<string, unknown>
): NextResponse {
  const body: Record<string, unknown> = { error: message };
  if (details) body.details = details;

  return NextResponse.json(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    },
  });
}

// Common cache durations
export const cacheConfig = {
  // Public pages - short cache with long stale-while-revalidate
  publicShort: { public: true, maxAge: 60, sMaxAge: 300, staleWhileRevalidate: 86400 },
  // Public pages - medium cache
  publicMedium: { public: true, maxAge: 300, sMaxAge: 600, staleWhileRevalidate: 86400 },
  // Public pages - long cache (for static data like templates)
  publicLong: { public: true, maxAge: 3600, sMaxAge: 7200, staleWhileRevalidate: 86400 },
  // Private data (user-specific)
  private: { public: false, maxAge: 0, sMaxAge: 0, staleWhileRevalidate: 0 },
  // No cache
  noCache: { noCache: true },
} as const;
