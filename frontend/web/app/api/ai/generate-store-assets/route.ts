import { NextRequest, NextResponse } from "next/server";
import { generateStoreAssets } from "@bdesh/ai";

const ALLOWED_STYLES = new Set(["minimal", "bold", "luxury", "playful", "corporate"]);
const ALLOWED_ASSET_TYPES = new Set([
  "logo",
  "banner",
  "favicon",
  "social-facebook",
  "social-instagram",
  "social-twitter",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeName, businessType, style, assetTypes } = body;

    if (!storeName || typeof storeName !== "string" || !storeName.trim()) {
      return NextResponse.json(
        { error: "storeName is required" },
        { status: 400 }
      );
    }

    if (!assetTypes || !Array.isArray(assetTypes) || assetTypes.length === 0) {
      return NextResponse.json(
        { error: "assetTypes array is required" },
        { status: 400 }
      );
    }

    const invalidAssetType = assetTypes.find((value: unknown) => typeof value !== "string" || !ALLOWED_ASSET_TYPES.has(value));
    if (invalidAssetType) {
      return NextResponse.json(
        { error: "assetTypes contains invalid values" },
        { status: 400 }
      );
    }

    if (style && !ALLOWED_STYLES.has(style)) {
      return NextResponse.json(
        { error: "Invalid style value" },
        { status: 400 }
      );
    }

    const result = await generateStoreAssets({
      storeName: storeName.trim(),
      businessType: typeof businessType === "string" ? businessType.trim() : undefined,
      style: style || "corporate",
      assetTypes,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Store asset generation error:", error);
    const message = error instanceof Error ? error.message : "Asset generation failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
