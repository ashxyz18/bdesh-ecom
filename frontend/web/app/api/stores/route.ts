import { NextRequest, NextResponse } from "next/server";
import { prisma, createStore, getStoreByOwnerId, parseStoreJson } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;

    // Subdomain lookup: /api/stores?subdomain=mystore
    const subdomain = url.searchParams.get("subdomain");
    if (subdomain) {
      const store = await prisma.store.findFirst({
        where: { subdomain, deletedAt: null },
      });
      return NextResponse.json({ store: store ? parseStoreJson(store) : null });
    }

    // Domain lookup: /api/stores?domain=www.myshoestore.com
    const domain = url.searchParams.get("domain");
    if (domain) {
      // For now, check the settings JSON for a customDomain field
      const stores = await prisma.store.findMany({
        where: { deletedAt: null },
      });
      const match = stores.find((s) => {
        try {
          const settings = JSON.parse(s.settings || "{}");
          return settings.customDomain === domain;
        } catch {
          return false;
        }
      });
      return NextResponse.json({ store: match ? parseStoreJson(match) : null });
    }

    // Default: get store by user ID
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
