import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const customerId = request.headers.get("x-customer-id");

    if (!customerId) {
      return NextResponse.json({ customer: null });
    }

    const customer = await prisma.storeCustomer.findFirst({
      where: { id: customerId, storeId },
    });

    if (!customer) {
      return NextResponse.json({ customer: null });
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        addresses: JSON.parse(customer.addresses || "[]"),
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    console.error("Store customer me error:", error);
    return NextResponse.json({ customer: null });
  }
}
