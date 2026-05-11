import { NextRequest, NextResponse } from "next/server";
import { stores, getStoreByOwnerId, getProductsByStoreId } from "@/lib/data-store";

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

    return NextResponse.json({ store, products });
  } catch (error) {
    console.error("Get store error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const store = stores.get(storeId);

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, logo, banner, theme, settings, templateId } = body;

    // Update store fields
    if (name !== undefined) store.name = name;
    if (description !== undefined) store.description = description;
    if (logo !== undefined) store.logo = logo;
    if (banner !== undefined) store.banner = banner;
    if (theme !== undefined) store.theme = { ...store.theme, ...theme };
    if (settings !== undefined) store.settings = { ...store.settings, ...settings };
    if (templateId !== undefined) store.templateId = templateId;

    stores.set(storeId, store);

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Update store error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}