import { NextRequest, NextResponse } from "next/server";
import { configureAI, aiComplete } from "@bdesh/ai";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rate-limit";

interface StoreContentRequest {
  storeName: string;
  businessType: string;
  industry?: string;
  websiteType?: string;
  tone?: "professional" | "friendly" | "luxury" | "casual" | "bangla";
  lang?: "en" | "bn";
  sections?: string[];
}

const VALID_SECTIONS = new Set([
  "hero",
  "about",
  "features",
  "products",
  "testimonials",
  "faq",
  "contact",
  "footer",
  "meta",
]);

export async function POST(req: NextRequest) {
  const rateResult = checkRateLimit(req, RATE_LIMITS.ai, getClientIdentifier(req));
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Too many AI requests. Please wait a moment and try again." },
      { status: 429, headers: rateResult.headers }
    );
  }

  try {
    const body: StoreContentRequest = await req.json();
    const {
      storeName,
      businessType,
      industry,
      websiteType,
      tone = "professional",
      lang = "en",
      sections = ["hero", "about", "features", "products", "testimonials", "faq", "meta"],
    } = body;

    if (!storeName || !businessType) {
      return NextResponse.json(
        { error: "storeName and businessType are required" },
        { status: 400 }
      );
    }

    // Validate sections
    const validSections = sections.filter((s) => VALID_SECTIONS.has(s));
    if (validSections.length === 0) {
      return NextResponse.json(
        { error: "At least one valid section is required" },
        { status: 400 }
      );
    }

    // Configure AI provider (OpenRouter priority)
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (openrouterKey) {
      configureAI({ apiKey: openrouterKey, provider: "openrouter" });
    } else if (openaiKey) {
      configureAI({ apiKey: openaiKey, provider: "openai", model: "gpt-4o-mini" });
    }

    const langInstruction = lang === "bn" ? " Respond in Bangla (Bengali) language." : "";
    const bangladeshContext = "This is a Bangladeshi e-commerce store. Accept bKash, Nagad, Rocket, and COD payments. Prices in BDT (৳). Delivery across 64 districts.";

    const systemPrompt = `You are a professional e-commerce content writer for BdeshShop, Bangladesh's #1 website builder. Write in ${tone} tone. ${bangladeshContext}${langInstruction}

Respond ONLY with valid JSON matching this exact schema:
{
  "hero": { "headline": "...", "subheadline": "...", "ctaText": "..." },
  "about": { "title": "...", "description": "..." },
  "features": [{ "title": "...", "description": "...", "icon": "truck|shield|headphones|credit-card|star|clock" }],
  "products": [{ "name": "...", "description": "...", "price": number, "category": "..." }],
  "testimonials": [{ "name": "...", "text": "...", "rating": number, "location": "..." }],
  "faq": [{ "question": "...", "answer": "..." }],
  "contact": { "phone": "...", "email": "...", "address": "..." },
  "footer": { "tagline": "...", "copyright": "..." },
  "meta": { "title": "...", "description": "...", "keywords": ["..."] }
}

Only include the sections requested. Be specific to the business type and Bangladesh market. Product prices should be realistic in BDT.`;

    const userPrompt = `Generate content for a ${businessType} store called "${storeName}"${industry ? ` in the ${industry} industry` : ""}${websiteType ? ` (website type: ${websiteType})` : ""}.

Sections to generate: ${validSections.join(", ")}

Make the content compelling, SEO-friendly, and tailored for Bangladeshi customers. Use culturally appropriate references and realistic pricing in BDT.`;

    const result = await aiComplete({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      responseFormat: "json",
    });

    // Parse the JSON response
    let content;
    try {
      const jsonStr = result.content.replace(/```json\n?|\n?```/g, "").trim();
      content = JSON.parse(jsonStr);
    } catch {
      // If JSON parsing fails, return the raw content
      content = { raw: result.content };
    }

    return NextResponse.json({
      content,
      provider: result.provider,
      model: result.model,
      cached: result.cached || false,
    });
  } catch (error: any) {
    console.error("Store content generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate store content" },
      { status: 500 }
    );
  }
}
