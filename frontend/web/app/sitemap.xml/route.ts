import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  // Return basic sitemap if database isn't available
  if (!process.env.DATABASE_URL) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bdesh.shop";
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bdesh.shop";

  // Static pages
  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

  // Add static pages
  const staticPages = [`${baseUrl}`, `${baseUrl}/login`, `${baseUrl}/register`];
  staticPages.forEach((url) => {
    xml += "<url>";
    xml += `<loc>${url}</loc>`;
    xml += "<changefreq>monthly</changefreq>";
    xml += "<priority>0.5</priority>";
    xml += "</url>";
  });

  try {
    // Get all public templates
    const templates = await prisma.template.findMany({
      where: { isPublic: true },
      select: { slug: true, updatedAt: true },
    });

    templates.forEach((template) => {
      xml += "<url>";
      xml += `<loc>${baseUrl}/preview/${template.slug}</loc>`;
      xml += `<lastmod>${template.updatedAt.toISOString()}</lastmod>`;
      xml += "<changefreq>weekly</changefreq>";
      xml += "<priority>0.8</priority>";
      xml += "</url>";
    });

    // Get all active stores
    const stores = await prisma.store.findMany({
      where: { status: "APPROVED", deletedAt: null },
      select: { id: true, updatedAt: true },
    });

    stores.forEach((store) => {
      xml += "<url>";
      xml += `<loc>${baseUrl}/store/${store.id}</loc>`;
      xml += `<lastmod>${store.updatedAt.toISOString()}</lastmod>`;
      xml += "<changefreq>daily</changefreq>";
      xml += "<priority>0.9</priority>";
      xml += "</url>";
    });
  } catch (error) {
    console.error("Failed to generate full sitemap:", error);
  }

  xml += "</urlset>";

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
