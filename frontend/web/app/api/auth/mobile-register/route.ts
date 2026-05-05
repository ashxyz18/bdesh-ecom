import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { registerSchema } from "@bdesh/shared";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = registerSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: phone || undefined }] },
    });

    if (existing) {
      return NextResponse.json(
        { message: existing.email === email ? "Email already registered" : "Phone already registered" },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || undefined,
        password: hashed,
        role: "MERCHANT",
      },
    });

    const token = await createSession(user.id as string);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Registration failed" }, { status: 400 });
  }
}
