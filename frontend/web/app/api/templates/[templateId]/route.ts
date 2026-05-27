import { NextRequest, NextResponse } from "next/server";
import { getTemplate } from "@/lib/templates/registry";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";
import {
  BUILTIN_TEMPLATES,
  isBuiltinSlug,
  type BuiltinTemplate,
} from "@/lib/storefront/templates";

interface RouteParams {
  params: Promise<{ templateId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params;

    // 1. Builtin React-based templates (modern / boutique / tech-store).
    if (isBuiltinSlug(templateId)) {
      const builtin = BUILTIN_TEMPLATES.find((t) => t.slug === templateId)!;
      return NextResponse.json({
        success: true,
        template: builtinResponse(builtin),
      });
    }

    // 2. Filesystem-based legacy templates served via /public/templates/.
    const template = await getTemplate(templateId);
    if (template) {
      const templatesDir = path.join(process.cwd(), "public", "templates", templateId);
      const entryPoint = template.manifest.entryPoint;
      const entryPointDir = entryPoint.substring(0, entryPoint.lastIndexOf("/") + 1);
      const htmlPath = path.join(templatesDir, entryPoint);
      let htmlContent = "";

      if (fs.existsSync(htmlPath)) {
        htmlContent = fs.readFileSync(htmlPath, "utf-8");
      }

      const cssFiles: string[] = [];
      const cssList = Array.isArray(template.manifest.css)
        ? template.manifest.css
        : template.manifest.css
          ? [template.manifest.css]
          : [];

      for (const cssFile of cssList) {
        const cssPath = cssFile.startsWith("/")
          ? cssFile
          : `/templates/${templateId}/${entryPointDir}${cssFile}`;
        cssFiles.push(cssPath);
      }

      const dbTemplate = await prisma.template.findUnique({
        where: { id: templateId },
        select: { buildStatus: true, buildLog: true },
      });

      return NextResponse.json({
        success: true,
        template: {
          id: template.id,
          name: template.name,
          description: template.description,
          thumbnail: template.thumbnail,
          entryPoint,
          html: htmlContent,
          cssFiles,
          previewUrl: template.previewUrl,
          manifest: template.manifest,
          buildStatus: dbTemplate?.buildStatus || "ready",
          buildLog: dbTemplate?.buildLog,
          isBuiltIn: false,
        },
      });
    }

    // 3. Database-only templates (record exists but files don't).
    const dbTemplate = await prisma.template.findUnique({
      where: { id: templateId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        buildStatus: true,
        buildLog: true,
        config: true,
      },
    });

    if (dbTemplate) {
      return NextResponse.json({
        success: true,
        template: {
          id: dbTemplate.id,
          name: dbTemplate.name,
          description: dbTemplate.description,
          buildStatus: dbTemplate.buildStatus,
          buildLog: dbTemplate.buildLog,
          previewUrl: `/templates/${templateId}/index.html`,
          manifest: parseTemplateConfig(dbTemplate.config),
          isBuiltIn: false,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Template not found" },
      { status: 404 },
    );
  } catch (error) {
    console.error("Failed to get template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get template" },
      { status: 500 },
    );
  }
}

function builtinResponse(t: BuiltinTemplate) {
  return {
    id: t.slug,
    slug: t.slug,
    name: t.name,
    description: t.description,
    thumbnail: t.thumbnail,
    category: t.category,
    websiteType: t.websiteType,
    previewUrl: `/templates/${t.slug}`,
    buildStatus: "ready" as const,
    isBuiltIn: true,
    // Minimal manifest so the dashboard's manifest-driven UI doesn't crash.
    // The platform's PLATFORM_CUSTOMIZATION_SCHEMA in /dashboard/customize
    // already covers all fields a builtin template understands.
    manifest: {
      id: t.slug,
      name: t.name,
      version: "1.0.0",
      type: "react",
      entryPoint: "n/a",
      css: [] as string[],
      sections: {},
      defaultTheme: t.defaultTheme,
      defaultSettings: t.defaultSettings,
      configSchema: {},
      dashboard: {
        navigation: [
          "overview",
          "products",
          "orders",
          "customers",
          "coupons",
          "marketing",
          "analytics",
          "couriers",
          "customize",
          "settings",
        ],
        setupChecklist: [
          {
            id: "brand",
            label: "Add store branding",
            description: "Set your logo, hero copy, and main visuals.",
            href: "/dashboard/customize",
            type: "branding",
            required: true,
          },
          {
            id: "products",
            label: "Add products",
            description:
              "Add the products this template will show on the storefront.",
            href: "/dashboard/products/new",
            type: "products",
            required: true,
          },
          {
            id: "settings",
            label: "Review store settings",
            description: "Confirm currency, checkout, and business details.",
            href: "/dashboard/settings",
            type: "settings",
          },
        ],
      },
    },
  };
}

function parseTemplateConfig(config: string | null) {
  if (!config) return null;
  try {
    const parsed = JSON.parse(config);
    return parsed.manifest || parsed;
  } catch {
    return null;
  }
}
