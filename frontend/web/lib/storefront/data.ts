import "server-only";

import { cache } from "react";
import { prisma, safeJsonParse } from "@/lib/db";
import type {
  StorefrontStore,
  StorefrontProduct,
  StorefrontData,
} from "./types";

/**
 * Load a store + its catalog by storeId. Returns null if the store doesn't
 * exist or has been soft-deleted. Used directly by server components in
 * `app/store/[storeId]/...` so there is no client-side fetch and no iframe.
 *
 * Wrapped in React's `cache()` so a single render that calls this from both
 * the layout and the page hits the database once.
 */
export const loadStorefrontById = cache(async (storeId: string): Promise<StorefrontData | null> => {
  const store = await prisma.store.findFirst({
    where: { id: storeId, deletedAt: null },
  });
  if (!store) return null;
  return assembleStorefront(store);
});

/** Resolve a store by host header (custom domain or subdomain). */
export const loadStorefrontByHost = cache(async (host: string): Promise<StorefrontData | null> => {
  const normalized = host.toLowerCase().trim();
  if (!normalized) return null;

  // 1. Direct custom-domain match (e.g. shop.example.com).
  const byCustom = await prisma.store.findFirst({
    where: { customDomain: normalized, deletedAt: null },
  });
  if (byCustom) return assembleStorefront(byCustom);

  // 2. Subdomain match (e.g. mystore.bdesh.com -> subdomain "mystore").
  const platformHost = process.env.NEXT_PUBLIC_PLATFORM_HOST || "bdesh.com";
  if (normalized.endsWith(`.${platformHost}`)) {
    const sub = normalized.slice(0, -1 * (platformHost.length + 1));
    if (sub && sub !== "www") {
      const bySubdomain = await prisma.store.findFirst({
        where: { subdomain: sub, deletedAt: null },
      });
      if (bySubdomain) return assembleStorefront(bySubdomain);
    }
  }

  return null;
});

/** Look up just a single product on a storefront. Used by /products/[slug]. */
export async function loadStorefrontProduct(
  storeId: string,
  slugOrId: string,
): Promise<{ store: StorefrontStore; product: StorefrontProduct; related: StorefrontProduct[] } | null> {
  const data = await loadStorefrontById(storeId);
  if (!data) return null;
  const product =
    data.products.find((p) => p.slug === slugOrId || p.id === slugOrId) || null;
  if (!product) return null;
  const related = data.products
    .filter((p) => p.id !== product.id)
    .filter((p) => !product.category || p.category === product.category)
    .slice(0, 4);
  return { store: data.store, product, related };
}

async function assembleStorefront(
  store: Awaited<ReturnType<typeof prisma.store.findFirst>>,
): Promise<StorefrontData> {
  if (!store) throw new Error("assembleStorefront called with null");

  const productRows = await prisma.product.findMany({
    where: {
      storeId: store.id,
      status: { notIn: ["archived", "deleted", "draft"] },
      deletedAt: null,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const products: StorefrontProduct[] = productRows.map((p) => {
    const attrs = safeJsonParse(p.attributes, {}) as Record<string, unknown>;
    return {
      id: p.id,
      storeId: p.storeId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      comparePrice: p.comparePrice,
      images: safeJsonParse(p.images, []) as string[],
      stock: p.quantity,
      status: p.status,
      featured: p.featured,
      category: (attrs.category as string) || null,
      colors: (attrs.colors as string[]) || [],
      tags: (attrs.tags as string[]) || [],
    };
  });

  const featured = products.filter((p) => p.featured).slice(0, 8);
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c))),
  );

  const storefrontStore: StorefrontStore = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    subdomain: store.subdomain,
    customDomain: store.customDomain,
    description: store.description,
    logo: store.logo,
    banner: store.banner,
    templateId: store.templateId,
    theme: safeJsonParse(store.theme, {}) as StorefrontStore["theme"],
    settings: safeJsonParse(store.settings, {}) as StorefrontStore["settings"],
  };

  return {
    store: storefrontStore,
    products,
    featured: featured.length > 0 ? featured : products.slice(0, 8),
    categories,
  };
}
