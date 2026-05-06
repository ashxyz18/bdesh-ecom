import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint: track order by order number (no auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        shipping: true,
        store: { select: { name: true, subdomain: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Return limited info for public tracking
    const trackingData = {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: Number(order.total),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      storeName: (order as any).store?.name || "",
      trackingCode: (order as any).shipping?.trackingCode || null,
      deliveredAt: (order as any).shipping?.deliveredAt || null,
      shippingCity: (order as any).shipping?.city || "",
      shippingDistrict: (order as any).shipping?.district || "",
      itemCount: order.items.length,
      items: order.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
      })),
    };

    return NextResponse.json({ order: trackingData });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
