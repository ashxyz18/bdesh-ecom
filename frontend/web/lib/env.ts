/**
 * Centralized env validation. Importing this module from any server file
 * causes Node to fail loud at boot if a required variable is missing — much
 * better than silent failures inside a request handler at 2am.
 *
 * Usage:
 *   import { env } from "@/lib/env";
 *   const url = env.NEXT_PUBLIC_APP_URL;
 */

type EnvShape = {
  // Required
  DATABASE_URL: string;

  // Strongly recommended in production
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_PLATFORM_HOST: string;

  // Optional
  DIRECT_URL?: string;
  NEXTAUTH_SECRET?: string;
  JWT_SECRET?: string;
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
};

function pick<T extends keyof EnvShape>(key: T, required: boolean, fallback?: string): string | undefined {
  const value = process.env[key as string];
  if (value && value.length > 0) return value;
  if (fallback !== undefined) return fallback;
  if (required) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `[env] Missing required env var ${key}. Set it in your hosting provider's environment variables.`,
      );
    }
    console.warn(`[env] ${key} is not set — using fallback. Set it for production.`);
  }
  return undefined;
}

const isServer = typeof window === "undefined";

// Strict mode: only validate on the server. Client bundle pulls these from
// `NEXT_PUBLIC_*` variables which Next inlines at build time.
export const env = {
  DATABASE_URL: isServer ? pick("DATABASE_URL", true) : "",
  DIRECT_URL: isServer ? pick("DIRECT_URL", false) : undefined,
  NEXT_PUBLIC_APP_URL:
    pick("NEXT_PUBLIC_APP_URL", false, "http://localhost:3000") || "http://localhost:3000",
  NEXT_PUBLIC_PLATFORM_HOST:
    pick("NEXT_PUBLIC_PLATFORM_HOST", false, "bdesh.com") || "bdesh.com",
  NEXTAUTH_SECRET: isServer ? pick("NEXTAUTH_SECRET", false) : undefined,
  JWT_SECRET: isServer ? pick("JWT_SECRET", false) : undefined,
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: pick(
    "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION",
    false,
  ),
};

/** Convenience getter that always returns a fully-qualified base URL. */
export function getBaseUrl(): string {
  if (env.NEXT_PUBLIC_APP_URL) return env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
