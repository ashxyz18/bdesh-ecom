import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: any = { storeId };
    if (type) where.type = type.toUpperCase();
    if (search) where.name = { contains: search, mode: "insensitive" };

    const media = await prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      media: media.map((m) => ({
        id: m.id,
        url: m.url,
        name: m.name,
        type: m.type,
        size: m.size,
        mimeType: m.mimeType,
        altText: m.altText,
        createdAt: m.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Media list error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const session = await requireAuth();

    // Verify store ownership
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return NextResponse.json(
        { message: "Store not found" },
        { status: 404 }
      );
    }
    if (store.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: `File type ${file.type} is not allowed. Accepted: JPEG, PNG, GIF, WebP, SVG, AVIF` },
        { status: 400 }
      );
    }

    // Upload to storage
    const { url, storageKey } = await uploadFile(storeId, file);

    // Determine media type
    const mediaType = file.type.startsWith("image/")
      ? "IMAGE"
      : file.type.startsWith("video/")
      ? "VIDEO"
      : "DOCUMENT";

    // Save to database
    const media = await prisma.media.create({
      data: {
        storeId,
        url,
        name: file.name,
        type: mediaType,
        size: file.size,
        mimeType: file.type,
        altText: formData.get("altText") as string | null,
      },
    });

    return NextResponse.json({
      media: {
        id: media.id,
        url: media.url,
        name: media.name,
        type: media.type,
        size: media.size,
        mimeType: media.mimeType,
        altText: media.altText,
        createdAt: media.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { message: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
