import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    const { email, password, name, phone } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Verify store exists
    const store = await prisma.store.findFirst({
      where: { id: storeId, deletedAt: null },
    });
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Check if customer already exists for this store
    const existing = await prisma.storeCustomer.findUnique({
      where: { storeId_email: { storeId, email } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists for this store" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const customer = await prisma.storeCustomer.create({
      data: {
        storeId,
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
      },
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        createdAt: customer.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Store customer register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
