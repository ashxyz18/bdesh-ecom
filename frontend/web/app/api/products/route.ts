import { NextRequest, NextResponse } from "next/server";
import { getProductsByStoreId, createProduct, stores } from "@/lib/data-store";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get("storeId");
    if (!storeId) {
      return NextResponse.json({ error: "storeId is required" }, { status: 400 });
    }

    const store = stores.get(storeId);
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const products = getProductsByStoreId(storeId);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, name, price, description, images, stock } = body;

    if (!storeId || !name || price === undefined) {
      return NextResponse.json(
        { error: "storeId, name, and price are required" },
        { status: 400 }
      );
    }

    const store = stores.get(storeId);
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const product = createProduct(storeId, {
      name,
      price,
      description,
      images: images || [],
      stock: stock || 0,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}