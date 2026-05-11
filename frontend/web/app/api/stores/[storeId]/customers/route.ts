import { NextRequest, NextResponse } from "next/server";
import { getCustomersByStoreId } from "@/lib/data-store";

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

    let custList = getCustomersByStoreId(storeId);

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