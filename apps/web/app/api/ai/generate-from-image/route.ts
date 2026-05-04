import { NextRequest, NextResponse } from "next/server";
import { configureAI, generateTemplateFromImage } from "@bdesh/ai";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rateResult = checkRateLimit(req, RATE_LIMITS.ai, getClientIdentifier(req));
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Too many AI requests. Please wait a moment and try again." },
      { status: 429, headers: rateResult.headers },
    );
  }

  try {
    const body = await req.json();
    const { imageBase64, imageUrl, businessName, businessType, websiteType } = body;

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { error: "Either imageBase64 or imageUrl is required" },
        { status: 400 }
      );
    }

    // Priority: OPENAI_API_KEY > OPENROUTER_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    if (openaiKey) {
      // Use OpenAI directly (GPT-4o-mini is very affordable)
      configureAI({ apiKey: openaiKey, provider: "openai", model: "gpt-4o-mini" });
    } else if (openrouterKey) {
      // Fallback to OpenRouter (has free models)
      configureAI({ apiKey: openrouterKey, provider: "openrouter" });
    }

    const result = await generateTemplateFromImage({
      imageBase64,
      imageUrl,
      businessName,
      businessType,
      websiteType,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate template from image" },
      { status: 500 }
    );
  }
}
