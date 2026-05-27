import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Resolve a host header to a storeId. Used by middleware to internally
 * rewrite custom-domain and subdomain requests into /store/<storeId>/...
 * routes while keeping the original URL in the address bar.
 *
 * Aggressively cached on the edge because store-host mappings rarely change.
 */
export async function GET(request: NextRequest) {
  const host = request.nextUrl.searchParams.get("host");
  if (!host) {
    return NextResponse.json({ error: "host parameter is required" }, { status: 400 });
  }

  const normalized = host.toLowerCase().trim();
  const storeId = await resolveStoreId(normalized);

  if (!storeId) {
    // 200 (not 404) so middleware can cache the negative result too.
    return NextResponse.json(
      { storeId: null },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  }

  return NextResponse.json(
    { storeId },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  );
}

async function resolveStoreId(host: string): Promise<string | null> {
  // 1. Custom-domain match (e.g. "shop.example.com").
  const byCustom = await prisma.store.findFirst({
    where: { customDomain: host, deletedAt: null },
    select: { id: true },
  });
  if (byCustom) return byCustom.id;

  // 2. Subdomain on the platform host (e.g. "mystore.bdesh.com").
  const platformHost = (process.env.NEXT_PUBLIC_PLATFORM_HOST || "bdesh.com").toLowerCase();
  if (host.endsWith(`.${platformHost}`)) {
    const sub = host.slice(0, -1 * (platformHost.length + 1));
    if (sub && sub !== "www") {
      const bySubdomain = await prisma.store.findFirst({
        where: { subdomain: sub, deletedAt: null },
        select: { id: true },
      });
      if (bySubdomain) return bySubdomain.id;
    }
  }

  return null;
}
