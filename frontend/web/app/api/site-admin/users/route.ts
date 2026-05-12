import { NextRequest, NextResponse } from "next/server";
import { prisma, isAdmin } from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const url = request.nextUrl;
    const search = url.searchParams.get("search") || "";
    const role = url.searchParams.get("role") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: where as any,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where: where as any }),
    ]);

    const userIds = users.map((u) => u.id);
    const storeCounts = await prisma.store.groupBy({
      by: ["ownerId"],
      where: { ownerId: { in: userIds }, deletedAt: null },
      _count: true,
    });
    const storeCountMap = new Map(storeCounts.map((s) => [s.ownerId, s._count]));

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.toLowerCase(),
        storeCount: storeCountMap.get(u.id) || 0,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Site admin users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
