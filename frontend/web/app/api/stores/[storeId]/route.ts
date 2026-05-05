import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: { select: { name: true, email: true } },
      },
    });

    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    // Parse JSON strings for SQLite compatibility
    const parsedStore = {
      ...store,
      theme: JSON.parse(typeof store.theme === "string" ? store.theme : "{}"),
      settings: JSON.parse(typeof store.settings === "string" ? store.settings : "{}"),
    };

    return NextResponse.json({ store: parsedStore });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const session = await requireAuth();
    const body = await req.json();

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    if (store.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        name: body.name,
        description: body.description,
        logo: body.logo,
        banner: body.banner,
        theme: body.theme ? JSON.stringify(body.theme) : undefined,
        settings: body.settings ? JSON.stringify(body.settings) : undefined,
      },
    });

    // Parse response
    const parsedStore = {
      ...updated,
      theme: JSON.parse(typeof updated.theme === "string" ? updated.theme : "{}"),
      settings: JSON.parse(typeof updated.settings === "string" ? updated.settings : "{}"),
    };

    return NextResponse.json({ store: parsedStore });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 400 }
    );
  }
}
