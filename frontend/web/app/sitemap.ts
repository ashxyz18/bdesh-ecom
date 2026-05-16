import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bdesh.shop";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic template pages
  let templatePages: MetadataRoute.Sitemap = [];
  try {
    const templates = await prisma.template.findMany({
      where: { isPublic: true, buildStatus: "ready" },
      select: { id: true, updatedAt: true },
      take: 100,
    });

    templatePages = templates.map((template) => ({
      url: `${baseUrl}/templates/${template.id}`,
      lastModified: template.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // If DB is unavailable, skip template pages
  }

  // Dynamic store pages
  let storePages: MetadataRoute.Sitemap = [];
  try {
    const stores = await prisma.store.findMany({
      where: { deletedAt: null, status: "APPROVED" },
      select: { id: true, updatedAt: true },
      take: 500,
    });

    storePages = stores.map((store) => ({
      url: `${baseUrl}/store/${store.id}`,
      lastModified: store.updatedAt,
      changeFrequency: "daily",
      priority: 0.6,
    }));
  } catch {
    // If DB is unavailable, skip store pages
  }

  return [...staticPages, ...templatePages, ...storePages];
}
