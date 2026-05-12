import { NextRequest, NextResponse } from "next/server";
import { prisma, createProduct, serializeProductList } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId } = body;

    const storeIdParam = request.nextUrl.searchParams.get("storeId") || storeId;
    if (!storeIdParam) {
      return NextResponse.json({ error: "storeId is required" }, { status: 400 });
    }

    const csvData = body.csvData;
    if (!csvData || !Array.isArray(csvData)) {
      return NextResponse.json({ error: "csvData array is required" }, { status: 400 });
    }

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      try {
        if (!row.name || row.price === undefined) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: name and price are required`);
          continue;
        }

        const tags = row.tags
          ? row.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : [];

        const images = row.image || row.images
          ? [row.image || row.images].filter(Boolean)
          : [];

        await createProduct(storeIdParam, {
          name: row.name,
          price: parseFloat(row.price) || 0,
          description: row.description || "",
          images,
          stock: parseInt(row.stock) || 0,
          categoryId: row.category || undefined,
          tags,
          status: (row.status as "active" | "draft" | "archived") || "active",
          comparePrice: row.comparePrice ? parseFloat(row.comparePrice) : null,
          costPrice: row.costPrice ? parseFloat(row.costPrice) : null,
          lowStockThreshold: row.lowStockThreshold ? parseInt(row.lowStockThreshold) : 5,
        });
        results.success++;
      } catch (err: unknown) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
