import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/templates",
          "/templates/*",
          "/login",
          "/signup",
        ],
        disallow: [
          "/api/",
          "/dashboard/",
          "/site-admin/",
          "/admin-panel/",
          "/_next/",
          "/private/",
          "/*.json$",
          "/*.xml$",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        disallow: "/",
      },
      {
        userAgent: "Google-Extended",
        disallow: "/",
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://bdesh.shop"}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_APP_URL || "https://bdesh.shop",
  };
}
