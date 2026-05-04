import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; orderId: string }> }
) {
  try {
    const { storeId, orderId } = await params;
    const session = await requireAuth();

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store || (store.ownerId !== session.user.id && session.user.role !== "ADMIN")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId, storeId },
      include: { items: true, shipping: true, payment: true, customer: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Parse JSON strings for SQLite compatibility
    const parsedOrder = {
      ...order,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      items: order.items.map((item: any) => ({
        ...item,
        price: Number(item.price),
        image: JSON.parse(item.image || '"null"') || null,
      })),
    };

    return NextResponse.json({ order: parsedOrder });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; orderId: string }> }
) {
  try {
    const { storeId, orderId } = await params;
    const session = await requireAuth();
    const body = await req.json();

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store || (store.ownerId !== session.user.id && session.user.role !== "ADMIN")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId, storeId },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus;
    if (body.trackingCode) {
      updateData.shipping = { update: { trackingCode: body.trackingCode } };
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { items: true, shipping: true, payment: true },
    });

    // Parse response
    const parsedOrder = {
      ...updated,
      total: Number(updated.total),
      subtotal: Number(updated.subtotal),
      shippingCost: Number(updated.shippingCost),
      items: updated.items.map((item: any) => ({
        ...item,
        price: Number(item.price),
        image: JSON.parse(item.image || '"null"') || null,
      })),
    };

    return NextResponse.json({ order: parsedOrder });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 400 }
    );
  }
}
