import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const { storeId, productId } = await params;
    const product = await prisma.product.findUnique({
      where: { id: productId, storeId },
      include: { variants: true, collections: true, reviews: true },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Parse JSON strings for SQLite compatibility
    const parsedProduct = {
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      images: JSON.parse(typeof product.images === "string" ? product.images : "[]"),
      attributes: JSON.parse(typeof product.attributes === "string" ? product.attributes : "{}"),
    };

    return NextResponse.json({ product: parsedProduct });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const { storeId, productId } = await params;
    const session = await requireAuth();
    const body = await req.json();

    const product = await prisma.product.findUnique({
      where: { id: productId, storeId },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store || (store.ownerId !== session.user.id && session.user.role !== "ADMIN")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name,
        description: body.description,
        price: body.price !== undefined ? body.price : undefined,
        comparePrice: body.comparePrice !== undefined ? body.comparePrice : undefined,
        sku: body.sku,
        barcode: body.barcode,
        quantity: body.quantity !== undefined ? body.quantity : undefined,
        trackStock: body.trackStock,
        status: body.status,
        featured: body.featured,
        images: body.images ? JSON.stringify(body.images) : undefined,
        attributes: body.attributes ? JSON.stringify(body.attributes) : undefined,
        seoTitle: body.seoTitle,
        seoDesc: body.seoDesc,
      },
    });

    // Parse JSON strings for response
    const parsedProduct = {
      ...updated,
      price: Number(updated.price),
      comparePrice: updated.comparePrice ? Number(updated.comparePrice) : null,
      images: JSON.parse(typeof updated.images === "string" ? updated.images : "[]"),
      attributes: JSON.parse(typeof updated.attributes === "string" ? updated.attributes : "{}"),
    };

    return NextResponse.json({ product: parsedProduct });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const { storeId, productId } = await params;
    const session = await requireAuth();

    const product = await prisma.product.findUnique({
      where: { id: productId, storeId },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store || (store.ownerId !== session.user.id && session.user.role !== "ADMIN")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 400 }
    );
  }
}
