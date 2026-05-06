import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/", "/dashboard/", "/admin/", "/login", "/register"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://bdesh.shop"}/sitemap.xml`,
  };
}
