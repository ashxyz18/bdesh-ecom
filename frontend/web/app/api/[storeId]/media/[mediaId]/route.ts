import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { deleteFile, getStorageKeyFromUrl } from "@/lib/storage";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; mediaId: string }> }
) {
  try {
    const { storeId, mediaId } = await params;
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

    // Find the media record
    const media = await prisma.media.findFirst({
      where: { id: mediaId, storeId },
    });

    if (!media) {
      return NextResponse.json(
        { message: "Media not found" },
        { status: 404 }
      );
    }

    // Try to delete from storage
    const storageKey = getStorageKeyFromUrl(media.url);
    if (storageKey) {
      await deleteFile(storageKey);
    }

    // Delete from database
    await prisma.media.delete({ where: { id: mediaId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Media delete error:", error);
    return NextResponse.json(
      { message: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}
