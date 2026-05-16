import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;

    // Verify store exists
    const store = await prisma.store.findFirst({
      where: { id: storeId, deletedAt: null },
    });
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Prepare upload directory
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "stores",
      storeId
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.name) || ".png";
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const timestamp = Date.now();
    const fileName = `${baseName}_${timestamp}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Public URL path
    const publicUrl = `/uploads/stores/${storeId}/${fileName}`;

    // Create Media record
    await prisma.media.create({
      data: {
        storeId,
        url: publicUrl,
        name: file.name,
        type: "IMAGE",
        size: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
