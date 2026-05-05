import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// PATCH /api/admin/users/[userId] — Update user role (ADMIN only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await requireAuth();
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { userId } = await params;
    const body = await req.json();

    const validRoles = ["ADMIN", "MERCHANT", "CUSTOMER"];
    if (body.role && !validRoles.includes(body.role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    // Prevent admin from demoting themselves
    if (body.role && userId === session.user.id && body.role !== "ADMIN") {
      return NextResponse.json({ message: "Cannot change your own role" }, { status: 400 });
    }

    const updateData: any = {};
    if (body.role) updateData.role = body.role;
    if (body.name) updateData.name = body.name;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update user" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
