import { NextRequest, NextResponse } from "next/server";
import { prisma, isAdmin, serializeOrderList } from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const url = request.nextUrl;
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (status) where.status = status.toUpperCase().replace(/-/g, "_");

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: where as any,
        include: { items: true, shipping: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: where as any }),
    ]);

    return NextResponse.json({
      success: true,
      orders: serializeOrderList(orders),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Site admin orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
