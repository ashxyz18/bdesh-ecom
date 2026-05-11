import { NextRequest, NextResponse } from "next/server";
import { categories } from "@/lib/data-store";

interface RouteParams {
  params: Promise<{ storeId: string; categoryId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { categoryId } = await params;
    const category = categories.get(categoryId);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, image, icon, sortOrder, active, parentId } = body;

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (icon !== undefined) category.icon = icon;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (active !== undefined) category.active = active;
    if (parentId !== undefined) category.parentId = parentId || undefined;

    categories.set(categoryId, category);
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { categoryId } = await params;
    if (!categories.has(categoryId)) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    categories.delete(categoryId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}