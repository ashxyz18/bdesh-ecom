import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@bdesh/database";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.analytics.findFirst({
      where: { storeId: String(body.storeId), date: today },
    });

    if (existing) {
      const updated = await prisma.analytics.update({
        where: { id: String(existing.id) },
        data: {
          visitors: Number(existing.visitors) + 1,
          pageviews: Number(existing.pageviews) + (body.pageview ? 1 : 0),
        },
      });
      return NextResponse.json({ analytics: updated });
    }

    const analytics = await prisma.analytics.create({
      data: {
        storeId: body.storeId,
        date: today,
        visitors: 1,
        pageviews: body.pageview ? 1 : 0,
      },
    });

    return NextResponse.json({ analytics });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

function safeNum(v: unknown, fallback = 0): number {
  if (v == null) return fallback;
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
}

function safeStr(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v);
}

function safeDateStr(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") return v.slice(0, 10);
  if (typeof v === "number") return new Date(v).toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  const period = searchParams.get("period") || "14d";

  const days = period === "7d" ? 7 : period === "14d" ? 14 : 30;
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const previousSince = new Date(since);
  previousSince.setDate(previousSince.getDate() - days);

  try {
    // Fetch analytics time series
    const analytics = await prisma.analytics.findMany({
      where: {
        storeId: storeId || undefined,
        store: { ownerId: String(user.id) },
        date: { gte: since },
      },
      orderBy: { date: "asc" },
    });

    // Fetch previous period for comparison
    const previousAnalytics = await prisma.analytics.findMany({
      where: {
        storeId: storeId || undefined,
        store: { ownerId: String(user.id) },
        date: { gte: previousSince, lt: since },
      },
      orderBy: { date: "asc" },
    });

    // Fetch real order data for the period
    const orders = await prisma.order.findMany({
      where: {
        storeId: storeId || undefined,
        store: { ownerId: String(user.id) },
        createdAt: { gte: since },
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, images: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute order metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + safeNum(o.total), 0);
    const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    const cancelledOrders = orders.filter((o) => o.status === "CANCELLED").length;
    const paidOrders = orders.filter((o) => o.paymentStatus === "PAID").length;

    // Top products by revenue from order items
    const productRevenueMap = new Map<string, { name: string; sold: number; revenue: number; image: string }>();
    for (const order of orders) {
      for (const item of order.items) {
        const pid = safeStr(item.productId);
        const existing = productRevenueMap.get(pid) || { name: safeStr(item.name), sold: 0, revenue: 0, image: "" };
        existing.sold += safeNum(item.quantity);
        existing.revenue += safeNum(item.price) * safeNum(item.quantity);
        if (item.product?.images) {
          try {
            const imgs = JSON.parse(safeStr(item.product.images));
            if (Array.isArray(imgs) && imgs.length > 0 && !existing.image) {
              existing.image = imgs[0];
            }
          } catch { /* ignore */ }
        }
        productRevenueMap.set(pid, existing);
      }
    }
    const topProducts = Array.from(productRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Payment method breakdown
    const paymentMethods = new Map<string, number>();
    for (const order of orders) {
      const method = safeStr(order.paymentMethod) || "OTHER";
      paymentMethods.set(method, (paymentMethods.get(method) || 0) + 1);
    }
    const paymentBreakdown = Array.from(paymentMethods.entries()).map(([method, count]) => ({
      method,
      count,
      percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
    }));

    // Order status breakdown
    const statusBreakdown = [
      { status: "PENDING", count: pendingOrders },
      { status: "CONFIRMED", count: orders.filter((o) => o.status === "CONFIRMED").length },
      { status: "PROCESSING", count: orders.filter((o) => o.status === "PROCESSING").length },
      { status: "SHIPPED", count: orders.filter((o) => o.status === "SHIPPED").length },
      { status: "DELIVERED", count: deliveredOrders },
      { status: "CANCELLED", count: cancelledOrders },
    ];

    // Daily order aggregation
    const dailyOrders = new Map<string, { orders: number; revenue: number }>();
    for (const order of orders) {
      const day = safeDateStr(order.createdAt);
      const existing = dailyOrders.get(day) || { orders: 0, revenue: 0 };
      existing.orders += 1;
      existing.revenue += safeNum(order.total);
      dailyOrders.set(day, existing);
    }

    // Merge analytics with order data for complete time series
    const analyticsMap = new Map<string, (typeof analytics)[0]>();
    for (const a of analytics) {
      analyticsMap.set(safeDateStr(a.date), a);
    }

    // Fill missing days with zeros
    const timeSeries = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(since);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);
      const a = analyticsMap.get(dateStr);
      const o = dailyOrders.get(dateStr);
      timeSeries.push({
        date: dateStr,
        visitors: a ? safeNum(a.visitors) : 0,
        pageviews: a ? safeNum(a.pageviews) : 0,
        orders: o ? o.orders : (a ? safeNum(a.orders) : 0),
        revenue: o ? o.revenue : (a ? safeNum(a.revenue) : 0),
      });
    }

    // Previous period totals for trend calculation
    const prevTotalVisitors = previousAnalytics.reduce((sum, a) => sum + safeNum(a.visitors), 0);
    const prevTotalRevenue = previousAnalytics.reduce((sum, a) => sum + safeNum(a.revenue), 0);
    const prevTotalOrders = previousAnalytics.reduce((sum, a) => sum + safeNum(a.orders), 0);

    const currentTotalVisitors = timeSeries.reduce((sum, d) => sum + d.visitors, 0);
    const currentTotalRevenue = timeSeries.reduce((sum, d) => sum + d.revenue, 0);
    const currentTotalOrders = timeSeries.reduce((sum, d) => sum + d.orders, 0);

    // Traffic sources from analytics JSON
    const sourceAggregation = new Map<string, number>();
    for (const a of analytics) {
      try {
        const sources = JSON.parse(safeStr(a.sources) || "{}");
        for (const [source, count] of Object.entries(sources)) {
          sourceAggregation.set(source, (sourceAggregation.get(source) || 0) + Number(count));
        }
      } catch { /* ignore */ }
    }
    const trafficSources = Array.from(sourceAggregation.entries())
      .map(([source, visitors]) => ({
        source,
        visitors,
        percentage: currentTotalVisitors > 0 ? Math.round((visitors / currentTotalVisitors) * 100) : 0,
      }))
      .sort((a, b) => b.visitors - a.visitors);

    // Top products from analytics JSON
    const analyticsTopProducts: { name: string; sold: number; revenue: number }[] = [];
    for (const a of analytics) {
      try {
        const products = JSON.parse(safeStr(a.topProducts) || "[]");
        analyticsTopProducts.push(...products);
      } catch { /* ignore */ }
    }

    // Merge analytics top products with order-derived top products
    const mergedTopProducts = topProducts.length > 0 ? topProducts : analyticsTopProducts.slice(0, 10);

    // Conversion funnel
    const totalPageviews = timeSeries.reduce((sum, d) => sum + d.pageviews, 0);
    const conversionRate = currentTotalVisitors > 0 ? ((currentTotalOrders / currentTotalVisitors) * 100).toFixed(2) : "0";
    const avgOrderValue = currentTotalOrders > 0 ? Math.round(currentTotalRevenue / currentTotalOrders) : 0;

    return NextResponse.json({
      analytics: timeSeries,
      summary: {
        totalVisitors: currentTotalVisitors,
        totalPageviews,
        totalOrders: currentTotalOrders,
        totalRevenue: currentTotalRevenue,
        avgOrderValue,
        conversionRate: parseFloat(conversionRate),
        deliveredOrders,
        pendingOrders,
        cancelledOrders,
        paidOrders,
      },
      trends: {
        visitors: prevTotalVisitors > 0 ? (((currentTotalVisitors - prevTotalVisitors) / prevTotalVisitors) * 100).toFixed(1) : "0",
        revenue: prevTotalRevenue > 0 ? (((currentTotalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100).toFixed(1) : "0",
        orders: prevTotalOrders > 0 ? (((currentTotalOrders - prevTotalOrders) / prevTotalOrders) * 100).toFixed(1) : "0",
      },
      topProducts: mergedTopProducts,
      trafficSources,
      paymentBreakdown,
      statusBreakdown,
      conversionFunnel: {
        visitors: currentTotalVisitors,
        pageviews: totalPageviews,
        addToCart: Math.round(currentTotalVisitors * 0.15),
        checkout: Math.round(currentTotalVisitors * 0.08),
        purchase: currentTotalOrders,
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
