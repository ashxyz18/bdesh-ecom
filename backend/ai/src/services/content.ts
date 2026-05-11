import { aiComplete } from "../client";
import type {
  ContentGenerationRequest,
  TemplateRecommendationRequest,
  TemplateRecommendationResponse,
  SEOAnalysisRequest,
  SEOAnalysisResponse,
  MarketingInsightRequest,
  MarketingInsightResponse,
  SocialPostRequest,
  SocialPostResponse,
} from "../types";

export async function generateContent(
  request: ContentGenerationRequest
): Promise<string> {
  const langInstruction = request.lang === "bn" ? " Respond in Bangla (Bengali) language." : "";
  const systemPrompt = `You are a professional e-commerce content writer for BixelBD, Bangladesh's #1 website builder. Write in ${request.tone || "professional"} tone.${langInstruction}`;
  
  const prompts: Record<string, string> = {
    product_description: `Write a compelling product description for "${request.productName}" in the ${request.businessType || "general"} category. Include key features and benefits.${langInstruction} Keep under 200 words.`,
    store_tagline: `Create a catchy, memorable tagline for a ${request.businessType || "e-commerce"} store called "${request.storeName || "My Store"}".${langInstruction} Under 10 words.`,
    hero_text: `Write a hero section headline and subheadline for a ${request.businessType || "e-commerce"} store. Headline should be bold and attention-grabbing.${langInstruction} Keep headline under 8 words.`,
    meta_description: `Write an SEO-optimized meta description for a ${request.businessType || "e-commerce"} store${request.productName ? ` selling "${request.productName}"` : ""}.${langInstruction} Under 160 characters.`,
    marketing_copy: `Write a short marketing copy (social media post) for a ${request.businessType || "e-commerce"} store${request.productName ? ` promoting "${request.productName}"` : ""}.${langInstruction} Include relevant hashtags. Under 280 characters.`,
    social_post: `Write an engaging social media post for ${request.platform || "facebook"} for a ${request.businessType || "e-commerce"} store${request.productName ? ` promoting "${request.productName}"` : ""}. Include emojis and hashtags.${langInstruction} Under ${request.platform === "twitter" ? "280" : "500"} characters.`,
    email_subject: `Write 3 compelling email subject lines for a ${request.businessType || "e-commerce"} store${request.productName ? ` about "${request.productName}"` : ""}. Make them attention-grabbing and under 50 characters each.${langInstruction}`,
    sms_campaign: `Write a short SMS campaign message for a ${request.businessType || "e-commerce"} store${request.productName ? ` promoting "${request.productName}"` : ""}. Must be under 160 characters. Include a call to action.${langInstruction}`,
    faq_answer: `Write a helpful FAQ answer for the question: "${request.context || request.productName || "general question"}" about a ${request.businessType || "e-commerce"} store in Bangladesh. Keep it concise and informative.${langInstruction}`,
  };

  const userPrompt = prompts[request.type] || `Generate content for a ${request.businessType || "e-commerce"} store.${langInstruction}`;

  try {
    const result = await aiComplete({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    return result.content;
  } catch {
    return `Generated content for ${request.businessType || "your store"} is currently unavailable. Please try again.`;
  }
}

export async function recommendTemplate(
  request: TemplateRecommendationRequest
): Promise<TemplateRecommendationResponse> {
  const systemPrompt = `You are a web design expert at BixelBD, Bangladesh's e-commerce platform. Recommend the best templates for the user's business. Respond ONLY with valid JSON.`;

  try {
    const result = await aiComplete({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Recommend 2-3 templates for a ${request.businessType} business in Bangladesh. Available templates: Roseo (fashion/luxury), Modern Shop (general), Minimal (general/fast), Electro (tech), Boutique (fashion), Grocer (grocery), Salon Pro (beauty), Tuition Hub (education), MediClinic (healthcare), PharmaCart (pharmacy), BizHub (corporate), CreativeFolio (portfolio). Also suggest a color scheme (3 hex colors) and 3 marketing tips. Respond as JSON: { "recommendedTemplates": [{ "id": "...", "name": "...", "confidence": 0.9, "reason": "..." }], "suggestedColors": { "primary": "#...", "secondary": "#...", "accent": "#..." }, "marketingTips": ["..."] }`,
        },
      ],
      responseFormat: "json",
    });

    const jsonStr = result.content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch {
    return {
      recommendedTemplates: [
        {
          id: "default",
          name: "Modern Shop",
          confidence: 0.9,
          reason: "Versatile template suitable for most business types in Bangladesh",
        },
      ],
      suggestedColors: {
        primary: "#006A4E",
        secondary: "#F42A41",
        accent: "#059669",
      },
      marketingTips: [
        "Set up bKash and Nagad payment to reach 90% of Bangladeshi customers",
        "Add a Facebook Pixel to track visitor behavior for retargeting",
        "Offer free delivery on orders over ৳1,000 to increase average order value",
      ],
    };
  }
}

export async function analyzeSEO(
  request: SEOAnalysisRequest
): Promise<SEOAnalysisResponse> {
  const systemPrompt = `You are an SEO expert specializing in Bangladeshi e-commerce. Analyze the content and provide actionable suggestions. Respond ONLY with valid JSON.`;

  try {
    const result = await aiComplete({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze this content for SEO: Title: "${request.title || ""}", Description: "${request.description || ""}", Target Keyword: "${request.targetKeyword || ""}", Content sample: "${request.content || ""}". Respond as JSON: { "score": 85, "suggestions": [{ "type": "title", "message": "...", "priority": "high", "improvement": "..." }], "optimized": { "title": "...", "description": "...", "keywords": ["..."] } }`,
        },
      ],
      responseFormat: "json",
    });

    const jsonStr = result.content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch {
    return {
      score: 75,
      suggestions: [
        {
          type: "title",
          message: "Consider adding your primary keyword to the page title",
          priority: "high",
          improvement: "Include your main target keyword naturally in the title",
        },
      ],
      optimized: {
        title: request.title,
        description: request.description,
        keywords: request.targetKeyword ? [request.targetKeyword] : [],
      },
    };
  }
}

export async function generateMarketingInsights(
  request: MarketingInsightRequest
): Promise<MarketingInsightResponse> {
  const systemPrompt = `You are a marketing analytics expert for BixelBD, Bangladesh's e-commerce platform. Analyze the store metrics and provide actionable insights. Respond ONLY with valid JSON.`;

  const metricsStr = request.metrics
    ? `Visitors: ${request.metrics.visitors || "N/A"}, Orders: ${request.metrics.orders || "N/A"}, Revenue: ৳${request.metrics.revenue || "N/A"}, Conversion Rate: ${request.metrics.conversionRate || "N/A"}%, Avg Order Value: ৳${request.metrics.avgOrderValue || "N/A"}`
    : "No specific metrics provided";

  try {
    const result = await aiComplete({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze this store's performance for ${request.storeName || "a store"} (${request.businessType || "e-commerce"} business in Bangladesh). Metrics: ${metricsStr}. Period: ${request.period || "last 30 days"}. Provide insights and recommendations. Respond as JSON: { "insights": [{ "category": "traffic|conversion|revenue|retention|marketing", "title": "...", "description": "...", "priority": "high|medium|low", "action": "..." }], "summary": "...", "recommendedActions": ["..."] }`,
        },
      ],
      responseFormat: "json",
    });

    const jsonStr = result.content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch {
    return {
      insights: [
        {
          category: "marketing",
          title: "Set up bKash/Nagad payments",
          description: "90% of Bangladeshi online shoppers prefer mobile banking payments",
          priority: "high",
          action: "Enable bKash and Nagad in your payment settings",
        },
        {
          category: "traffic",
          title: "Create a Facebook page",
          description: "Facebook is the primary discovery channel for Bangladeshi online stores",
          priority: "high",
          action: "Create a business Facebook page and link it to your store",
        },
        {
          category: "conversion",
          title: "Add customer reviews",
          description: "Stores with reviews see 18% higher conversion rates",
          priority: "medium",
          action: "Enable product reviews and ask early customers to leave feedback",
        },
      ],
      summary: "Your store has potential for growth in the Bangladesh market. Focus on local payment methods and social media marketing.",
      recommendedActions: [
        "Enable bKash and Nagad payment options",
        "Create a Facebook business page",
        "Offer free delivery on orders over ৳1,000",
        "Set up Google Analytics to track visitors",
        "Create seasonal campaigns for Eid and Puja",
      ],
    };
  }
}

export async function generateSocialPost(
  request: SocialPostRequest
): Promise<SocialPostResponse> {
  const langInstruction = request.lang === "bn" ? " Write in Bangla (Bengali)." : "";
  const systemPrompt = `You are a social media marketing expert for BixelBD, Bangladesh's e-commerce platform. Create engaging posts optimized for ${request.platform}.${langInstruction}`;

  const platformLimits: Record<string, number> = {
    twitter: 280,
    instagram: 2200,
    facebook: 500,
    whatsapp: 1000,
  };

  const limit = platformLimits[request.platform] || 500;

  try {
    const result = await aiComplete({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Create an engaging ${request.platform} post for a ${request.tone || "friendly"} tone ${request.businessType || "e-commerce"} store${request.storeName ? ` called "${request.storeName}"` : ""}${request.productName ? ` promoting "${request.productName}"` : ""}.${request.productDescription ? ` Product: ${request.productDescription}` : ""}${request.includeHashtags !== false ? " Include relevant hashtags." : ""}${langInstruction} Under ${limit} characters. Also suggest the best time to post in Bangladesh timezone (GMT+6). Respond as JSON: { "content": "...", "hashtags": ["..."], "suggestedTime": "...", "platform": "${request.platform}" }`,
        },
      ],
      responseFormat: "json",
    });

    const jsonStr = result.content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch {
    const defaultHashtags = ["#Bangladesh", "#OnlineShopping", "#BixelBD"];
    const defaultContent = request.productName
      ? `🎉 Check out ${request.productName}! Shop now at ${request.storeName || "our store"} with fast delivery across Bangladesh. bKash & Nagad accepted! 🛒`
      : `🎉 Special offer at ${request.storeName || "our store"}! Shop the best products in Bangladesh with fast delivery. bKash & Nagad accepted! 🛒`;

    return {
      content: defaultContent,
      hashtags: defaultHashtags,
      suggestedTime: "7:00 PM BDT (evening peak hours)",
      platform: request.platform,
    };
  }
}
