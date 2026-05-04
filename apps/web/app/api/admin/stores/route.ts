import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/admin/stores — List all stores (ADMIN only)
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { subdomain: { contains: search } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          subdomain: true,
          description: true,
          status: true,
          createdAt: true,
          owner: {
            select: { id: true, name: true, email: true },
          },
          _count: { select: { products: true, orders: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.store.count({ where }),
    ]);

    return NextResponse.json({ stores, total, page, limit });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch stores" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
