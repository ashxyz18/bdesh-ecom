import { NextRequest, NextResponse } from "next/server";
import { prisma, isAdmin } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { writeFile, mkdir, readFile, rm } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const TEMPLATES_DIR = path.join(process.cwd(), "public", "uploaded-templates");

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isAdmin(userId);
    if (!admin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const uploadedTemplates = await prisma.template.findMany({
      where: {
        uploadedBy: userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        slug: true,
      },
    });

    return NextResponse.json({
      success: true,
      uploadedTemplates: uploadedTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
      })),
    });
  } catch (error) {
    console.error("Get templates error:", error);
    return NextResponse.json({ error: "Failed to get templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isAdmin(userId);
    if (!admin) {
      return NextResponse.json({ error: "Admin only. Only administrators can upload templates." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;

    if (!file || !name) {
      return NextResponse.json({ error: "File and name are required" }, { status: 400 });
    }

    if (!file.name.endsWith(".zip")) {
      return NextResponse.json({ error: "Only .zip files are accepted" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const templateId = `uploaded-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const template = await prisma.template.create({
      data: {
        id: templateId,
        name,
        slug: templateId,
        description: "Uploaded custom template",
        config: "{}",
        thumbnail: "",
        uploadedBy: userId,
        isPublic: true,
        isBuiltIn: false,
      },
    });

    const templateDir = path.join(TEMPLATES_DIR, templateId);
    if (!existsSync(templateDir)) {
      await mkdir(templateDir, { recursive: true });
    }

    const zipPath = path.join(templateDir, "template.zip");
    await writeFile(zipPath, buffer);

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        status: "uploaded",
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload template" }, { status: 500 });
  }
}