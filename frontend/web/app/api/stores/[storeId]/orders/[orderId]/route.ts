import { NextRequest, NextResponse } from "next/server";
import { prisma, getOrderById, deleteOrder, serializeOrder } from "@/lib/db";

interface RouteParams {
  params: Promise<{ storeId: string; orderId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: serializeOrder(order) });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status, paymentStatus, notes, trackingId, trackingUrl } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status.toUpperCase().replace(/-/g, "_");
    if (paymentStatus) updateData.paymentStatus = paymentStatus.toUpperCase();
    if (notes !== undefined) updateData.notes = notes;
    if (trackingId && !trackingUrl) updateData.trackingId = trackingId;
    if (trackingUrl && !trackingId) updateData.trackingUrl = trackingUrl;

    if (trackingId || trackingUrl) {
      await prisma.shipping.upsert({
        where: { orderId },
        create: { orderId, name: "", phone: "", address: "", city: "", district: "", postalCode: "", trackingCode: trackingId || undefined },
        update: { trackingCode: trackingId || undefined },
      });
    }

    await prisma.order.update({ where: { id: orderId }, data: updateData });
    const final = await getOrderById(orderId);

    return NextResponse.json({ success: true, order: serializeOrder(final) });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await deleteOrder(orderId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
