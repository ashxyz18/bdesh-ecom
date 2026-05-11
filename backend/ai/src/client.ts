import type { AIConfig, AICompletionRequest, AICompletionResponse } from "./types";
import { OPENROUTER_CONFIG, GOOGLE_CONFIG, GROQ_CONFIG, OPENAI_CONFIG, LOCAL_CONFIG } from "./types";

// Build provider chain lazily at request time (env vars may not be available at import time)
function buildProviderChain(): AIConfig[] {
  const chain: AIConfig[] = [];
  const openRouterKey = typeof process !== 'undefined' && process.env?.OPENROUTER_API_KEY;
  const googleKey = typeof process !== 'undefined' && process.env?.GOOGLE_API_KEY;
  const openAIKey = typeof process !== 'undefined' && process.env?.OPENAI_API_KEY;

  if (openRouterKey) chain.push({ ...OPENROUTER_CONFIG, apiKey: process.env.OPENROUTER_API_KEY, model: "google/gemma-4-31b-it:free" });
  if (googleKey) chain.push({ ...GOOGLE_CONFIG, apiKey: process.env.GOOGLE_API_KEY });
  if (openAIKey) chain.push({ ...OPENAI_CONFIG, apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o-mini" });
  chain.push({ ...LOCAL_CONFIG });
  return chain;
}

// Mutable provider chain — rebuilt lazily when env vars become available
let providerChain: AIConfig[] = buildProviderChain();
let chainInitialized = providerChain.length > 1; // true if any real provider was found

// Ensure chain is rebuilt with fresh env vars on first request
function ensureChainInitialized(): void {
  if (!chainInitialized) {
    providerChain = buildProviderChain();
    config = providerChain[0] || { ...LOCAL_CONFIG };
    chainInitialized = providerChain.length > 1;
  }
}

// Default config — first provider in chain
let config: AIConfig = providerChain[0] || { ...LOCAL_CONFIG };

// Simple in-memory cache for identical requests
const responseCache = new Map<string, { response: AICompletionResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limiting
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 20;

function checkRateLimit(): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;
  const recentRequests = requestTimestamps.filter((t) => t > oneMinuteAgo);
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  requestTimestamps.push(now);
  return true;
}

function getCacheKey(request: AICompletionRequest, cfg: AIConfig): string {
  const messagesHash = request.messages.map((m) => `${m.role}:${m.content}`).join("|");
  return `${cfg.provider}:${cfg.model}:${messagesHash}:${cfg.maxTokens}:${cfg.temperature}:${request.responseFormat || "text"}`;
}

function getCachedResponse(key: string): AICompletionResponse | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { ...cached.response, cached: true };
  }
  if (cached) {
    responseCache.delete(key);
  }
  return null;
}

function setCachedResponse(key: string, response: AICompletionResponse): void {
  responseCache.set(key, { response, timestamp: Date.now() });
  // Prune old entries
  if (responseCache.size > 100) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
}

const FALLBACK_RESPONSES: Record<string, string> = {
  product_description:
    "This premium product is designed for quality and style. Perfect for everyday use with exceptional durability. Made with the finest materials, it offers unmatched value for money. Order now and enjoy fast delivery across Bangladesh with bKash & Nagad payment options.",
  store_tagline:
    "Discover quality products at unbeatable prices — your trusted online destination in Bangladesh.",
  hero_text:
    "Experience the best shopping in Bangladesh. Fast delivery, secure payments, and quality products.",
  meta_description:
    "Shop the best products online in Bangladesh. Fast delivery, bKash and Nagad payment options available.",
  marketing_copy:
    "Don't miss out! Shop now and enjoy exclusive deals with fast delivery across Bangladesh. bKash & Nagad accepted! 🛒",
  social_post:
    "🎉 Special offer at our store! Shop the best products in Bangladesh with fast delivery. bKash & Nagad accepted! #Bangladesh #OnlineShopping #BixelBD",
  email_subject:
    "Exclusive deals just for you — shop now and save!",
  sms_campaign:
    "Special offer! Get 20% off on all products. Order now at our store. bKash/Nagad accepted. Free delivery over ৳1000.",
  faq_answer:
    "We offer fast delivery across Bangladesh, accept bKash, Nagad, and cash on delivery. Our return policy covers 7 days from delivery. For any questions, contact our support team.",
};

const BANGLA_FALLBACKS: Record<string, string> = {
  product_description:
    "এই প্রিমিয়াম পণ্যটি মান এবং স্টাইলের জন্য ডিজাইন করা। প্রতিদিনের ব্যবহারের জন্য অসাধারণ স্থায়িত্ব সহ। এখনই অর্ডার করুন এবং বিকাশ ও নগদ পেমেন্ট অপশন সহ সারা বাংলাদেশে দ্রুত ডেলিভারি উপভোগ করুন।",
  store_tagline:
    "অতুলনীয় মূল্যে মানসম্পন্ন পণ্য আবিষ্কার করুন — বাংলাদেশের বিশ্বস্ত অনলাইন গন্তব্য।",
  hero_text:
    "বাংলাদেশে সেরা শপিং অভিজ্ঞতা। দ্রুত ডেলিভারি, নিরাপদ পেমেন্ট, এবং মানসম্পন্ন পণ্য।",
  marketing_copy:
    "এই সুযোগ হাতছাড়া করবেন না! এখনই শপ করুন এবং সারা বাংলাদেশে দ্রুত ডেলিভারি সহ এক্সক্লুসিভ ডিল উপভোগ করুন। 🛒",
  social_post:
    "🎉 আমাদের স্টোরে বিশেষ অফার! দ্রুত ডেলিভারি সহ বাংলাদেশের সেরা পণ্য কিনুন। বিকাশ ও নগদ গ্রহণযোগ্য! #বাংলাদেশ #অনলাইনশপিং",
};

export function configureAI(cfg: Partial<AIConfig>) {
  config = { ...config, ...cfg };
  // Rebuild provider chain with the new config at the front
  const existingIndex = providerChain.findIndex(p => p.provider === cfg.provider);
  if (existingIndex !== -1) {
    providerChain[existingIndex] = { ...providerChain[existingIndex], ...cfg };
  }
  // Move the configured provider to the front of the chain
  if (cfg.provider && cfg.apiKey) {
    const idx = providerChain.findIndex(p => p.provider === cfg.provider);
    if (idx > 0) {
      const [item] = providerChain.splice(idx, 1);
      providerChain.unshift(item);
    }
  }
}

export function getAIConfig(): AIConfig {
  return { ...config };
}

export function getAvailableProviders(): { id: AIConfig["provider"]; name: string; models: string[] }[] {
  return [
    { id: "openrouter", name: "OpenRouter", models: ["google/gemma-4-31b-it:free", "google/gemini-2.0-flash-001", "anthropic/claude-3.5-sonnet", "meta-llama/llama-3.3-70b-instruct"] },
    { id: "google", name: "Google AI", models: ["gemini-2.0-flash", "gemini-1.5-pro"] },
    { id: "groq", name: "Groq", models: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768"] },
    { id: "openai", name: "OpenAI", models: ["gpt-4o-mini", "gpt-4o"] },
    { id: "local", name: "Local Fallback", models: ["local-fallback"] },
  ];
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 2,
  delay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = response.headers.get("retry-after");
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay * (attempt + 1);
        if (attempt < retries) {
          await sleep(waitTime);
          continue;
        }
      }

      if (response.status >= 500 && attempt < retries) {
        await sleep(delay * (attempt + 1));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries) {
        await sleep(delay * (attempt + 1));
      }
    }
  }

  throw lastError || new Error("Request failed after retries");
}

function buildOpenAICompatibleRequest(cfg: AIConfig, request: AICompletionRequest): { url: string; body: Record<string, unknown>; headers: Record<string, string> } {
  const url = `${cfg.baseUrl}/chat/completions`;
  const body: Record<string, unknown> = {
    model: cfg.model,
    messages: request.messages,
    max_tokens: cfg.maxTokens,
    temperature: cfg.temperature,
  };

  if (request.responseFormat === "json") {
    body.response_format = { type: "json_object" };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cfg.apiKey}`,
  };

  if (cfg.provider === "openrouter") {
    headers["HTTP-Referer"] = "https://bdesh.shop";
    headers["X-Title"] = "BixelBD";
  }

  return { url, body, headers };
}

function parseOpenAICompatibleResponse(data: any, cfg: AIConfig): AICompletionResponse {
  return {
    content: data.choices?.[0]?.message?.content || "",
    finishReason: data.choices?.[0]?.finish_reason || "stop",
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0,
        }
      : undefined,
    provider: cfg.provider,
    model: cfg.model,
  };
}

export async function aiComplete(
  request: AICompletionRequest
): Promise<AICompletionResponse> {
  // Ensure provider chain is built with fresh env vars
  ensureChainInitialized();

  // Check rate limit
  if (!checkRateLimit()) {
    throw new Error("Rate limit exceeded. Please wait a moment and try again.");
  }

  // If request overrides config, use single provider
  const overrideConfig = request.config;
  const providersToTry: AIConfig[] = overrideConfig
    ? [{ ...config, ...overrideConfig }]
    : providerChain;

  // Try each provider in the fallback chain
  for (const providerConfig of providersToTry) {
    const mergedConfig = providerConfig;

    // Skip local provider until it's the last resort
    if (mergedConfig.provider === "local" || !mergedConfig.apiKey) {
      continue;
    }

    // Check cache
    const cacheKey = getCacheKey(request, mergedConfig);
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    const retries = mergedConfig.retries ?? 2;
    const retryDelay = mergedConfig.retryDelay ?? 1000;

    try {
      // Google AI has a different API format
      if (mergedConfig.provider === "google") {
        const result = await handleGoogleAIRequest(request, mergedConfig, cacheKey, retries, retryDelay);
        return result;
      }

      // OpenAI-compatible providers (OpenRouter, OpenAI, Groq)
      const { url, body, headers } = buildOpenAICompatibleRequest(mergedConfig, request);

      const response = await fetchWithRetry(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }, retries, retryDelay);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(`AI API error: ${response.status} - ${errorBody}`);
      }

      const data = (await response.json()) as Record<string, any>;
      const result = parseOpenAICompatibleResponse(data, mergedConfig);
      setCachedResponse(cacheKey, result);
      return result;
    } catch (error) {
      // Log and try next provider in chain
      console.warn(`AI provider ${mergedConfig.provider} failed, trying next in chain:`, error instanceof Error ? error.message : error);
      continue;
    }
  }

  // All providers failed — use local fallback
  console.warn("All AI providers failed, using local fallback");
  return generateLocalFallback(request, config);
}

async function handleGoogleAIRequest(
  request: AICompletionRequest,
  cfg: AIConfig,
  cacheKey: string,
  retries: number,
  retryDelay: number
): Promise<AICompletionResponse> {
  const url = `${cfg.baseUrl}/models/${cfg.model}:generateContent?key=${cfg.apiKey}`;

  const contents = request.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: cfg.maxTokens,
      temperature: cfg.temperature,
    },
  };

  if (request.responseFormat === "json") {
    const gc = body.generationConfig as Record<string, unknown>;
    body.generationConfig = { ...gc, responseMimeType: "application/json" };
  }

  const response = await fetchWithRetry(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }, retries, retryDelay);

  if (!response.ok) {
    throw new Error(`Google AI API error: ${response.status}`);
  }

  const data = (await response.json()) as Record<string, any>;
  const result: AICompletionResponse = {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
    finishReason: data.candidates?.[0]?.finishReason || "stop",
    usage: data.usageMetadata
      ? {
          promptTokens: data.usageMetadata.promptTokenCount || 0,
          completionTokens: data.usageMetadata.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata.totalTokenCount || 0,
        }
      : undefined,
    provider: cfg.provider,
    model: cfg.model,
  };

  setCachedResponse(cacheKey, result);
  return result;
}

function generateLocalFallback(
  request: AICompletionRequest,
  cfg: AIConfig
): AICompletionResponse {
  const lastUserMsg =
    request.messages.filter((m) => m.role === "user").pop()?.content || "";

  // Check for Bangla language request
  const isBangla = lastUserMsg.includes("bangla") || lastUserMsg.includes("bengali") ||
    request.messages.some((m) => m.content.includes("lang") && m.content.includes("bn"));

  // Try to match against known content types
  for (const [key, value] of Object.entries(FALLBACK_RESPONSES)) {
    if (lastUserMsg.toLowerCase().includes(key.replace(/_/g, " "))) {
      return {
        content: isBangla ? (BANGLA_FALLBACKS[key] || value) : value,
        finishReason: "stop",
        provider: "local",
        model: "local-fallback",
      };
    }
  }

  // Context-aware fallbacks based on keywords
  const lowerMsg = lastUserMsg.toLowerCase();

  if (lowerMsg.includes("seo") || lowerMsg.includes("search engine")) {
    return {
      content: "To improve your SEO: 1) Use descriptive meta titles under 60 characters, 2) Write compelling meta descriptions under 160 characters, 3) Include relevant keywords naturally, 4) Add structured data (JSON-LD), 5) Optimize images with alt text, 6) Ensure fast page loading speed, 7) Set up Google Search Console.",
      finishReason: "stop",
      provider: "local",
      model: "local-fallback",
    };
  }

  if (lowerMsg.includes("marketing") || lowerMsg.includes("promot")) {
    return {
      content: "Marketing tips for your BixelBD store: 1) Set up bKash/Nagad payments to reach 90% of Bangladeshi customers, 2) Create Facebook page and run targeted ads, 3) Offer free delivery on orders over ৳1,000, 4) Use WhatsApp Business for customer support, 5) Create seasonal campaigns for Eid, Puja, and Pohela Boishakh.",
      finishReason: "stop",
      provider: "local",
      model: "local-fallback",
    };
  }

  if (lowerMsg.includes("template") || lowerMsg.includes("design")) {
    return {
      content: "For your business type, I recommend: 1) Roseo for fashion/luxury stores, 2) Electro for electronics, 3) Grocer for grocery stores, 4) Salon Pro for beauty businesses, 5) Food for restaurants, 6) Boutique for fashion boutiques. Each template is optimized for Bangladesh with bKash/Nagad integration.",
      finishReason: "stop",
      provider: "local",
      model: "local-fallback",
    };
  }

  if (lowerMsg.includes("social") || lowerMsg.includes("facebook") || lowerMsg.includes("instagram")) {
    return {
      content: "🎉 Special offer at our store! Shop the best products in Bangladesh with fast delivery. bKash & Nagad accepted! #Bangladesh #OnlineShopping #BixelBD",
      finishReason: "stop",
      provider: "local",
      model: "local-fallback",
    };
  }

  if (lowerMsg.includes("email") || lowerMsg.includes("campaign")) {
    return {
      content: "Subject: Exclusive deals just for you — shop now and save!\n\nHi [Customer Name],\n\nWe have exciting offers waiting for you! Get up to 20% off on selected items this week.\n\n🛒 Shop Now | Fast Delivery | bKash & Nagad Accepted\n\nBest regards,\nYour Store Team",
      finishReason: "stop",
      provider: "local",
      model: "local-fallback",
    };
  }

  // Default fallback
  return {
    content: isBangla
      ? "আমি আপনার অনলাইন স্টোর তৈরি করতে সাহায্য করতে এখানে আছি! টেমপ্লেট, পণ্য সেটআপ, মার্কেটিং টিপস বা আপনার BixelBD স্টোর সম্পর্কে অন্য কিছু জিজ্ঞাসা করুন।"
      : "I'm here to help you build your online store! Ask me about templates, product setup, marketing tips, SEO optimization, or anything else about your BixelBD store.",
    finishReason: "stop",
    provider: "local",
    model: "local-fallback",
  };
}

export async function aiCompleteStream(
  request: AICompletionRequest
): Promise<ReadableStream<Uint8Array> | null> {
  // Ensure provider chain is built with fresh env vars
  ensureChainInitialized();

  // Try each provider in the chain for streaming
  for (const providerConfig of providerChain) {
    const mergedConfig = { ...providerConfig, ...request.config };

    if (mergedConfig.provider === "local" || !mergedConfig.apiKey) {
      continue;
    }

    try {
      // Google AI streaming
      if (mergedConfig.provider === "google") {
        return await handleGoogleAIStream(request, mergedConfig);
      }

      // OpenAI-compatible streaming
      const { url, body, headers } = buildOpenAICompatibleRequest(mergedConfig, request);
      const streamBody = { ...body, stream: true };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(streamBody),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      return response.body;
    } catch (error) {
      console.warn(`AI stream provider ${providerConfig.provider} failed, trying next:`, error instanceof Error ? error.message : error);
      continue;
    }
  }

  // All providers failed — fallback to non-streaming local
  const fallback = await aiComplete(request);
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(fallback.content));
      controller.close();
    },
  });
}

async function handleGoogleAIStream(
  request: AICompletionRequest,
  cfg: AIConfig
): Promise<ReadableStream<Uint8Array> | null> {
  const url = `${cfg.baseUrl}/models/${cfg.model}:streamGenerateContent?alt=sse&key=${cfg.apiKey}`;

  const contents = request.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: cfg.maxTokens,
        temperature: cfg.temperature,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Google AI API error: ${response.status}`);
  }

  return response.body;
}

// Utility: Clear the response cache
export function clearAICache(): void {
  responseCache.clear();
}

// Utility: Get cache stats
export function getAICacheStats(): { size: number; hitRate: number } {
  return {
    size: responseCache.size,
    hitRate: 0, // Would need hit/miss counters for real rate
  };
}
