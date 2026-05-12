import { NextRequest, NextResponse } from "next/server";
import { prisma, isAdmin } from "@/lib/db";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const userId = request.headers.get("x-user-id");
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { storeId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["APPROVED", "SUSPENDED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const store = await prisma.store.update({
      where: { id: storeId },
      data: { status },
    });

    return NextResponse.json({ success: true, store });
  } catch (error) {
    console.error("Update store error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
