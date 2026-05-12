import { NextRequest, NextResponse } from "next/server";
import { getCategoriesByStoreId, createCategory, prisma, generateSlug } from "@/lib/db";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const cats = await getCategoriesByStoreId(storeId);

    const mapped = cats.map((c) => ({
      id: c.id,
      storeId: c.storeId,
      name: c.name,
      slug: c.slug,
      description: c.description,
      parentId: null,
      image: c.image,
      icon: null,
      sortOrder: 0,
      productCount: 0,
      active: c.isVisible,
      createdAt: c.createdAt,
    })).sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({ success: true, categories: mapped });
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

    const existing = await prisma.collection.findFirst({
      where: { storeId, slug: generateSlug(name) },
    });
    if (existing) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 409 });
    }

    const category = await createCategory(storeId, name, { description, image, icon, sortOrder });

    return NextResponse.json({ success: true, category: {
      id: category.id,
      storeId: category.storeId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: null,
      image: category.image,
      icon: null,
      sortOrder: 0,
      productCount: 0,
      active: category.isVisible,
      createdAt: category.createdAt,
    } }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
