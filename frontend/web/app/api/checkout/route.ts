import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rate-limit";
import { z } from "zod";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  shipping: z.object({
    name: z.string().min(1),
    phone: z.string().min(11),
    address: z.string().min(1),
    city: z.string().min(1),
    district: z.string().min(1),
    postalCode: z.string().optional(),
  }),
  paymentMethod: z.enum(["BKASH", "NAGAD", "ROCKET", "CASH_ON_DELIVERY", "CARD"]),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // Rate limit: 10 checkout attempts per hour per IP
  const rateResult = checkRateLimit(req, RATE_LIMITS.checkout, getClientIdentifier(req));
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait a moment." },
      { status: 429, headers: rateResult.headers }
    );
  }

  try {
    const user = await getSessionUser();
    const body = await req.json();
    
    // Validate input
    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { items, shipping, paymentMethod, notes, couponCode } = validation.data;

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItems: any[] = [];
    let storeId = "";

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.status !== "active") {
        return NextResponse.json(
          { error: `Product ${item.productId} not found or unavailable` },
          { status: 400 }
        );
      }

      if (product.trackStock && product.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      if (!storeId) storeId = product.storeId;

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: item.quantity,
        image: product.images ? JSON.parse(product.images)?.[0] : null,
      });

      // Update stock if tracking enabled
      if (product.trackStock) {
        await prisma.product.update({
          where: { id: product.id },
          data: { quantity: product.quantity - item.quantity },
        });
      }
    }

    if (!storeId) {
      return NextResponse.json(
        { error: "No valid store found for items" },
        { status: 400 }
      );
    }

    // Calculate shipping cost (simplified)
    let shippingCost = subtotal > 1000 ? 0 : 60;
    let total = subtotal + shippingCost;

    // Apply coupon if provided
    let discount = 0;
    let appliedCoupon: string | null = null;
    
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          storeId,
          isActive: true,
          OR: [
            { startsAt: null },
            { startsAt: { lte: new Date() } },
          ],
          AND: [
            {
              OR: [
                { endsAt: null },
                { endsAt: { gte: new Date() } },
              ],
            },
          ],
        },
      });

      if (coupon) {
        // Check usage limits
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          return NextResponse.json(
            { error: "Coupon usage limit reached" },
            { status: 400 }
          );
        }

        // Calculate discount
        if (coupon.type === "PERCENTAGE") {
          discount = (subtotal * coupon.value) / 100;
        } else if (coupon.type === "FIXED") {
          discount = coupon.value;
        } else if (coupon.type === "FREE_SHIPPING") {
          discount = shippingCost;
          shippingCost = 0;
        }

        // Ensure discount doesn't exceed subtotal
        discount = Math.min(discount, subtotal);
        total = subtotal + shippingCost - discount;
        appliedCoupon = coupon.code;

        // Increment used count
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: coupon.usedCount + 1 },
        });
      } else {
        return NextResponse.json(
          { error: "Invalid or expired coupon code" },
          { status: 400 }
        );
      }
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        storeId,
        customerId: user?.id,
        orderNumber,
        subtotal,
        shippingCost,
        total,
        paymentMethod,
        notes,
        couponCode: appliedCoupon,
        discount,
        items: {
          create: orderItems.map(item => ({
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        },
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
      },
      include: {
        items: true,
        shipping: true,
      },
    });

    // Clear cart items for authenticated user
    if (user) {
      await prisma.cartItem.deleteMany({
        where: { userId: user.id },
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
