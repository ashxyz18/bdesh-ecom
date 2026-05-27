import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/health — simple liveness probe. Reports whether the database is
 * reachable. Wire this into BetterStack / UptimeRobot / Vercel Health Checks
 * to alert when the site goes dark.
 *
 * Returns 200 when healthy, 503 when the DB is unreachable.
 */
export async function GET() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        ok: true,
        db: "up",
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        db: "down",
        error: error instanceof Error ? error.message : "unknown",
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  }
}
