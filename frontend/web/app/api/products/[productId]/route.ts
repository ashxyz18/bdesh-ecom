import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/data-store";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    const product = products.get(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    const product = products.get(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, price, comparePrice, description, images, stock, status, variants } = body;

    // Update fields
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (comparePrice !== undefined) product.comparePrice = comparePrice;
    if (description !== undefined) product.description = description;
    if (images !== undefined) product.images = images;
    if (stock !== undefined) product.stock = stock;
    if (status !== undefined) product.status = status;
    if (variants !== undefined) product.variants = variants;

    products.set(productId, product);

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    const product = products.get(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    products.delete(productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}