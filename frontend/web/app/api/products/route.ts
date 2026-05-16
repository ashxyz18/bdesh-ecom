import { NextRequest } from "next/server";
import { prisma, getProductsByStoreId, createProduct, serializeProductList } from "@/lib/db";
import { apiResponse, apiError, cacheConfig } from "@/lib/api-utils";

function getStoreId(request: NextRequest): string | null {
  const url = request.nextUrl;
  let storeId = url.searchParams.get("storeId") || url.searchParams.get("store_id");

  if (storeId === "null" || storeId === "undefined" || storeId === "") {
    storeId = null;
  }

  if (storeId) return storeId;

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refStoreId = refererUrl.searchParams.get("storeId") || refererUrl.searchParams.get("store_id");
      if (refStoreId && refStoreId !== "null" && refStoreId !== "undefined") return refStoreId;
    } catch {
      // ignore invalid referer
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    if (!storeId) {
      return apiError("storeId is required", 400);
    }

    const store = await prisma.store.findFirst({ where: { id: storeId, deletedAt: null } });
    if (!store) {
      return apiError("Store not found", 404);
    }

    const search = request.nextUrl.searchParams.get("search");
    const category = request.nextUrl.searchParams.get("category");
    const status = request.nextUrl.searchParams.get("status");

    let products = await getProductsByStoreId(storeId);
    let productList = serializeProductList(products);

    if (search) {
      const q = search.toLowerCase();
      productList = productList.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          p.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    if (category) {
      productList = productList.filter((p) => p.categoryId === category);
    }
    if (status) {
      productList = productList.filter((p) => p.status === status);
    }

    return apiResponse(
      { success: true, products: productList },
      { cache: cacheConfig.private }
    );
  } catch (error) {
    console.error("Get products error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const { storeId, name, price, description, images, stock, categoryId, category, colors, tags, variants, status, comparePrice, costPrice, lowStockThreshold, seo, weight, dimensions, slug, attributes } = body;

    if (!storeId || !name || price === undefined) {
      return apiError("storeId, name, and price are required", 400);
    }

    const store = await prisma.store.findFirst({ where: { id: storeId, deletedAt: null } });
    if (!store) {
      return apiError("Store not found", 404);
    }

    if (store.ownerId !== userId) {
      return apiError("You do not own this store", 403);
    }

    const product = await createProduct(storeId, {
      name,
      price,
      description,
      images: images || [],
      stock: stock || 0,
      categoryId,
      category,
      colors,
      tags: tags || [],
      status: status || "active",
      comparePrice,
      costPrice,
      lowStockThreshold,
      seo,
      slug,
      attributes,
    });

    return apiResponse(
      { success: true, product: serializeProductList([product])[0] },
      { status: 201, cache: cacheConfig.noCache }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return apiError("Internal server error", 500);
  }
}
