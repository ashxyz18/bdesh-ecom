import { NextRequest, NextResponse } from "next/server";
import { flashSales, createFlashSale } from "@/lib/data-store";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const sales = Array.from(flashSales.values())
      .filter((s) => s.storeId === storeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ success: true, flashSales: sales });
  } catch (error) {
    console.error("Get flash sales error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    const { name, discountPercent, startDate, endDate, productIds } = body;

    if (!name || discountPercent === undefined) {
      return NextResponse.json({ error: "Name and discount percent are required" }, { status: 400 });
    }

    const sale = createFlashSale(storeId, {
      name,
      discountPercent,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      productIds: productIds || [],
      status: "active",
    });

    return NextResponse.json({ success: true, flashSale: sale }, { status: 201 });
  } catch (error) {
    console.error("Create flash sale error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}