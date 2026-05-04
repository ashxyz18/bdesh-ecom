import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getPlanLimits } from "@/lib/payment-gateway";

// GET /api/subscriptions?storeId=... — Get current subscription for a store
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const storeId = req.nextUrl.searchParams.get("storeId");
    if (!storeId) {
      return NextResponse.json({ message: "storeId is required" }, { status: 400 });
    }

    const subscription = await (prisma as any).subscription.findFirst({
      where: { storeId, status: "ACTIVE" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      // Return free plan as default
      return NextResponse.json({
        subscription: null,
        plan: { name: "FREE", label: "Free", price: 0 },
        limits: getPlanLimits("FREE"),
      });
    }

    return NextResponse.json({
      subscription,
      plan: subscription.plan,
      limits: getPlanLimits(subscription.plan?.name || "FREE"),
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions — Create or update a subscription
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId, planId, paymentMethod, trxId, billingPeriod } = body;

    if (!storeId || !planId) {
      return NextResponse.json(
        { message: "storeId and planId are required" },
        { status: 400 }
      );
    }

    // Verify user owns this store
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store || (store.ownerId !== session.userId && session.role !== "ADMIN")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get plan details
    const plan = await (prisma as any).plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ message: "Plan not found" }, { status: 404 });
    }

    // Deactivate existing active subscription
    await (prisma as any).subscription.updateMany({
      where: { storeId, status: "ACTIVE" },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    // Calculate period end
    const periodEnd = new Date();
    if (billingPeriod === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Create new subscription
    const subscription = await (prisma as any).subscription.create({
      data: {
        userId: session.userId,
        storeId,
        planId,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        paymentMethod: paymentMethod || null,
        trxId: trxId || null,
        metadata: JSON.stringify({ billingPeriod: billingPeriod || "monthly" }),
      },
      include: { plan: true },
    });

    return NextResponse.json({ subscription });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions?storeId=... — Cancel subscription
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const storeId = req.nextUrl.searchParams.get("storeId");
    if (!storeId) {
      return NextResponse.json({ message: "storeId is required" }, { status: 400 });
    }

    await (prisma as any).subscription.updateMany({
      where: { storeId, status: "ACTIVE" },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    return NextResponse.json({ message: "Subscription cancelled" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
