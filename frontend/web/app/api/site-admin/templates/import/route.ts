import { NextRequest, NextResponse } from "next/server";
import { prisma, isAdmin } from "@/lib/db";
import { buildReactTemplate, deleteTemplate } from "@/lib/templates/build-react";
import { generateManifestFromFiles } from "@/lib/templates/manifest-generator";
import type { TemplateManifest } from "@/lib/templates/manifest";
import fs from "fs";
import path from "path";

async function checkAuth(request: NextRequest): Promise<string | null> {
  const userId = request.headers.get("x-user-id");
  if (!userId) return null;
  const admin = await isAdmin(userId);
  return admin ? userId : null;
}

function readDirectoryRecursively(dir: string): { path: string; content: Buffer }[] {
  const files: { path: string; content: Buffer }[] = [];

  function walk(currentDir: string, relativePrefix: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.join(relativePrefix, entry.name).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        // Skip node_modules, build, dist, .git
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
        // Skip lock files
        if (entry.name === "package-lock.json" || entry.name === "yarn.lock") {
          continue;
        }
        files.push({
          path: relativePath,
          content: fs.readFileSync(fullPath),
        });
      }
    }
  }

  walk(dir, "");
  return files;
}

function parseUploadedManifest(files: { path: string; content: Buffer }[]): Partial<TemplateManifest> {
  const manifestFile = files.find((file) => {
    const normalized = file.path.replace(/\\/g, "/").toLowerCase();
    return normalized === "manifest.json" || normalized === "bdesh.template.json";
  });

  if (!manifestFile) return {};

  try {
    const parsed = JSON.parse(manifestFile.content.toString("utf-8"));
    const looksLikePlatformManifest =
      parsed.configSchema ||
      parsed.dashboard ||
      parsed.defaultSettings ||
      parsed.defaultTheme ||
      parsed.api ||
      parsed.sections;

    return looksLikePlatformManifest ? parsed : {};
  } catch {
    return {};
  }
}

type DashboardRequirementsParseResult = {
  found: boolean;
  requirements: Partial<TemplateManifest>;
  error?: string;
};

function parseDashboardRequirements(files: { path: string; content: Buffer }[]): DashboardRequirementsParseResult {
  const dashboardFile = files.find((file) => {
    const normalized = file.path.replace(/\\/g, "/").toLowerCase();
    return (
      normalized === "bdesh.dashboard.json" ||
      normalized === "dashboard.requirements.json" ||
      normalized === "dashboard.json"
    );
  });

  if (!dashboardFile) return { found: false, requirements: {} };

  try {
    const parsed = JSON.parse(dashboardFile.content.toString("utf-8"));
    const dashboard = parsed.dashboard || parsed;
    const looksLikeDashboardContract =
      dashboard.navigation ||
      dashboard.setupChecklist ||
      dashboard.catalog ||
      dashboard.pages ||
      dashboard.embed ||
      parsed.configSchema;

    if (!looksLikeDashboardContract) {
      return {
        found: true,
        requirements: {},
        error:
          "bdesh.dashboard.json was found, but it does not contain dashboard, configSchema, navigation, setupChecklist, catalog, pages, or embed.",
      };
    }

    return {
      found: true,
      requirements: {
        dashboard,
        configSchema: parsed.configSchema,
        defaultSettings: parsed.defaultSettings,
        defaultTheme: parsed.defaultTheme,
      },
    };
  } catch (error) {
    return {
      found: true,
      requirements: {},
      error: `bdesh.dashboard.json is not valid JSON: ${error instanceof Error ? error.message : "Parse failed"}`,
    };
  }
}

function mergeManifest(
  generated: TemplateManifest,
  uploaded: Partial<TemplateManifest>,
  templateId: string,
  name: string,
  description: string
): TemplateManifest {
  return {
    ...generated,
    ...uploaded,
    id: templateId,
    name,
    description: uploaded.description || description || generated.description,
    entryPoint: uploaded.entryPoint || generated.entryPoint,
    previewUrl: uploaded.previewUrl || generated.previewUrl,
    css: uploaded.css || generated.css,
    js: uploaded.js || generated.js,
    sections: {
      ...(generated.sections || {}),
      ...(uploaded.sections || {}),
    },
    interactivity: {
      ...(generated.interactivity || {}),
      ...(uploaded.interactivity || {}),
    },
    configSchema: {
      ...(generated.configSchema || {}),
      ...(uploaded.configSchema || {}),
    },
    dashboard: {
      ...(generated.dashboard || {}),
      ...(uploaded.dashboard || {}),
      catalog: {
        ...(generated.dashboard?.catalog || {}),
        ...(uploaded.dashboard?.catalog || {}),
      },
      pages: uploaded.dashboard?.pages || generated.dashboard?.pages,
      setupChecklist: uploaded.dashboard?.setupChecklist || generated.dashboard?.setupChecklist,
      navigation: uploaded.dashboard?.navigation || generated.dashboard?.navigation,
      quickActions: uploaded.dashboard?.quickActions || generated.dashboard?.quickActions,
    },
  };
}

export async function POST(request: NextRequest) {
  const userId = await checkAuth(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, description, sourcePath } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Template name is required" },
        { status: 400 }
      );
    }

    if (!sourcePath?.trim()) {
      return NextResponse.json(
        { success: false, error: "Source path is required" },
        { status: 400 }
      );
    }

    const resolvedPath = path.resolve(sourcePath);

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json(
        { success: false, error: `Path does not exist: ${resolvedPath}` },
        { status: 400 }
      );
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isDirectory()) {
      return NextResponse.json(
        { success: false, error: "Source path must be a directory" },
        { status: 400 }
      );
    }

    const templateId = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingTemplate = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (existingTemplate) {
      return NextResponse.json(
        {
          success: false,
          error: `Template "${templateId}" already exists. Use a different name or delete the existing one first.`,
        },
        { status: 409 }
      );
    }

    console.log("[Import Template] Reading files from:", resolvedPath);
    const files = readDirectoryRecursively(resolvedPath);

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid files found in source directory" },
        { status: 400 }
      );
    }

    const hasIndexHtml = files.some((f) => f.path.endsWith("index.html"));
    const hasPackageJson = files.some(
      (f) => f.path.split("/").pop()?.toLowerCase() === "package.json"
    );

    if (!hasIndexHtml && !hasPackageJson) {
      return NextResponse.json(
        { success: false, error: "Directory must contain index.html or package.json" },
        { status: 400 }
      );
    }

    const uploadedDashboardRequirements = parseDashboardRequirements(files);
    if (uploadedDashboardRequirements.error) {
      return NextResponse.json(
        { success: false, error: uploadedDashboardRequirements.error },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        id: templateId,
        name,
        slug: templateId,
        description: description || `Template: ${name}`,
        config: "{}",
        thumbnail: "",
        uploadedBy: userId,
        isPublic: true,
        isBuiltIn: false,
        buildStatus: "pending",
      },
    });

    await prisma.template.update({
      where: { id: templateId },
      data: { buildStatus: "building" },
    });

    const buildResult = await buildReactTemplate(templateId, files);
    const templateDir = path.join(process.cwd(), "public", "templates", templateId);

    if (buildResult.success) {
      const uploadedManifest = {
        ...parseUploadedManifest(files),
        ...uploadedDashboardRequirements.requirements,
      };
      const generated = await generateManifestFromFiles(templateId, name, files, templateDir);
      const manifest = mergeManifest(
        generated.manifest,
        uploadedManifest,
        templateId,
        name,
        description || `Template: ${name}`
      );

      const manifestPath = path.join(templateDir, "manifest.json");
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

      await prisma.template.update({
        where: { id: templateId },
        data: {
          buildStatus: "ready",
          buildLog: buildResult.buildLog,
          thumbnail: "",
          config: JSON.stringify({ manifest }),
        },
      });

      return NextResponse.json({
        success: true,
        templateId,
        name,
        buildStatus: "ready",
        previewUrl: manifest.previewUrl,
        isReact: hasPackageJson,
        dashboardDetected: uploadedDashboardRequirements.found,
      });
    } else {
      await prisma.template.update({
        where: { id: templateId },
        data: {
          buildStatus: "failed",
          buildLog: buildResult.buildLog,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: buildResult.error || "Build failed",
          buildStatus: "failed",
          buildLog: buildResult.buildLog,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Failed to import template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import template" },
      { status: 500 }
    );
  }
}
