import { NextRequest, NextResponse } from "next/server";
import { getOrdersByStoreId, createOrder, prisma, serializeOrderList, serializeOrder } from "@/lib/db";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const url = request.nextUrl;
    const status = url.searchParams.get("status");
    const paymentStatus = url.searchParams.get("paymentStatus");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const orders = await getOrdersByStoreId(storeId);
    let orderList = serializeOrderList(orders);

    if (status) {
      orderList = orderList.filter((o) => o?.status === status);
    }
    if (paymentStatus) {
      orderList = orderList.filter((o) => o?.paymentStatus === paymentStatus);
    }
    if (search) {
      const q = search.toLowerCase();
      orderList = orderList.filter(
        (o) =>
          o?.orderNumber.toLowerCase().includes(q) ||
          o?.customerInfo.name.toLowerCase().includes(q) ||
          o?.customerInfo.phone.includes(q)
      );
    }

    const total = orderList.length;
    const totalRevenue = orderList.reduce((sum, o) => sum + (o?.total || 0), 0);
    const totalPending = orderList.filter((o) => o?.status === "pending").length;

    const start = (page - 1) * limit;
    const paginatedOrders = orderList.slice(start, start + limit);

    const statusCounts = {
      pending: orderList.filter((o) => o?.status === "pending").length,
      confirmed: orderList.filter((o) => o?.status === "confirmed").length,
      processing: orderList.filter((o) => o?.status === "processing").length,
      shipped: orderList.filter((o) => o?.status === "shipped").length,
      delivered: orderList.filter((o) => o?.status === "delivered").length,
      cancelled: orderList.filter((o) => o?.status === "cancelled").length,
      returned: 0,
    };

    return NextResponse.json({
      success: true,
      orders: paginatedOrders,
      total,
      totalRevenue,
      totalPending,
      statusCounts,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    const {
      customerInfo,
      shippingAddress,
      items,
      paymentMethod,
      couponId,
      couponCode,
      notes,
      source,
    } = body;

    if (!customerInfo?.name || !customerInfo?.phone) {
      return NextResponse.json({ error: "Customer name and phone are required" }, { status: 400 });
    }

    if (!items?.length) {
      return NextResponse.json({ error: "Order must have at least one item" }, { status: 400 });
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number; discount?: number }) =>
        sum + (item.price * item.quantity - (item.discount || 0)),
      0
    );
    const deliveryFee = subtotal > 1500 ? 0 : 120;
    const total = subtotal + deliveryFee;

    const order = await createOrder(storeId, {
      customerInfo,
      shippingAddress: shippingAddress || {
        name: customerInfo.name,
        phone: customerInfo.phone,
        addressLine1: "",
        city: "",
        district: "",
        country: "Bangladesh",
      },
      items,
      subtotal,
      discount: 0,
      deliveryFee,
      total,
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentMethod === "cod" ? "unpaid" : "paid",
      notes: notes || "",
      couponId,
      couponCode,
    });

    return NextResponse.json({ success: true, order: serializeOrder(order) }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    const { orderIds, status } = body;

    if (!orderIds?.length || !status) {
      return NextResponse.json({ error: "orderIds and status are required" }, { status: 400 });
    }

    const updatedOrders = [];
    for (const orderId of orderIds) {
      const order = await prisma.order.findFirst({
        where: { id: orderId, storeId },
      });
      if (order) {
        const updated = await prisma.order.update({
          where: { id: orderId },
          data: { status: status.toUpperCase().replace(/-/g, "_") },
          include: { items: true, shipping: true },
        });
        updatedOrders.push(serializeOrder(updated));
      }
    }

    return NextResponse.json({ success: true, updatedOrders });
  } catch (error) {
    console.error("Bulk update orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
