import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

interface PaymentConfig {
  enabled: boolean;
  [key: string]: any;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json({ error: "storeId is required" }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { paymentGateway: true },
    });

    if (!store || store.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const config = store.paymentGateway;
    // Don't expose sensitive data like secrets
    const safeConfig = config ? {
      bkash: config.bkash ? JSON.parse(config.bkash) : null,
      nagad: config.nagad ? JSON.parse(config.nagad) : null,
      rocket: config.rocket ? JSON.parse(config.rocket) : null,
      cod: config.cod ? JSON.parse(config.cod) : null,
    } : null;

    return NextResponse.json({ config: safeConfig });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment config" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId, gateway, config } = body;

    if (!storeId || !gateway) {
      return NextResponse.json(
        { error: "storeId and gateway are required" },
        { status: 400 }
      );
    }

    // Verify store ownership
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store || store.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate gateway type
    if (!["bkash", "nagad", "rocket", "cod", "stripe"].includes(gateway)) {
      return NextResponse.json(
        { error: "Invalid gateway type" },
        { status: 400 }
      );
    }

    // Update or create payment gateway config
    const existing = await prisma.paymentGateway.findUnique({
      where: { storeId },
    });

    const updateData: any = {};
    updateData[gateway] = JSON.stringify(config);

    if (existing) {
      await prisma.paymentGateway.update({
        where: { storeId },
        data: updateData,
      });
    } else {
      await prisma.paymentGateway.create({
        data: {
          storeId,
          ...updateData,
        },
      });
    }

    return NextResponse.json({ message: "Payment gateway updated successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update payment gateway" },
      { status: 500 }
    );
  }
}
