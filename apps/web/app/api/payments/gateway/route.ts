import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/payments/gateway?storeId=... — Get payment gateway config for a store
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

    const gateway = await (prisma as any).paymentGateway.findUnique({
      where: { storeId },
    });

    if (!gateway) {
      // Return default empty config
      return NextResponse.json({
        gateway: {
          storeId,
          stripe: { enabled: false },
          bkash: { enabled: false, sandbox: true },
          nagad: { enabled: false, sandbox: true },
          rocket: { enabled: false, sandbox: true },
          cod: { enabled: true, instructions: "Pay when you receive your order" },
        },
      });
    }

    // Mask sensitive fields before sending to client
    const mask = (obj: any) => {
      if (!obj) return obj;
      const masked = { ...obj };
      if (masked.secretKey) masked.secretKey = "••••••••";
      if (masked.appSecret) masked.appSecret = "••••••••";
      if (masked.password) masked.password = "••••••••";
      if (masked.privateKey) masked.privateKey = "••••••••";
      if (masked.webhookSecret) masked.webhookSecret = "••••••••";
      return masked;
    };

    return NextResponse.json({
      gateway: {
        storeId: gateway.storeId,
        stripe: mask(typeof gateway.stripe === "string" ? JSON.parse(gateway.stripe) : gateway.stripe),
        bkash: mask(typeof gateway.bkash === "string" ? JSON.parse(gateway.bkash) : gateway.bkash),
        nagad: mask(typeof gateway.nagad === "string" ? JSON.parse(gateway.nagad) : gateway.nagad),
        rocket: mask(typeof gateway.rocket === "string" ? JSON.parse(gateway.rocket) : gateway.rocket),
        cod: typeof gateway.cod === "string" ? JSON.parse(gateway.cod) : gateway.cod,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch gateway" }, { status: 500 });
  }
}

// PUT /api/payments/gateway — Update payment gateway config for a store
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId, stripe, bkash, nagad, rocket, cod } = body;

    if (!storeId) {
      return NextResponse.json({ message: "storeId is required" }, { status: 400 });
    }

    // Verify user owns this store
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store || (store.ownerId !== session.userId && session.user?.role !== "ADMIN")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Helper: merge with existing to preserve secrets when masked
    const mergeConfig = (existing: any, incoming: any) => {
      const parsed = typeof existing === "string" ? JSON.parse(existing) : (existing || {});
      const result = { ...parsed, ...incoming };
      // If incoming has masked values, keep existing
      if (incoming.secretKey === "••••••••") result.secretKey = parsed.secretKey;
      if (incoming.appSecret === "••••••••") result.appSecret = parsed.appSecret;
      if (incoming.password === "••••••••") result.password = parsed.password;
      if (incoming.privateKey === "••••••••") result.privateKey = parsed.privateKey;
      if (incoming.webhookSecret === "••••••••") result.webhookSecret = parsed.webhookSecret;
      return JSON.stringify(result);
    };

    // Get existing config for merge
    const existing = await (prisma as any).paymentGateway.findUnique({ where: { storeId } });

    const data: any = {};
    if (stripe !== undefined) data.stripe = existing ? mergeConfig(existing.stripe, stripe) : JSON.stringify(stripe);
    if (bkash !== undefined) data.bkash = existing ? mergeConfig(existing.bkash, bkash) : JSON.stringify(bkash);
    if (nagad !== undefined) data.nagad = existing ? mergeConfig(existing.nagad, nagad) : JSON.stringify(nagad);
    if (rocket !== undefined) data.rocket = existing ? mergeConfig(existing.rocket, rocket) : JSON.stringify(rocket);
    if (cod !== undefined) data.cod = existing ? mergeConfig(existing.cod, cod) : JSON.stringify(cod);

    const gateway = await (prisma as any).paymentGateway.upsert({
      where: { storeId },
      update: data,
      create: { storeId, ...data },
    });

    return NextResponse.json({ gateway: { storeId: gateway.storeId } });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update gateway" }, { status: 500 });
  }
}
