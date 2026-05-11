import { NextRequest, NextResponse } from "next/server";
import { users, generateId, createStore } from "@/lib/data-store";

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

    // Check if user already exists
    for (const user of users.values()) {
      if (user.email === email) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 409 }
        );
      }
    }

    // Create user
    const id = generateId();
    const user = {
      id,
      email,
      password, // In production, hash this!
      name,
      role: "user" as const,
      createdAt: new Date(),
    };
    users.set(id, user);

    // Create a store for the user (no template yet — user will choose on onboarding)
    const store = createStore(`${name}'s Store`, id);

    // Return user data (without password) and store
    return NextResponse.json({
      user: { id, email, name, createdAt: user.createdAt },
      store,
    }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}