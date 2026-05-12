import { NextRequest, NextResponse } from "next/server";
import { prisma, createStore } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "CUSTOMER",
      },
    });

    const store = await createStore(`${name}'s Store`, user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role.toLowerCase(), createdAt: user.createdAt },
      store: {
        ...store,
        theme: JSON.parse(store.theme),
        settings: JSON.parse(store.settings),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
