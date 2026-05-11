import { NextRequest, NextResponse } from "next/server";
import {
  getTemplates,
  addTemplate,
  removeTemplate,
  templateExists,
} from "@/lib/templates/registry";
import {
  generateManifestFromFiles,
  generateProductCardTemplate,
} from "@/lib/templates/manifest-generator";

const ADMIN_KEY = "bdesh-admin-2024";

function checkAuth(request: NextRequest, adminKey?: string | null): boolean {
  const key = adminKey || new URL(request.url).searchParams.get("adminKey");
  return key === ADMIN_KEY;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const templates = await getTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error("Failed to get templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Validate admin key from form data
    const adminKey = formData.get("adminKey") as string;
    if (!checkAuth(request, adminKey)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const file = formData.get("zip") as File;
    const name = formData.get("name") as string;

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

    const templateId = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (await templateExists(templateId)) {
      return NextResponse.json(
        {
          success: false,
          error: "A template with this name already exists",
        },
        { status: 409 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const files: { path: string; content: Buffer }[] = [];
    let hasHtml = false;

    for (const entry of entries) {
      if (entry.isDirectory) continue;
      const entryPath = entry.entryName.replace(/\\/g, "/");
      if (
        entryPath.toLowerCase().endsWith(".html") ||
        entryPath.toLowerCase().endsWith(".htm")
      ) {
        hasHtml = true;
      }
      files.push({
        path: entryPath,
        content: Buffer.from(entry.getData()),
      });
    }

    if (!hasHtml) {
      return NextResponse.json(
        { success: false, error: "ZIP must contain at least one HTML file" },
        { status: 400 }
      );
    }

    const { manifest } = await generateManifestFromFiles(
      templateId,
      name,
      files
    );
    manifest.description = `Uploaded template: ${name}`;

    const productCardTemplate = generateProductCardTemplate();
    files.push({
      path: "product-card.html",
      content: Buffer.from(productCardTemplate),
    });

    const result = await addTemplate(templateId, manifest, files);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      templateId,
      name: manifest.name,
      previewUrl: manifest.previewUrl,
    });
  } catch (error) {
    console.error("Failed to upload template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload template" },
      { status: 500 }
    );
  }
}
