import { NextRequest } from "next/server";
import { prisma, getProductsByStoreId, parseStoreJson, safeJsonParse } from "@/lib/db";
import { mergeTemplateSettings, mergeTemplateTheme } from "@/lib/templates/adoption";
import type { TemplateManifest } from "@/lib/templates/manifest";
import { apiResponse, apiError, cacheConfig } from "@/lib/api-utils";
import fs from "fs";
import path from "path";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const store = await prisma.store.findFirst({ where: { id: storeId, deletedAt: null } });

    if (!store) {
      return apiError("Store not found", 404);
    }

    const products = await getProductsByStoreId(storeId);

    return apiResponse(
      {
        store: parseStoreJson(store),
        products: products.map((p) => ({
          id: p.id,
          storeId: p.storeId,
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          comparePrice: p.comparePrice,
          costPrice: null,
          images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
          categoryId: null,
          tags: [],
          stock: p.quantity,
          lowStockThreshold: 5,
          status: p.status,
          variants: [],
          seo: { title: p.seoTitle, description: p.seoDesc },
          weight: null,
          dimensions: null,
          metadata: {},
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
      },
      { cache: cacheConfig.private }
    );
  } catch (error) {
    console.error("Get store error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const store = await prisma.store.findFirst({ where: { id: storeId, deletedAt: null } });

    if (!store) {
      return apiError("Store not found", 404);
    }

    const body = await request.json();
    const { name, description, logo, banner, theme, settings, templateId, websiteType } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo;
    if (banner !== undefined) updateData.banner = banner;
    if (websiteType !== undefined) updateData.websiteType = websiteType;
    if (theme !== undefined) {
      const currentTheme = JSON.parse(store.theme || "{}");
      updateData.theme = JSON.stringify({ ...currentTheme, ...theme });
    }
    if (settings !== undefined) {
      const currentSettings = safeJsonParse(store.settings, {});
      updateData.settings = JSON.stringify({ ...currentSettings, ...settings });
    }
    if (templateId !== undefined) {
      const manifest = await resolveTemplateManifest(templateId);
      const currentSettings = safeJsonParse(store.settings, {});
      const currentTheme = safeJsonParse(store.theme, {});

      updateData.templateId = templateId;
      updateData.settings = JSON.stringify(
        mergeTemplateSettings(
          settings !== undefined ? { ...currentSettings, ...settings } : currentSettings,
          manifest
        )
      );
      updateData.theme = JSON.stringify(
        mergeTemplateTheme(theme !== undefined ? { ...currentTheme, ...theme } : currentTheme, manifest)
      );
    }

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: updateData,
    });

    return apiResponse(
      { store: parseStoreJson(updated) },
      { cache: cacheConfig.noCache }
    );
  } catch (error) {
    console.error("Update store error:", error);
    return apiError("Internal server error", 500);
  }
}

async function resolveTemplateManifest(templateId: string): Promise<TemplateManifest | null> {
  const manifestPath = path.join(process.cwd(), "public", "templates", templateId, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    try {
      return JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as TemplateManifest;
    } catch {
      return null;
    }
  }

  const dbTemplate = await prisma.template.findUnique({
    where: { id: templateId },
    select: { config: true },
  });

  if (!dbTemplate?.config) return null;

  try {
    const parsed = JSON.parse(dbTemplate.config);
    return (parsed.manifest || parsed) as TemplateManifest;
  } catch {
    return null;
  }
}
