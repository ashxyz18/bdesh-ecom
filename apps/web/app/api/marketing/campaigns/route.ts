import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@bdesh/database";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");

  const campaigns = await prisma.campaign.findMany({
    where: { storeId: storeId ?? undefined, store: { ownerId: String(user.id) } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const campaign = await prisma.campaign.create({
    data: {
      storeId: body.storeId,
      name: body.name,
      type: body.type,
      config: JSON.stringify(body.config || {}),
    },
  });

  return NextResponse.json({ campaign });
}
