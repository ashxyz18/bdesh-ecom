import { NextRequest, NextResponse } from "next/server";
import { prisma, getProductsByStoreId, parseStoreJson } from "@/lib/db";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const store = await prisma.store.findFirst({ where: { id: storeId, deletedAt: null } });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const parsed = parseStoreJson(store);
    if (!parsed) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const products = await getProductsByStoreId(storeId);

    return NextResponse.json({
      name: parsed.name,
      logo: parsed.logo,
      theme: parsed.theme,
      settings: parsed.settings,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
        stock: p.quantity,
        status: p.status,
      })),
    });
  } catch (error) {
    console.error("Get store error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
