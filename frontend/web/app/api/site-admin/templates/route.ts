import { NextRequest, NextResponse } from "next/server";
import { prisma, isAdmin } from "@/lib/db";
import { buildReactTemplate, deleteTemplate } from "@/lib/templates/build-react";
import { generateManifestFromFiles } from "@/lib/templates/manifest-generator";
import type { TemplateManifest } from "@/lib/templates/manifest";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

async function checkAuth(request: NextRequest): Promise<string | null> {
  const userId = request.headers.get("x-user-id");
  if (!userId) return null;
  const admin = await isAdmin(userId);
  return admin ? userId : null;
}

export async function GET(request: NextRequest) {
  const userId = await checkAuth(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const templates = await prisma.template.findMany({
      where: { isBuiltIn: false },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        slug: true,
        buildStatus: true,
        buildLog: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      templates: templates.map((t) => ({
        ...t,
        previewUrl: `/templates/${t.id}/index.html`,
      })),
    });
  } catch (error) {
    console.error("Failed to get templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get templates" },
      { status: 500 }
    );
  }
}

function findProjectRoot(entries: AdmZip.IZipEntry[]): string {
  const allPaths = entries
    .filter((e) => !e.isDirectory)
    .map((e) => e.entryName.replace(/\\/g, "/"))
    .filter((p) => !p.startsWith("__MACOSX") && !p.split("/").some((part) => part.startsWith(".")));

  if (allPaths.length === 0) return "";

  let packageJsonPath = "";
  let hasSrc = false;
  let hasPublic = false;

  for (const p of allPaths) {
    const fileName = p.split("/").pop()?.toLowerCase();
    if (fileName === "package.json") {
      packageJsonPath = p;
    }
    if (p.startsWith("src/")) {
      hasSrc = true;
    }
    if (p.startsWith("public/")) {
      hasPublic = true;
    }
  }

  if (packageJsonPath) {
    const lastSlash = packageJsonPath.lastIndexOf("/");
    if (lastSlash > 0) {
      const root = packageJsonPath.substring(0, lastSlash + 1);
      console.log("[Upload] Root from package.json:", root);
      return root;
    }
    return "";
  }

  if (hasSrc && hasPublic) {
    const srcParent = allPaths.find((p) => p.startsWith("src/"))?.split("/")[0] || "";
    console.log("[Upload] Root from src/public:", srcParent + "/");
    return srcParent + "/";
  }

  if (hasSrc) {
    const srcParent = allPaths.find((p) => p.startsWith("src/"))?.split("/")[0] || "";
    return srcParent + "/";
  }

  const firstPath = allPaths[0];
  const firstSlash = firstPath.indexOf("/");
  if (firstSlash > 0) {
    const root = firstPath.substring(0, firstSlash + 1);
    console.log("[Upload] Root from first path:", root);
    return root;
  }

  return "";
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
  // Dashboard: if the template explicitly declared dashboard config (via bdesh.dashboard.json),
  // it should take FULL priority. The template author knows their frontend best.
  const hasDashboardOverride = Boolean(
    uploaded.dashboard?.setupChecklist ||
    uploaded.dashboard?.catalog ||
    uploaded.dashboard?.navigation ||
    uploaded.dashboard?.pages
  );

  const dashboardConfig = hasDashboardOverride
    ? {
        // Template-declared dashboard takes full priority
        navigation: uploaded.dashboard?.navigation || generated.dashboard?.navigation,
        setupChecklist: uploaded.dashboard?.setupChecklist || generated.dashboard?.setupChecklist,
        quickActions: uploaded.dashboard?.quickActions || generated.dashboard?.quickActions,
        // Catalog: template declaration fully overrides, preserving all sub-fields
        catalog: uploaded.dashboard?.catalog
          ? {
              label: uploaded.dashboard.catalog.label,
              itemLabel: uploaded.dashboard.catalog.itemLabel || "Products",
              collections: uploaded.dashboard.catalog.collections || [],
              filters: uploaded.dashboard.catalog.filters || [],
              productFields: uploaded.dashboard.catalog.productFields || [],
            }
          : generated.dashboard?.catalog || undefined,
        pages: uploaded.dashboard?.pages || generated.dashboard?.pages,
        embed: uploaded.dashboard?.embed || generated.dashboard?.embed,
      }
    : {
        ...(generated.dashboard || {}),
        catalog: generated.dashboard?.catalog
          ? {
              ...generated.dashboard.catalog,
              productFields: generated.dashboard.catalog.productFields || [],
            }
          : undefined,
      };

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
    // configSchema: template fields override generated ones, but keep platform defaults
    configSchema: {
      ...(generated.configSchema || {}),
      ...(uploaded.configSchema || {}),
    },
    dashboard: dashboardConfig,
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
    const formData = await request.formData();
    const file = formData.get("zip") as File;
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";

    console.log("[Upload Template] Received request:", { name, fileName: file?.name, fileSize: file?.size });

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No ZIP file provided" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Template name is required" },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".zip")) {
      return NextResponse.json(
        { success: false, error: "Only ZIP files are accepted" },
        { status: 400 }
      );
    }

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 100MB limit" },
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const validEntries = entries
      .filter((e) => !e.isDirectory)
      .map((e) => e.entryName.replace(/\\/g, "/"))
      .filter((p) => !p.startsWith("__MACOSX") && !p.split("/").some((part) => part.startsWith(".")));

    if (validEntries.length === 0) {
      return NextResponse.json(
        { success: false, error: "ZIP file is empty or invalid" },
        { status: 400 }
      );
    }

    const rootFolder = findProjectRoot(entries);
    console.log("[Upload] Detected root folder:", JSON.stringify(rootFolder));

    // Check for index.html — but ignore files inside node_modules/build/dist
    const cleanEntries = validEntries.filter((p) => {
      const parts = p.split("/");
      return !parts.some((part) => part === "node_modules" || part === "build" || part === "dist");
    });
    let hasIndexHtml = cleanEntries.some((p) => p.endsWith("index.html") || p.endsWith("index.htm"));

    // For React apps with a build script, public/index.html is used as the template
    // CRA will generate the real index.html during build
    const hasReactBuildScript = cleanEntries.some((p) => {
      const name = p.split("/").pop()?.toLowerCase();
      return name === "package.json";
    });

    if (!hasIndexHtml && !hasReactBuildScript) {
      return NextResponse.json(
        { success: false, error: "ZIP must contain an index.html file or a package.json with a build script" },
        { status: 400 }
      );
    }

    let hasReactBuild = false;
    let hasPackageJson = false;

    const files: { path: string; content: Buffer }[] = [];

    for (const entry of entries) {
      if (entry.isDirectory) continue;

      const entryPath = entry.entryName.replace(/\\/g, "/");

      if (
        entryPath.startsWith("__MACOSX") ||
        entryPath.split("/").some((part) => part.startsWith("."))
      ) {
        continue;
      }

      // Skip node_modules, build output, and lock files from ZIP
      const pathParts = entryPath.split("/");
      if (pathParts.some((part) => part === "node_modules" || part === "build" || part === "dist" || part === ".git")) {
        continue;
      }
      if (pathParts[pathParts.length - 1] === "package-lock.json" || pathParts[pathParts.length - 1] === "yarn.lock") {
        continue;
      }

      let normalizedPath: string;
      if (rootFolder && entryPath.startsWith(rootFolder)) {
        normalizedPath = entryPath.substring(rootFolder.length);
      } else {
        normalizedPath = entryPath;
      }

      if (!normalizedPath) continue;

      files.push({
        path: normalizedPath,
        content: Buffer.from(entry.getData()),
      });

      const fileName = normalizedPath.split("/").pop()?.toLowerCase();
      if (fileName === "package.json") {
        hasPackageJson = true;
        try {
          const pkgContent = Buffer.from(entry.getData()).toString("utf-8");
          const pkg = JSON.parse(pkgContent);
          const scripts = pkg.scripts || {};
          if (scripts.build) {
            hasReactBuild = true;
          }
        } catch {
          console.log("[Upload] Could not parse package.json");
        }
      }
    }

    console.log("[Upload Template] Files:", files.length, "Root:", JSON.stringify(rootFolder), "HasReact:", hasReactBuild);

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
        name: name,
        buildStatus: "ready",
        previewUrl: manifest.previewUrl,
        isReact: hasReactBuild,
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

      return NextResponse.json({
        success: false,
        error: buildResult.error || "Build failed",
        buildStatus: "failed",
        buildLog: buildResult.buildLog,
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Failed to upload template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload template" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await checkAuth(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const templateId = new URL(request.url).searchParams.get("templateId");

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 }
      );
    }

    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    if (template.isBuiltIn) {
      return NextResponse.json(
        { success: false, error: "Cannot delete built-in templates" },
        { status: 403 }
      );
    }

    await deleteTemplate(templateId);

    await prisma.template.delete({
      where: { id: templateId },
    });

    return NextResponse.json({
      success: true,
      message: `Template "${templateId}" deleted successfully`,
    });
  } catch (error) {
    console.error("Failed to delete template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
