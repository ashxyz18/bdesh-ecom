import { NextRequest, NextResponse } from "next/server";
import { stores, getProductsByStoreId } from "@/lib/data-store";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const store = stores.get(storeId);

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const products = getProductsByStoreId(storeId);

    return NextResponse.json({
      name: store.name,
      logo: store.logo,
      theme: store.theme,
      settings: store.settings,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        images: p.images,
        stock: p.stock,
        status: p.status,
      })),
    });
  } catch (error) {
    console.error("Get store error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}