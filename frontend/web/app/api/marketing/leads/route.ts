import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@bdesh/database";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");

  const leads = await prisma.lead.findMany({
    where: { storeId: storeId ?? undefined, store: { ownerId: String(user.id) } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const lead = await prisma.lead.create({
    data: {
      storeId: body.storeId,
      email: body.email,
      phone: body.phone,
      name: body.name,
      source: body.source || "NEWSLETTER",
    },
  });

  return NextResponse.json({ lead });
}
