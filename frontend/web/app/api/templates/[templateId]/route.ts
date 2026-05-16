import { NextRequest, NextResponse } from "next/server";
import { getTemplate } from "@/lib/templates/registry";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

interface RouteParams {
  params: Promise<{ templateId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { templateId } = await params;

    // First check the filesystem-based registry (public/templates/{id}/manifest.json)
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
        },
      });
    }

    // Fallback: check DB for template metadata
    const dbTemplate = await prisma.template.findUnique({
      where: { id: templateId },
      select: {
        id: true,
        name: true,
        description: true,
        buildStatus: true,
        buildLog: true,
        config: true,
      },
    });

    if (!dbTemplate) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template: {
        id: dbTemplate.id,
        name: dbTemplate.name,
        description: dbTemplate.description,
        buildStatus: dbTemplate.buildStatus as "pending" | "installing" | "building" | "ready" | "failed",
        buildLog: dbTemplate.buildLog,
        previewUrl: `/templates/${templateId}/index.html`,
        manifest: parseTemplateConfig(dbTemplate.config),
      },
    });
  } catch (error) {
    console.error("Failed to get template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get template" },
      { status: 500 }
    );
  }
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
