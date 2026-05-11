import { NextRequest, NextResponse } from "next/server";
import { getCategoriesByStoreId, categories, generateSlug, generateId } from "@/lib/data-store";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const cats = getCategoriesByStoreId(storeId).sort((a, b) => a.sortOrder - b.sortOrder);
    return NextResponse.json({ success: true, categories: cats });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    const { name, description, parentId, image, icon, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const existing = getCategoriesByStoreId(storeId).find(
      (c) => c.slug === generateSlug(name) && c.parentId === (parentId || undefined)
    );
    if (existing) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 409 });
    }

    const id = generateId();
    const category = {
      id,
      storeId,
      name,
      slug: generateSlug(name),
      description: description || "",
      parentId: parentId || undefined,
      image: image || "",
      icon: icon || "",
      sortOrder: sortOrder || 0,
      productCount: 0,
      active: true,
      createdAt: new Date(),
    };

    categories.set(id, category);
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}