/**
 * In-memory rate limiter for API routes.
 * Uses a sliding window algorithm with automatic cleanup.
 * 
 * Usage in API routes:
 *   const limiter = getRateLimiter("api-auth", { windowMs: 60000, maxRequests: 30 });
 *   const result = limiter.check(request);
 *   if (!result.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: result.headers });
 */

interface RateLimitOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Max requests per window per key */
  maxRequests: number;
  /** Optional key prefix for identification */
  prefix?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  headers: {
    "X-RateLimit-Limit": string;
    "X-RateLimit-Remaining": string;
    "X-RateLimit-Reset": string;
    "Retry-After"?: string;
  };
}

// Store: Map<prefix:key, RateLimitEntry>
const stores = new Map<string, Map<string, RateLimitEntry>>();

// Cleanup interval - purge expired entries every 60 seconds
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [prefix, entries] of stores.entries()) {
      for (const [key, entry] of entries.entries()) {
        if (now > entry.resetTime) {
          entries.delete(key);
        }
      }
      if (entries.size === 0) {
        stores.delete(prefix);
      }
    }
  }, 60_000);

  // Allow the process to exit even with the timer running
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

class RateLimiter {
  private prefix: string;
  private windowMs: number;
  private maxRequests: number;
  private entries: Map<string, RateLimitEntry>;

  constructor(prefix: string, options: RateLimitOptions) {
    this.prefix = prefix;
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.entries = new Map();
    stores.set(prefix, this.entries);
    ensureCleanup();
  }

  /**
   * Check if a request is allowed based on the key.
   * Key should be a unique identifier (e.g., IP address, user ID).
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = this.entries.get(key);

    // No entry or expired window - start fresh
    if (!entry || now > entry.resetTime) {
      const resetTime = now + this.windowMs;
      this.entries.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime,
        headers: {
          "X-RateLimit-Limit": String(this.maxRequests),
          "X-RateLimit-Remaining": String(this.maxRequests - 1),
          "X-RateLimit-Reset": String(Math.ceil(resetTime / 1000)),
        },
      };
    }

    // Within window - increment count
    entry.count += 1;
    const remaining = Math.max(0, this.maxRequests - entry.count);
    const allowed = entry.count <= this.maxRequests;

    const result: RateLimitResult = {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      headers: {
        "X-RateLimit-Limit": String(this.maxRequests),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(Math.ceil(entry.resetTime / 1000)),
      },
    };

    if (!allowed) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      result.headers["Retry-After"] = String(retryAfter);
    }

    return result;
  }

  /** Reset rate limit for a specific key */
  reset(key: string): void {
    this.entries.delete(key);
  }

  /** Get current count for a key without incrementing */
  peek(key: string): { count: number; resetTime: number } | null {
    const entry = this.entries.get(key);
    if (!entry || Date.now() > entry.resetTime) return null;
    return { count: entry.count, resetTime: entry.resetTime };
  }
}

// Singleton instances per prefix
const limiters = new Map<string, RateLimiter>();

/**
 * Get or create a rate limiter instance.
 * Use a consistent prefix to share the same limiter across requests.
 */
export function getRateLimiter(prefix: string, options: RateLimitOptions): RateLimiter {
  const existing = limiters.get(prefix);
  if (existing) return existing;

  const limiter = new RateLimiter(prefix, { ...options, prefix });
  limiters.set(prefix, limiter);
  return limiter;
}

/**
 * Extract a client identifier from a Next.js request.
 * Uses X-Forwarded-For header (from proxy) or falls back to connection info.
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP in the chain (original client)
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // Fallback - use a hash of user agent as a rough identifier
  const ua = request.headers.get("user-agent") || "unknown";
  return `ua:${ua.slice(0, 50)}`;
}

/**
 * Pre-configured rate limiters for common use cases.
 */
export const RATE_LIMITS = {
  /** General API: 60 requests per minute */
  api: { prefix: "api", windowMs: 60_000, maxRequests: 60 },
  /** Authentication: 5 attempts per minute (strict) */
  auth: { prefix: "auth", windowMs: 60_000, maxRequests: 5 },
  /** AI endpoints: 10 requests per minute (expensive) */
  ai: { prefix: "ai", windowMs: 60_000, maxRequests: 10 },
  /** Analytics tracking: 120 requests per minute */
  analytics: { prefix: "analytics", windowMs: 60_000, maxRequests: 120 },
  /** Storefront: 200 requests per minute (high traffic) */
  storefront: { prefix: "storefront", windowMs: 60_000, maxRequests: 200 },
  /** Admin: 30 requests per minute */
  admin: { prefix: "admin", windowMs: 60_000, maxRequests: 30 },
  /** Checkout: 10 attempts per minute */
  checkout: { prefix: "checkout", windowMs: 60_000, maxRequests: 10 },
} as const;

/**
 * Convenience function: check rate limit for a request using a pre-configured limiter.
 * Returns the result with appropriate headers.
 */
export function checkRateLimit(
  request: Request,
  config: { prefix: string; windowMs: number; maxRequests: number },
  customKey?: string,
): RateLimitResult {
  const limiter = getRateLimiter(config.prefix, config);
  const key = customKey || getClientIdentifier(request);
  return limiter.check(key);
}

/**
 * Apply rate limit headers to a Next.js Response.
 * If rate limited, returns a 429 response. Otherwise returns null.
 */
export function applyRateLimit(
  request: Request,
  config: { prefix: string; windowMs: number; maxRequests: number },
  customKey?: string,
): RateLimitResult | null {
  const result = checkRateLimit(request, config, customKey);
  if (!result.allowed) return result;
  return null;
}
