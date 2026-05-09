import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { SessionWithUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Use lookup hash for O(1) query (token in DB is bcrypt-hashed)
    const lookupHash = createHash("sha256").update(token).digest("hex");

    const whereClause = { lookupHash } as any;
    const session = await prisma.session.findUnique({
      where: whereClause,
      include: { user: true },
    }) as SessionWithUser | null;

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        avatar: session.user.avatar,
      },
    });
  } catch (error: any) {
    console.error("[auth/mobile-me] Error:", error.message);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
