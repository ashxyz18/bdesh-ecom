import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaymentIntent, parseGatewayConfig, type GatewayType } from "@/lib/payment-gateway";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, items, customerInfo, paymentMethod, total, shipping } = body;

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const order = await prisma.order.create({
      data: {
        storeId,
        orderNumber,
        paymentMethod,
        subtotal: Number(total),
        shippingCost: 0,
        total: Number(total),
        shipping: shipping ? {
          create: {
            name: shipping.name,
            phone: shipping.phone,
            address: shipping.address,
            city: shipping.city || "",
            district: shipping.district || "",
            postalCode: "",
          },
        } : undefined,
        payment: {
          create: {
            amount: Number(total),
            method: paymentMethod,
            status: "PENDING",
          },
        },
        items: {
          create: items.map((item: any) => {
            const productId = item.product?.id || item.productId;
            const quantity = item.quantity;
            const price = item.product?.price || item.price;
            const name = item.product?.name || item.name || "";
            let image = item.image || null;
            if (!image && item.product?.images) {
              image = typeof item.product.images === "string"
                ? JSON.parse(item.product.images)[0] || null
                : (item.product.images?.[0] || null);
            }
            
            return {
              productId,
              quantity,
              price,
              name,
              image,
            };
          }),
        },
      },
      include: { payment: true, items: true, shipping: true },
    });

    // If not COD, create a payment intent with the configured gateway
    let paymentData = null;
    if (paymentMethod !== "CASH_ON_DELIVERY" && paymentMethod !== "COD") {
      try {
        const gateway = await (prisma as any).paymentGateway.findUnique({
          where: { storeId },
        });

        if (gateway) {
          const methodMap: Record<string, GatewayType> = {
            BKASH: "bkash",
            NAGAD: "nagad",
            ROCKET: "rocket",
            CARD: "stripe",
          };

          const gw = methodMap[paymentMethod];
          if (gw) {
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
                orderId: String(order.id),
                amount: Number(total),
                method: gw,
                customerInfo,
                returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/payments/callback/${gw}`,
              },
              gatewayConfigs
            );

            // Update payment with gateway ID
            if (result.gatewayId && order.payment) {
              await prisma.payment.update({
                where: { id: String(order.payment.id) },
                data: { trxId: result.gatewayId },
              });
            }

            paymentData = {
              clientSecret: result.clientSecret,
              redirectUrl: result.redirectUrl,
              method: result.method,
            };
          }
        }
      } catch (err) {
        console.error("Payment intent creation failed:", err);
        // Order is still created, payment can be completed manually
      }
    }

    return NextResponse.json({ order, payment: paymentData });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to create order" },
      { status: 400 }
    );
  }
}
