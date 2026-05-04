import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@bdesh/database";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");

  const coupons = await prisma.coupon.findMany({
    where: { storeId: storeId ?? undefined, store: { ownerId: String(user.id) } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const coupon = await prisma.coupon.create({
    data: {
      storeId: body.storeId,
      code: body.code,
      type: body.type,
      value: body.value,
      minOrder: body.minOrder,
      maxUses: body.maxUses,
      startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
      endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
    },
  });

  return NextResponse.json({ coupon });
}
