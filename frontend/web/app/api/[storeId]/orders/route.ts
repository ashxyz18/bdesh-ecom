import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateOrderNumber } from "@bdesh/shared";
import { orderCreateSchema } from "@bdesh/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const session = await requireAuth();
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store || store.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: { storeId },
      include: { items: true, shipping: true, payment: true },
      orderBy: { createdAt: "desc" },
    });

    // Parse JSON strings for SQLite compatibility
    const parsedOrders = orders.map((order: any) => ({
      ...order,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      items: order.items.map((item: any) => ({
        ...item,
        price: Number(item.price),
        image: (() => { try { const v = JSON.parse(item.image || 'null'); return v; } catch { return item.image || null; } })(),
      })),
    }));

    return NextResponse.json({ orders: parsedOrders });
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
    const body = await req.json();
    const { items, shipping, paymentMethod, notes } = orderCreateSchema.parse(body);

    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, storeId },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { message: "Some products not found" },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId)!;
      const lineTotal = Number(product.price) * item.quantity;
      subtotal += lineTotal;
      // Parse images from JSON string and get first image (SQLite compatibility)
      const images = JSON.parse((product.images as any) || "[]");
      return {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: Number(product.price),
        quantity: item.quantity,
        image: JSON.stringify(images[0] || null),
      };
    });

    const shippingCost = 60; // Default BD shipping
    const total = subtotal + shippingCost;

    const order = await prisma.order.create({
      data: {
        storeId,
        orderNumber: generateOrderNumber(),
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod,
        subtotal,
        shippingCost,
        total,
        notes,
        items: { create: orderItems as any },
        shipping: {
          create: {
            name: shipping.name,
            phone: shipping.phone,
            address: shipping.address,
            city: shipping.city,
            district: shipping.district,
            postalCode: shipping.postalCode || "",
          },
        },
        payment: {
          create: {
            amount: total,
            method: paymentMethod,
            status: "PENDING",
          },
        },
      },
      include: { items: true, shipping: true, payment: true },
    });

    // Parse response
    const parsedOrder = {
      ...order,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      items: (order.items as any).map((item: any) => ({
        ...item,
        price: Number(item.price),
        image: JSON.parse(item.image || '"null"') || null,
      })),
    };

    return NextResponse.json({ order: parsedOrder });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 400 }
    );
  }
}
