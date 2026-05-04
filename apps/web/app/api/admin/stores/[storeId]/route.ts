import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// PATCH /api/admin/stores/[storeId] — Update store status (ADMIN only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await requireAuth();
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { storeId } = await params;
    const body = await req.json();

    const validStatuses = ["PENDING", "APPROVED", "SUSPENDED"];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;

    const store = await prisma.store.update({
      where: { id: storeId },
      data: updateData,
      select: {
        id: true,
        name: true,
        status: true,
        subdomain: true,
      },
    });

    return NextResponse.json({ store });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update store" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
