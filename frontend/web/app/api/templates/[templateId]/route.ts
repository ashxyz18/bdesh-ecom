import { NextRequest, NextResponse } from "next/server";
import { getTemplate } from "@/lib/templates/registry";
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

    if (templateId === "koskii") {
      return NextResponse.json({
        success: true,
        template: {
          id: "koskii",
          name: "Koskii Ethnic Wear",
          isBuiltIn: true,
        },
      });
    }

    const template = await getTemplate(templateId);
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    const templatesDir = path.join(
      process.cwd(),
      "public",
      "templates",
      templateId
    );

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

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        entryPoint,
        html: htmlContent,
        cssFiles,
        manifest: template.manifest,
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