import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    // For authenticated users, get their cart
    if (user) {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: user.id },
        include: { product: true },
      });
      return NextResponse.json({ items: cartItems });
    }

    // For guest users, get cart by sessionId
    if (sessionId) {
      const cartItems = await prisma.cartItem.findMany({
        where: { sessionId },
        include: { product: true },
      });
      return NextResponse.json({ items: cartItems });
    }

    return NextResponse.json({ items: [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { productId, quantity, sessionId } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "Product ID and quantity are required" },
        { status: 400 }
      );
    }

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.status !== "active") {
      return NextResponse.json(
        { error: "Product not found or unavailable" },
        { status: 404 }
      );
    }

    // Check stock if tracking enabled
    if (product.trackStock && product.quantity < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    // For authenticated users
    if (user) {
      const existingItem = await prisma.cartItem.findFirst({
        where: { userId: user.id, productId },
      });

      if (existingItem) {
        // Update quantity
        const updated = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
          include: { product: true },
        });
        return NextResponse.json({ item: updated });
      } else {
        // Create new cart item
        const newItem = await prisma.cartItem.create({
          data: {
            userId: user.id,
            productId,
            quantity,
          },
          include: { product: true },
        });
        return NextResponse.json({ item: newItem });
      }
    }

    // For guest users (require sessionId)
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required for guest cart" },
        { status: 400 }
      );
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { sessionId, productId },
    });

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
      return NextResponse.json({ item: updated });
    } else {
      const newItem = await prisma.cartItem.create({
        data: {
          sessionId,
          productId,
          quantity,
        },
        include: { product: true },
      });
      return NextResponse.json({ item: newItem });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add to cart" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: "Item ID and quantity are required" },
        { status: 400 }
      );
    }

    // Find the cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (user) {
      if (cartItem.userId !== user.id) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
      return NextResponse.json({ message: "Item removed from cart" });
    }

    // Check stock
    if (cartItem.productId) {
      const product = await prisma.product.findUnique({
        where: { id: cartItem.productId },
      });
      if (product?.trackStock && product.quantity < quantity) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true },
    });

    return NextResponse.json({ item: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const sessionId = searchParams.get("sessionId");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (user) {
      if (cartItem.userId !== user.id) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
