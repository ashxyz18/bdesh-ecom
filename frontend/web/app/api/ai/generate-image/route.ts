import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@bdesh/ai";

const ALLOWED_STYLES = new Set(["photorealistic", "artistic", "minimal", "luxury", "playful"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, productName, storeName, style, width, height, negativePrompt, count } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (style && !ALLOWED_STYLES.has(style)) {
      return NextResponse.json(
        { error: "Invalid style value" },
        { status: 400 }
      );
    }

    const normalizedWidth =
      typeof width === "number" && Number.isFinite(width) ? Math.min(Math.max(Math.floor(width), 256), 2048) : 1024;
    const normalizedHeight =
      typeof height === "number" && Number.isFinite(height) ? Math.min(Math.max(Math.floor(height), 256), 2048) : 1024;
    const normalizedCount =
      typeof count === "number" && Number.isFinite(count) ? Math.min(Math.max(Math.floor(count), 1), 4) : 1;

    const result = await generateImage({
      prompt: prompt.trim(),
      productName: typeof productName === "string" ? productName.trim() : undefined,
      storeName: typeof storeName === "string" ? storeName.trim() : undefined,
      style,
      width: normalizedWidth,
      height: normalizedHeight,
      negativePrompt: typeof negativePrompt === "string" ? negativePrompt.trim() : undefined,
      count: normalizedCount,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Image generation error:", error);
    const message = error instanceof Error ? error.message : "Image generation failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
