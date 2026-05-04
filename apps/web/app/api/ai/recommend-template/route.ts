import { NextRequest, NextResponse } from "next/server";
import { configureAI, recommendTemplate } from "@bdesh/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = req.headers.get("x-ai-api-key") || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      configureAI({ apiKey, provider: "openrouter" });
    }

    const recommendation = await recommendTemplate(body);
    return NextResponse.json(recommendation);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Template recommendation failed" },
      { status: 500 }
    );
  }
}
