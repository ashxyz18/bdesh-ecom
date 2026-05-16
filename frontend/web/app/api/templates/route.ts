import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const customTemplates = await prisma.template.findMany({
      where: { isPublic: true, buildStatus: "ready", isBuiltIn: false },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        slug: true,
        buildStatus: true,
        config: true,
      },
    });

    const templates = customTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      thumbnail: t.thumbnail,
      previewUrl: `/templates/${t.id}/index.html`,
      isBuiltIn: false,
      buildStatus: t.buildStatus,
      dashboard: parseTemplateConfig(t.config).dashboard,
      configSchema: parseTemplateConfig(t.config).configSchema,
    }));

    return apiResponse({ success: true, templates });
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
      { status: 201, cache: cacheConfig.noCache }
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
