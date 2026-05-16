import { NextRequest, NextResponse } from "next/server";
import { prisma, isAdmin } from "@/lib/db";
import { buildReactTemplate } from "@/lib/templates/build-react";
import { generateManifestFromFiles } from "@/lib/templates/manifest-generator";
import type { TemplateManifest } from "@/lib/templates/manifest";
import fs from "fs";
import path from "path";

interface RouteParams {
  params: Promise<{ templateId: string }>;
}

async function checkAuth(request: NextRequest): Promise<boolean> {
  const userId = request.headers.get("x-user-id");
  if (!userId) return false;
  return isAdmin(userId);
}

function readDirectoryRecursively(dir: string): { path: string; content: Buffer }[] {
  const files: { path: string; content: Buffer }[] = [];
  function walk(currentDir: string, relativePrefix: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.join(relativePrefix, entry.name).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === "build" ||
          entry.name === "dist" ||
          entry.name === ".git" ||
          entry.name.startsWith(".")
        ) {
          continue;
        }
        walk(fullPath, relativePath);
      } else {
        if (entry.name === "package-lock.json" || entry.name === "yarn.lock") continue;
        files.push({ path: relativePath, content: fs.readFileSync(fullPath) });
      }
    }
  }
  walk(dir, "");
  return files;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  if (!(await checkAuth(request))) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const { templateId } = await params;

    const template = await prisma.template.findUnique({
      where: { id: templateId },
      select: {
        id: true,
        name: true,
        buildStatus: true,
        buildLog: true,
        updatedAt: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        buildStatus: template.buildStatus,
        buildLog: template.buildLog,
        updatedAt: template.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to get template status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get template status" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  if (!(await checkAuth(request))) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const { templateId } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === "retry") {
      const template = await prisma.template.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return NextResponse.json(
          { success: false, error: "Template not found" },
          { status: 404 }
        );
      }

      if (template.buildStatus !== "failed") {
        return NextResponse.json(
          { success: false, error: "Can only retry failed builds" },
          { status: 400 }
        );
      }

      // Attempt rebuild from existing source
      const templateDir = path.join(process.cwd(), "public", "templates", templateId);
      let files: { path: string; content: Buffer }[] = [];

      if (fs.existsSync(templateDir)) {
        files = readDirectoryRecursively(templateDir);
      }

      if (files.length === 0) {
        return NextResponse.json(
          { success: false, error: "No source files found to rebuild" },
          { status: 400 }
        );
      }

      await prisma.template.update({
        where: { id: templateId },
        data: {
          buildStatus: "building",
          buildLog: null,
        },
      });

      const buildResult = await buildReactTemplate(templateId, files);

      if (buildResult.success) {
        // Regenerate manifest
        const generated = await generateManifestFromFiles(templateId, template.name, files, templateDir);
        const manifestPath = path.join(templateDir, "manifest.json");
        let mergedManifest = generated.manifest;
        if (fs.existsSync(manifestPath)) {
          try {
            const existing = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as TemplateManifest;
            mergedManifest = { ...existing, ...generated.manifest, id: templateId, name: template.name };
          } catch { /* ignore */ }
        }
        fs.writeFileSync(manifestPath, JSON.stringify(mergedManifest, null, 2));

        await prisma.template.update({
          where: { id: templateId },
          data: {
            buildStatus: "ready",
            buildLog: buildResult.buildLog,
            config: JSON.stringify({ manifest: mergedManifest }),
          },
        });

        return NextResponse.json({
          success: true,
          message: "Build retry succeeded",
          buildStatus: "ready",
          buildLog: buildResult.buildLog,
        });
      } else {
        await prisma.template.update({
          where: { id: templateId },
          data: {
            buildStatus: "failed",
            buildLog: buildResult.buildLog,
          },
        });

        return NextResponse.json({
          success: false,
          error: buildResult.error || "Build retry failed",
          buildStatus: "failed",
          buildLog: buildResult.buildLog,
        }, { status: 500 });
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to update template status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update template status" },
      { status: 500 }
    );
  }
}