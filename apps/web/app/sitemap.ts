import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Get all active stores
  const stores = await prisma.store.findMany({
    where: { status: "ACTIVE" },
    select: { subdomain: true, updatedAt: true },
  });

  const storeEntries: MetadataRoute.Sitemap = stores.map((store) => ({
    url: `${baseUrl}/store?subdomain=${store.subdomain}`,
    lastModified: store.updatedAt instanceof Date ? store.updatedAt : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Static pages
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    },
  ];

  return [...staticEntries, ...storeEntries];
}
