import { NextRequest, NextResponse } from "next/server";
import { stores, createStore, getStoreByOwnerId } from "@/lib/data-store";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userStore = getStoreByOwnerId(userId);
    return NextResponse.json({ store: userStore });
  } catch (error) {
    console.error("Get store error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, templateId } = body;

    if (!name) {
      return NextResponse.json({ error: "Store name is required" }, { status: 400 });
    }

    // Check if user already has a store
    const existingStore = getStoreByOwnerId(userId);
    if (existingStore) {
      return NextResponse.json({ error: "User already has a store" }, { status: 409 });
    }

    const store = createStore(name, userId, templateId);
    return NextResponse.json({ store }, { status: 201 });
  } catch (error) {
    console.error("Create store error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}