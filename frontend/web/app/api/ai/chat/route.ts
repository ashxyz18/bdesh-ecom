import { NextRequest, NextResponse } from "next/server";
import { configureAI, aiComplete } from "@bdesh/ai";
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
    const { messages, config: aiConfig } = await req.json();
    const apiKey = req.headers.get("x-ai-api-key") || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      configureAI({ apiKey, provider: "openrouter" });
    }

    const systemPrompt = `You are BdeshBot, the AI assistant for BdeshShop — Bangladesh's #1 e-commerce website builder. You help Bangladeshi merchants build and grow their online stores.

Your capabilities:
- Answer questions about setting up an online store
- Provide e-commerce and digital marketing advice for Bangladesh market
- Help with product setup, pricing strategy, and inventory management
- Give tips on bKash, Nagad, Rocket, and COD payment integration
- Suggest marketing campaigns, social media strategies, and SEO tips
- Explain template customization, domain setup, and store settings
- Analyze store performance data and suggest improvements

Always be helpful, concise, and professional. When giving pricing advice, mention prices in BDT (৳). Know that Bangladesh e-commerce has unique characteristics like cash-on-delivery preference, bKash merchant accounts, and delivery across 64 districts.

Response format: Reply in ${req.headers.get("x-lang") === "bn" ? "Bangla (Bengali)" : "English"} language.`;

    const result = await aiComplete({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      config: aiConfig,
    });

    return NextResponse.json({ content: result.content });
  } catch (error: any) {
    return NextResponse.json(
      { content: "আমি এই মুহূর্তে AI সহায়তা দিতে পারছি না। অনুগ্রহ করে আবার চেষ্টা করুন।\n\nI'm unable to provide AI assistance right now. Please try again." },
      { status: 500 }
    );
  }
}
