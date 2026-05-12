import { NextRequest, NextResponse } from "next/server";
import { getCouponsByStoreId, createCoupon } from "@/lib/db";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const coupons = await getCouponsByStoreId(storeId);
    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    console.error("Get coupons error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    const { code, type, value, minOrderAmount, maxDiscount, usageLimit, perUserLimit, startDate, endDate } = body;

    if (!code || value === undefined) {
      return NextResponse.json({ error: "Coupon code and value are required" }, { status: 400 });
    }

    const existingCoupons = await getCouponsByStoreId(storeId);
    const existing = existingCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (existing) {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
    }

    const coupon = await createCoupon(storeId, {
      code: code.toUpperCase(),
      type: type || "percentage",
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      perUserLimit,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error) {
    console.error("Create coupon error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
