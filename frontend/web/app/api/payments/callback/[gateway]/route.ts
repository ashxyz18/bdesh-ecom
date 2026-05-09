import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayment, parseGatewayConfig, type GatewayType } from "@/lib/payment-gateway";

function safeStr(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v);
}

// GET /api/payments/callback/[gateway] — Handle redirect callbacks from bKash/Nagad/Rocket
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ gateway: string }> }
) {
  try {
    const { gateway } = await params;
    const searchParams = req.nextUrl.searchParams;

    const validGateways: GatewayType[] = ["bkash", "nagad", "rocket"];
    if (!validGateways.includes(gateway as GatewayType)) {
      return NextResponse.redirect(new URL("/payment/failed", req.url));
    }

    // Extract payment ID from callback params
    let paymentId = "";
    switch (gateway) {
      case "bkash":
        paymentId = searchParams.get("paymentID") || searchParams.get("payment_id") || "";
        break;
      case "nagad":
        paymentId = searchParams.get("paymentRefId") || searchParams.get("payment_reference") || "";
        break;
      case "rocket":
        paymentId = searchParams.get("paymentId") || searchParams.get("payment_id") || "";
        break;
    }

    if (!paymentId) {
      return NextResponse.redirect(new URL("/payment/failed?reason=no_payment_id", req.url));
    }

    // Find the payment by trxId (gateway payment ID)
    const payment = await prisma.payment.findFirst({
      where: { trxId: paymentId },
      include: { order: { include: { store: true } } },
    });

    if (!payment) {
      return NextResponse.redirect(new URL("/payment/failed?reason=not_found", req.url));
    }

    // Get store's gateway config
    const gatewayRecord = await (prisma as any).paymentGateway.findUnique({
      where: { storeId: safeStr(payment.order.storeId) },
    });

    if (!gatewayRecord) {
      return NextResponse.redirect(new URL("/payment/failed?reason=no_config", req.url));
    }

    const config = parseGatewayConfig(
      gatewayRecord[gateway] as string,
      gateway as GatewayType
    );

    // Verify payment with gateway
    const result = await verifyPayment(gateway as GatewayType, paymentId, config);

    // Update payment status
    await prisma.payment.update({
      where: { id: safeStr(payment.id) },
      data: {
        status: result.status,
        trxId: result.trxId ?? safeStr(payment.trxId),
        paidAt: result.paidAt,
      },
    });

    // Update order payment status
    if (result.verified) {
      await prisma.order.update({
        where: { id: safeStr(payment.orderId) },
        data: { paymentStatus: "PAID" },
      });
    }

    // Redirect to store's payment result page
    const storeSubdomain = safeStr((payment.order as any).store?.subdomain);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://bdesh.shop";
    const orderNumber = safeStr((payment.order as any).orderNumber);

    if (result.verified) {
      return NextResponse.redirect(
        new URL(`/store?subdomain=${storeSubdomain}&payment=success&order=${orderNumber}`, baseUrl)
      );
    } else {
      return NextResponse.redirect(
        new URL(`/store?subdomain=${storeSubdomain}&payment=failed&order=${orderNumber}`, baseUrl)
      );
    }
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(new URL("/payment/failed?reason=error", req.url));
  }
}
