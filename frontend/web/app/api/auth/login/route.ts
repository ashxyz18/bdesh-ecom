import { NextRequest, NextResponse } from "next/server";
import { users, getStoreByOwnerId } from "@/lib/data-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    let foundUser = null;
    for (const user of users.values()) {
      if (user.email === email) {
        foundUser = user;
        break;
      }
    }

    // Fallback: check for default admin credentials if no user found
    if (!foundUser && email === "admin@bdesh.shop" && password === "admin123") {
      const adminId = "admin-" + Math.random().toString(36).substring(2, 10);
      const adminUser = {
        id: adminId,
        email: "admin@bdesh.shop",
        password: "admin123",
        name: "Admin",
        role: "admin" as const,
        createdAt: new Date(),
      };
      users.set(adminId, adminUser);
      foundUser = adminUser;
    }

    if (!foundUser) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // In production, verify hashed password!
    if (foundUser.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Get user's store
    const store = getStoreByOwnerId(foundUser.id);

    // Return user data (without password) and store
    return NextResponse.json({
      user: { id: foundUser.id, email: foundUser.email, name: foundUser.name, role: foundUser.role, createdAt: foundUser.createdAt },
      store,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}