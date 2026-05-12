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
    const status = url.searchParams.get("status") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where: where as any,
        include: { owner: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.store.count({ where: where as any }),
    ]);

    return NextResponse.json({
      success: true,
      stores: stores.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        status: s.status,
        websiteType: s.websiteType,
        owner: s.owner,
        createdAt: s.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Site admin stores error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
