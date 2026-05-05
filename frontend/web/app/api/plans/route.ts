import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PLANS } from "@/lib/payment-gateway";

// GET /api/plans — List all available plans
export async function GET() {
  try {
    let plans = await (prisma as any).plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    // Seed default plans if none exist
    if (plans.length === 0) {
      await (prisma as any).plan.createMany({ data: DEFAULT_PLANS });
      plans = await (prisma as any).plan.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      });
    }

    return NextResponse.json({ plans });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
