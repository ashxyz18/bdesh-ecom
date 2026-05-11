import { NextRequest, NextResponse } from "next/server";
import { orders, OrderStatus } from "@/lib/data-store";

interface RouteParams {
  params: Promise<{ storeId: string; orderId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const order = orders.get(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const order = orders.get(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      status,
      paymentStatus,
      notes,
      trackingId,
      trackingUrl,
      courier,
    } = body;

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (notes !== undefined) order.notes = notes;
    if (trackingId) order.trackingId = trackingId;
    if (trackingUrl) order.trackingUrl = trackingUrl;
    if (courier) order.courier = courier;
    order.updatedAt = new Date();

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const order = orders.get(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    orders.delete(orderId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}