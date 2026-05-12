import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const url = request.nextUrl;
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const orders = await prisma.order.findMany({
      where: { storeId },
      include: { shipping: true },
    });

    type CustomerMapEntry = { name: string; phone: string; email: string | null; totalOrders: number; totalSpent: number };
    const customerMap = new Map<string, CustomerMapEntry>();

    for (const o of orders) {
      const key = o.shipping?.phone || o.id;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: o.shipping?.name || "",
          phone: o.shipping?.phone || "",
          email: null,
          totalOrders: 0,
          totalSpent: 0,
        });
      }
      const c = customerMap.get(key)!;
      c.totalOrders += 1;
      c.totalSpent += o.total;
      if (o.shipping?.phone) c.phone = o.shipping.phone;
      if (o.shipping?.name) c.name = o.shipping.name;
    }

    let custList = Array.from(customerMap.entries()).map(([id, data]) => ({
      id,
      storeId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      totalOrders: data.totalOrders,
      totalSpent: data.totalSpent,
      addresses: [] as unknown[],
      notes: null,
      tags: [] as string[],
      createdAt: new Date(),
    }));

    if (search) {
      const q = search.toLowerCase();
      custList = custList.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.email ? c.email.toLowerCase().includes(q) : false) ||
          c.phone.includes(q)
      );
    }

    const total = custList.length;
    const start = (page - 1) * limit;
    const paginated = custList.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      customers: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get customers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
