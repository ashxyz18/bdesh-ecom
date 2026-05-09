import { NextRequest, NextResponse } from "next/server";
import { configureAI, getAIConfig, getAvailableProviders } from "@bdesh/ai";
import { getSessionUser } from "@/lib/auth";

/**
 * GET /api/ai/settings
 * Returns the current AI configuration status (without exposing API keys)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "MERCHANT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = getAIConfig();
    const providers = getAvailableProviders();

    // Determine which providers have keys configured
    const keyStatus: Record<string, boolean> = {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      google: !!process.env.GOOGLE_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      local: true,
    };

    return NextResponse.json({
      activeProvider: config.provider,
      activeModel: config.model,
      providers: providers.map((p) => ({
        id: p.id,
        name: p.name,
        configured: keyStatus[p.id] || false,
        models: p.models,
      })),
      hasOpenRouterKey: keyStatus.openrouter,
      hasOpenAIKey: keyStatus.openai,
      hasGoogleKey: keyStatus.google,
      hasGroqKey: keyStatus.groq,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get AI settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/settings
 * Test an API key by making a simple completion request
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "MERCHANT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { provider, apiKey, model } = body;

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "provider and apiKey are required" },
        { status: 400 }
      );
    }

    const validProviders = ["openrouter", "openai", "google", "groq"];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Invalid provider. Must be one of: ${validProviders.join(", ")}` },
        { status: 400 }
      );
    }

    // Configure with the provided key
    configureAI({
      apiKey,
      provider,
      ...(model ? { model } : {}),
    });

    // Test with a simple request
    const { aiComplete } = await import("@bdesh/ai");
    const result = await aiComplete({
      messages: [
        { role: "user", content: "Say 'OK' in one word." },
      ],
      config: { maxTokens: 10 },
    });

    return NextResponse.json({
      success: true,
      provider: result.provider,
      model: result.model,
      message: `Successfully connected to ${provider} using ${result.model}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to test API key",
      },
      { status: 400 }
    );
  }
}
