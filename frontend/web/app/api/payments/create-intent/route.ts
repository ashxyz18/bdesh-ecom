import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  createPaymentIntent,
  parseGatewayConfig,
  type GatewayType,
} from "@/lib/payment-gateway";

// POST /api/payments/create-intent — Create a payment intent for an order
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId, orderId, amount, method, customerInfo, returnUrl } = body;

    if (!storeId || !orderId || !amount || !method) {
      return NextResponse.json(
        { message: "storeId, orderId, amount, and method are required" },
        { status: 400 }
      );
    }

    const validMethods: GatewayType[] = ["stripe", "bkash", "nagad", "rocket", "cod"];
    if (!validMethods.includes(method)) {
      return NextResponse.json({ message: "Invalid payment method" }, { status: 400 });
    }

    // Get store's payment gateway config
    const gateway = await (prisma as any).paymentGateway.findUnique({
      where: { storeId },
    });

    if (!gateway) {
      return NextResponse.json(
        { message: "Payment gateway not configured for this store" },
        { status: 400 }
      );
    }

    // Parse all gateway configs
    const gatewayConfigs = {
      stripe: parseGatewayConfig(gateway.stripe as string, "stripe"),
      bkash: parseGatewayConfig(gateway.bkash as string, "bkash"),
      nagad: parseGatewayConfig(gateway.nagad as string, "nagad"),
      rocket: parseGatewayConfig(gateway.rocket as string, "rocket"),
      cod: parseGatewayConfig(gateway.cod as string, "cod"),
    };

    const result = await createPaymentIntent(
      {
        storeId,
        orderId,
        amount: Number(amount),
        method,
        customerInfo,
        returnUrl,
      },
      gatewayConfigs
    );

    // Update payment record with gateway ID
    if (result.gatewayId) {
      await prisma.payment.updateMany({
        where: { orderId },
        data: {
          trxId: result.gatewayId,
          status: result.status === "SUCCEEDED" ? "PAID" : "PENDING",
        },
      });
    }

    return NextResponse.json({ payment: result });
  } catch (error: any) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
