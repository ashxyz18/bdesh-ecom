import { NextRequest, NextResponse } from "next/server";
import { configureAI, generateTemplateFromPrompt } from "@bdesh/ai";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 10 AI requests per minute per IP
  const rateResult = checkRateLimit(req, RATE_LIMITS.ai, getClientIdentifier(req));
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Too many AI requests. Please wait a moment and try again." },
      { status: 429, headers: rateResult.headers },
    );
  }

  try {
    const body = await req.json();
    const { prompt, businessName, industry, websiteType } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Priority: OPENROUTER_API_KEY > OPENAI_API_KEY
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (openrouterKey) {
      // Use OpenRouter (has free models)
      configureAI({ apiKey: openrouterKey, provider: "openrouter" });
    } else if (openaiKey) {
      // Fallback to OpenAI directly
      configureAI({ apiKey: openaiKey, provider: "openai", model: "gpt-4o-mini" });
    }

    const result = await generateTemplateFromPrompt({
      prompt,
      businessName,
      industry,
      websiteType,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate template from prompt" },
      { status: 500 }
    );
  }
}
