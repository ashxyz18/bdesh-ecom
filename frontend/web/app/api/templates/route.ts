import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/api-utils";
import { BUILTIN_TEMPLATES } from "@/lib/storefront/templates";

interface ListedTemplate {
  id: string;
  slug?: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  category: string;
  websiteType: string;
  previewUrl: string;
  isBuiltIn: boolean;
  buildStatus: "ready";
  dashboard?: unknown;
  configSchema?: unknown;
}

/**
 * GET /api/templates — used by onboarding, the template gallery, and the
 * landing page to list every template available for selection.
 *
 * The 3 first-party templates (modern, boutique, tech-store) are returned
 * first as in-memory definitions. Custom templates uploaded by site admins
 * are listed after.
 */
export async function GET() {
  try {
    const builtin: ListedTemplate[] = BUILTIN_TEMPLATES.map((t) => ({
      id: t.slug,
      slug: t.slug,
      name: t.name,
      description: t.description,
      thumbnail: t.thumbnail,
      category: t.category,
      websiteType: t.websiteType,
      previewUrl: `/templates/preview/${t.slug}`,
      isBuiltIn: true,
      buildStatus: "ready",
    }));

    const custom = await prisma.template.findMany({
      where: { isPublic: true, buildStatus: "ready", isBuiltIn: false },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        thumbnail: true,
        config: true,
        category: true,
        websiteType: true,
      },
    });

    const customListed: ListedTemplate[] = custom.map((t) => {
      const cfg = parseTemplateConfig(t.config);
      return {
        id: t.id,
        slug: t.slug,
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
        category: t.category,
        websiteType: t.websiteType,
        previewUrl: `/templates/${t.id}/index.html`,
        isBuiltIn: false,
        buildStatus: "ready",
        dashboard: (cfg as Record<string, unknown>).dashboard,
        configSchema: (cfg as Record<string, unknown>).configSchema,
      };
    });

    // Edge-cache aggressively — the template gallery rarely changes and a stale
    // response is fine. Without this, every visit triggers a Prisma query and
    // the marketing landing page blocks for 1-3s on the cold start.
    return apiResponse(
      { success: true, templates: [...builtin, ...customListed] },
      {
        cache: {
          public: true,
          maxAge: 60,
          sMaxAge: 300,
          staleWhileRevalidate: 3600,
        },
      },
    );
  } catch (error) {
    console.error("Failed to get templates:", error);
    return apiError("Failed to get templates", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId();
    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const { name, description, config, thumbnail } = body;

    if (!name || !config) {
      return apiError("Name and config are required", 400);
    }

    const template = await prisma.template.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        description: description || "",
        config: typeof config === "string" ? config : JSON.stringify(config),
        thumbnail: thumbnail || "",
        uploadedBy: userId,
        isPublic: true,
        isBuiltIn: false,
      },
    });

    return apiResponse(
      { success: true, template },
      { status: 201, cache: { noCache: true } }
    );
  } catch (error) {
    console.error("Failed to create template:", error);
    return apiError("Failed to create template", 500);
  }
}

function parseTemplateConfig(config: string | null) {
  if (!config) return {};
  try {
    const parsed = JSON.parse(config);
    return parsed.manifest || parsed;
  } catch {
    return {};
  }
}
