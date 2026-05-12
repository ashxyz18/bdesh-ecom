import { NextRequest, NextResponse } from "next/server";
import { prisma, isAdmin } from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [
      totalStores,
      totalUsers,
      totalProducts,
      totalOrders,
      totalTemplates,
      revenueAgg,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      prisma.store.count({ where: { deletedAt: null } }),
      prisma.user.count(),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.count(),
      (await import("@/lib/templates/registry")).getTemplates().then((t) => t.length),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.groupBy({ by: ["status"], _count: true }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { shipping: true, items: { take: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalStores,
        totalUsers,
        totalProducts,
        totalOrders,
        totalTemplates,
        totalRevenue: revenueAgg._sum.total || 0,
      },
      ordersByStatus: Object.fromEntries(
        ordersByStatus.map((o) => [o.status.toLowerCase(), o._count])
      ),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: o.total,
        status: o.status.toLowerCase(),
        customerName: o.shipping?.name || "Unknown",
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Site admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
