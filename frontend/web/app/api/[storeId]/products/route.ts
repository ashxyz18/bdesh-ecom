import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { productSchema } from "@bdesh/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const q = searchParams.get("q");

    const where: any = { storeId };

    if (status) where.status = status;
    if (featured === "true") where.featured = true;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: { variants: true, collections: true },
      orderBy: { createdAt: "desc" },
    });

    // Parse JSON fields for SQLite compatibility
    const parsed = products.map((p: any) => ({
      ...p,
      images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
      attributes: typeof p.attributes === "string" ? JSON.parse(p.attributes) : p.attributes,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    }));

    return NextResponse.json({ products: parsed });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const session = await requireAuth();
    const body = await req.json();
    const data = productSchema.parse(body);

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store || store.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice ?? null,
        sku: data.sku,
        barcode: data.barcode,
        quantity: data.quantity,
        trackStock: data.trackStock,
        status: data.status,
        featured: data.featured,
        images: JSON.stringify(data.images || []),
        attributes: JSON.stringify(data.attributes || []),
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        storeId,
      },
    });

    return NextResponse.json({
      product: {
        ...product,
        images: JSON.parse(product.images as string),
        attributes: JSON.parse(product.attributes as string),
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 400 }
    );
  }
}
