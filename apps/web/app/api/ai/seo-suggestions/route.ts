import { NextRequest, NextResponse } from "next/server";
import { configureAI, analyzeSEO } from "@bdesh/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = req.headers.get("x-ai-api-key") || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      configureAI({ apiKey, provider: "openrouter" });
    }

    const analysis = await analyzeSEO(body);
    return NextResponse.json(analysis);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "SEO analysis failed" },
      { status: 500 }
    );
  }
}
