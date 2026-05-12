import { NextRequest, NextResponse } from "next/server";
import { prisma, createStore, getStoreByOwnerId, parseStoreJson } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userStore = await getStoreByOwnerId(userId);
    return NextResponse.json({ store: userStore ? parseStoreJson(userStore) : null });
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

    const existingStore = await getStoreByOwnerId(userId);
    if (existingStore) {
      return NextResponse.json({ error: "User already has a store" }, { status: 409 });
    }

    const store = await createStore(name, userId, templateId);
    return NextResponse.json({ store: parseStoreJson(store) }, { status: 201 });
  } catch (error) {
    console.error("Create store error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
