import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// PATCH /api/admin/orders/[orderId] — Update order status/payment (ADMIN only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await requireAuth();
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { orderId } = await params;
    const body = await req.json();

    const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    const validPaymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }
    if (body.paymentStatus && !validPaymentStatuses.includes(body.paymentStatus)) {
      return NextResponse.json({ message: "Invalid payment status" }, { status: 400 });
    }

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
      },
    });

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update order" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
