import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { storeCreateSchema } from "@bdesh/shared";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const checkSubdomain = searchParams.get("check");
    if (checkSubdomain) {
      const existing = await prisma.store.findUnique({
        where: { subdomain: checkSubdomain },
      });
      return NextResponse.json({ exists: !!existing });
    }

    const session = await requireAuth();

    if (session.user.role === "ADMIN") {
      const stores = await prisma.store.findMany({
        include: { owner: { select: { name: true, email: true } } },
      });
      return NextResponse.json({ stores });
    }

    const stores = await prisma.store.findMany({
      where: { ownerId: session.user.id as unknown as string },
    });
    return NextResponse.json({ stores });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { name, subdomain, description, category, theme } = body;

    const existing = await prisma.store.findFirst({
      where: { OR: [{ subdomain }, { name }] },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Store name or subdomain already taken" },
        { status: 409 }
      );
    }

    const themeData = theme ? (typeof theme === "string" ? JSON.parse(theme) : theme) : {
      templateId: category || "default",
      primaryColor: "#006A4E",
      secondaryColor: "#F42A41",
    };

    const store = await prisma.store.create({
      data: {
        name,
        slug: subdomain,
        subdomain,
        description: description || null,
        ownerId: session.user.id as unknown as string,
        theme: JSON.stringify(themeData),
        status: "APPROVED",
      },
    });

    return NextResponse.json({ store });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 400 }
    );
  }
}