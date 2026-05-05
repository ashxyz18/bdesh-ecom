import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/admin/stats — Platform statistics (ADMIN only)
export async function GET() {
  try {
    const session = await requireAuth();
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const [
      totalUsers,
      totalStores,
      totalOrders,
      totalProducts,
      totalTemplates,
      revenueResult,
      recentUsers,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.template.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalStores,
      totalOrders,
      totalProducts,
      totalTemplates,
      totalRevenue: revenueResult._sum.total || 0,
      recentUsers,
      recentOrders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch stats" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
