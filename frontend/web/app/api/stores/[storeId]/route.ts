import { NextRequest, NextResponse } from "next/server";
import { prisma, getProductsByStoreId, parseStoreJson } from "@/lib/db";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const store = await prisma.store.findUnique({ where: { id: storeId } });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const products = await getProductsByStoreId(storeId);

    return NextResponse.json({
      store: parseStoreJson(store),
      products: products.map((p) => ({
        id: p.id,
        storeId: p.storeId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        costPrice: null,
        images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
        categoryId: null,
        tags: [],
        stock: p.quantity,
        lowStockThreshold: 5,
        status: p.status,
        variants: [],
        seo: { title: p.seoTitle, description: p.seoDesc },
        weight: null,
        dimensions: null,
        metadata: {},
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get store error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const store = await prisma.store.findUnique({ where: { id: storeId } });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, logo, banner, theme, settings, templateId } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo;
    if (banner !== undefined) updateData.banner = banner;
    if (theme !== undefined) {
      const currentTheme = JSON.parse(store.theme || "{}");
      updateData.theme = JSON.stringify({ ...currentTheme, ...theme });
    }
    if (settings !== undefined) {
      const currentSettings = JSON.parse(store.settings || "{}");
      updateData.settings = JSON.stringify({ ...currentSettings, ...settings });
    }
    if (templateId !== undefined) {
      const currentTheme = JSON.parse(store.theme || "{}");
      updateData.theme = JSON.stringify({ ...currentTheme, templateId });
    }

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: updateData,
    });

    return NextResponse.json({ store: parseStoreJson(updated) });
  } catch (error) {
    console.error("Update store error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
