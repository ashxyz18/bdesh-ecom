import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId } = await params;
    const body = await req.json();
    const { deletedAt } = body;

    // Find the product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { store: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check ownership or admin
    if (
      session.user.role !== "ADMIN" &&
      product.store.ownerId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Soft delete or restore
    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        deletedAt: deletedAt ? new Date(deletedAt) : null,
        status: deletedAt ? "deleted" : "active",
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}
