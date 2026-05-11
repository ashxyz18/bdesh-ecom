import { NextRequest, NextResponse } from "next/server";
import { getProductsByStoreId, createProduct, stores, products } from "@/lib/data-store";

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

    const search = request.nextUrl.searchParams.get("search");
    const category = request.nextUrl.searchParams.get("category");
    const status = request.nextUrl.searchParams.get("status");

    let productList = getProductsByStoreId(storeId);

    if (search) {
      const q = search.toLowerCase();
      productList = productList.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (category) {
      productList = productList.filter((p) => p.categoryId === category);
    }
    if (status) {
      productList = productList.filter((p) => p.status === status);
    }

    return NextResponse.json({ success: true, products: productList });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, name, price, description, images, stock, categoryId, tags, variants, status, comparePrice, costPrice, lowStockThreshold, seo, weight, dimensions, slug } = body;

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
      categoryId,
      tags: tags || [],
      variants: variants || [],
      status: status || "active",
      comparePrice,
      costPrice,
      lowStockThreshold,
      seo,
      weight,
      dimensions,
      slug,
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}