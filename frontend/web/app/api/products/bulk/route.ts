import { NextRequest, NextResponse } from "next/server";
import { getProductsByStoreId, createProduct, products as productStore, Product } from "@/lib/data-store";

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

        const variants: { id: string; name: string; price?: number; stock?: number; attributes: Record<string, string> }[] = [];
        if (row.sizes) {
          const sizes = row.sizes.split(",").map((s: string) => s.trim()).filter(Boolean);
          const price = parseFloat(row.price) || 0;
          const stock = parseInt(row.stock) || 0;
          sizes.forEach((size: string) => {
            variants.push({
              id: `v-${Math.random().toString(36).substring(2, 8)}`,
              name: size,
              price,
              stock,
              attributes: { size },
            });
          });
        }

        const images = row.image || row.images
          ? [row.image || row.images].filter(Boolean)
          : [];

        const productData: Partial<Product> = {
          name: row.name,
          price: parseFloat(row.price) || 0,
          description: row.description || "",
          images,
          stock: parseInt(row.stock) || 0,
          categoryId: row.category || undefined,
          tags,
          variants: row.sizes ? variants : [],
          status: (row.status as "active" | "draft" | "archived") || "active",
          comparePrice: row.comparePrice ? parseFloat(row.comparePrice) : undefined,
          costPrice: row.costPrice ? parseFloat(row.costPrice) : undefined,
          lowStockThreshold: row.lowStockThreshold ? parseInt(row.lowStockThreshold) : 5,
        };

        createProduct(storeIdParam, productData);
        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}