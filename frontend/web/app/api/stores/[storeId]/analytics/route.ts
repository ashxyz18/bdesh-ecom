import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const url = request.nextUrl;
    const period = url.searchParams.get("period") || "30days";

    const orders = await prisma.order.findMany({
      where: { storeId },
      include: { items: true, shipping: true },
    });
    const products = await prisma.product.findMany({
      where: { storeId, deletedAt: null },
    });

    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "7days": startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case "30days": startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case "90days": startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      case "year": startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filteredOrders = orders.filter((o) => new Date(o.createdAt) >= startDate);

    const totalRevenue = filteredOrders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.total, 0);

    const totalOrders = filteredOrders.length;
    const totalProducts = products.length;
    const totalCustomers = new Set(filteredOrders.map((o) => o.shipping?.phone || o.id)).size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const cancelled = filteredOrders.filter((o) => o.status === "CANCELLED").length;
    const conversionRate = totalOrders > 0 ? ((totalOrders - cancelled) / totalOrders) * 100 : 0;

    const pendingOrders = filteredOrders.filter((o) => o.status === "PENDING").length;
    const processingOrders = filteredOrders.filter((o) => o.status === "CONFIRMED" || o.status === "PROCESSING").length;
    const shippedOrders = filteredOrders.filter((o) => o.status === "SHIPPED").length;
    const deliveredOrders = filteredOrders.filter((o) => o.status === "DELIVERED").length;

    const revenueByDay: Record<string, { revenue: number; orders: number }> = {};
    filteredOrders.forEach((o) => {
      if (o.status === "CANCELLED") return;
      const date = new Date(o.createdAt).toISOString().split("T")[0];
      if (!revenueByDay[date]) revenueByDay[date] = { revenue: 0, orders: 0 };
      revenueByDay[date].revenue += o.total;
      revenueByDay[date].orders += 1;
    });

    const revenueByDayArray = Object.entries(revenueByDay)
      .map(([date, data]) => ({ date, revenue: data.revenue, orders: data.orders }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const paymentMethods: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      paymentMethods[o.paymentMethod] = (paymentMethods[o.paymentMethod] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      analytics: {
        period,
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        averageOrderValue: Math.round(averageOrderValue),
        conversionRate: Math.round(conversionRate * 10) / 10,
        ordersByStatus: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
        },
        revenueByDay: revenueByDayArray,
        topProducts,
        courierPerformance: [],
        paymentMethods,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
