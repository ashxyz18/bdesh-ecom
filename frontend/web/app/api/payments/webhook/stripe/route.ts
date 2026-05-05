import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/payments/webhook/stripe — Handle Stripe webhook events
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ message: "Missing signature" }, { status: 400 });
    }

    // Get Stripe config from env (platform-level, not per-store)
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secretKey || !webhookSecret) {
      return NextResponse.json({ message: "Stripe not configured" }, { status: 500 });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secretKey);

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error("Stripe webhook signature verification failed:", err.message);
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    // Handle event types
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        const storeId = paymentIntent.metadata?.storeId;

        if (orderId) {
          await prisma.payment.updateMany({
            where: { orderId, method: "CARD" },
            data: {
              status: "PAID",
              trxId: paymentIntent.id,
              paidAt: new Date(),
            },
          });

          await prisma.order.updateMany({
            where: { id: orderId },
            data: { paymentStatus: "PAID" },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await prisma.payment.updateMany({
            where: { orderId, method: "CARD" },
            data: { status: "FAILED" },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const storeId = subscription.metadata?.storeId;

        if (storeId) {
          const status = subscription.status === "active" ? "ACTIVE" :
                         subscription.status === "past_due" ? "PAST_DUE" :
                         subscription.status === "canceled" ? "CANCELLED" : "EXPIRED";

          await (prisma as any).subscription.updateMany({
            where: { storeId, metadata: { contains: subscription.id } },
            data: { status },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const storeId = subscription.metadata?.storeId;

        if (storeId) {
          await (prisma as any).subscription.updateMany({
            where: { storeId },
            data: { status: "EXPIRED", cancelledAt: new Date() },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { message: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
