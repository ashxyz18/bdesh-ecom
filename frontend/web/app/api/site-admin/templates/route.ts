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
import { isAdmin } from "@/lib/db";

async function checkAuth(request: NextRequest): Promise<boolean> {
  const userId = request.headers.get("x-user-id");
  if (!userId) return false;
  return isAdmin(userId);
}

export async function GET(request: NextRequest) {
  if (!(await checkAuth(request))) {
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
  if (!(await checkAuth(request))) {
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

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 50MB limit" },
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
          error: `Template "${templateId}" already exists. Use a different name or delete the existing one first.`,
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
    let htmlCount = 0;
    let totalFiles = 0;

    for (const entry of entries) {
      if (entry.isDirectory) continue;
      totalFiles++;

      const entryPath = entry.entryName.replace(/\\/g, "/");

      if (
        entryPath.startsWith("__MACOSX") ||
        entryPath.split("/").some((part) => part.startsWith("."))
      ) {
        continue;
      }

      if (
        entryPath.toLowerCase().endsWith(".html") ||
        entryPath.toLowerCase().endsWith(".htm")
      ) {
        hasHtml = true;
        htmlCount++;
      }

      files.push({
        path: entryPath,
        content: Buffer.from(entry.getData()),
      });
    }

    if (totalFiles === 0) {
      return NextResponse.json(
        { success: false, error: "ZIP file is empty" },
        { status: 400 }
      );
    }

    if (!hasHtml) {
      return NextResponse.json(
        {
          success: false,
          error: "ZIP must contain at least one HTML file",
        },
        { status: 400 }
      );
    }

    const { manifest } = await generateManifestFromFiles(
      templateId,
      name,
      files
    );
    manifest.description =
      description || `Uploaded template: ${name}`;

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
      stats: {
        totalFiles,
        htmlPages: htmlCount,
      },
    });
  } catch (error) {
    console.error("Failed to upload template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload template" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const templateId =
      new URL(request.url).searchParams.get("templateId");

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 }
      );
    }

    if (templateId === "koskii") {
      return NextResponse.json(
        { success: false, error: "Cannot delete the default Koskii template" },
        { status: 403 }
      );
    }

    const result = await removeTemplate(templateId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

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
