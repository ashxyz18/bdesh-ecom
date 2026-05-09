export interface AIConfig {
  provider: "openrouter" | "openai" | "google" | "groq" | "local";
  apiKey?: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  retries?: number;
  retryDelay?: number;
}

export const OPENROUTER_CONFIG: AIConfig = {
  provider: "openrouter",
  baseUrl: "https://openrouter.ai/api/v1",
  model: "google/gemma-4-31b-it:free",
  maxTokens: 2048,
  temperature: 0.7,
  retries: 2,
  retryDelay: 1000,
};

export const GOOGLE_CONFIG: AIConfig = {
  provider: "google",
  baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  model: "gemini-2.0-flash",
  maxTokens: 2048,
  temperature: 0.7,
  retries: 2,
  retryDelay: 1000,
};

export const GROQ_CONFIG: AIConfig = {
  provider: "groq",
  baseUrl: "https://api.groq.com/openai/v1",
  model: "llama-3.3-70b-versatile",
  maxTokens: 2048,
  temperature: 0.7,
  retries: 2,
  retryDelay: 1000,
};

export const OPENAI_CONFIG: AIConfig = {
  provider: "openai",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  maxTokens: 2048,
  temperature: 0.7,
  retries: 2,
  retryDelay: 1000,
};

export const LOCAL_CONFIG: AIConfig = {
  provider: "local",
  baseUrl: "",
  model: "local-fallback",
  maxTokens: 2048,
  temperature: 0.7,
};

export interface AICompletionRequest {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  config?: Partial<AIConfig>;
  responseFormat?: "text" | "json";
}

export interface AICompletionResponse {
  content: string;
  finishReason: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
  model: string;
  cached?: boolean;
}

export interface ContentGenerationRequest {
  type: "product_description" | "store_tagline" | "hero_text" | "meta_description" | "marketing_copy" | "social_post" | "email_subject" | "sms_campaign" | "faq_answer";
  businessType?: string;
  productName?: string;
  storeName?: string;
  tone?: "professional" | "friendly" | "luxury" | "casual" | "bangla";
  keywords?: string[];
  lang?: "en" | "bn";
  platform?: "facebook" | "instagram" | "twitter" | "whatsapp" | "email" | "sms";
  context?: string;
}

export interface TemplateRecommendationRequest {
  businessType: string;
  industry?: string;
  preferences?: {
    colorScheme?: "dark" | "light" | "colorful";
    style?: "modern" | "classic" | "minimal";
    features?: string[];
  };
}

export interface TemplateRecommendationResponse {
  recommendedTemplates: {
    id: string;
    name: string;
    confidence: number;
    reason: string;
  }[];
  suggestedColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  marketingTips: string[];
}

export interface SEOAnalysisRequest {
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  targetKeyword?: string;
}

export interface SEOAnalysisResponse {
  score: number;
  suggestions: {
    type: "title" | "description" | "keywords" | "content" | "technical";
    message: string;
    priority: "high" | "medium" | "low";
    improvement?: string;
  }[];
  optimized: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

// ─── Image-Based Template Generation ───

export interface DesignAnalysisRequest {
  imageBase64?: string;
  imageUrl?: string;
  industry?: string;
  businessName?: string;
  websiteType?: string; // ecommerce, portfolio, corporate, blog, landing, restaurant, realestate, education, nonprofit
}

export interface DetectedLayout {
  navbarStyle: "sticky-white" | "sticky-blur" | "sticky-dark" | "transparent";
  navbarLayout: "centered" | "left-aligned" | "centered-logo" | "minimal";
  showSearch: boolean;
  heroStyle: "centered" | "split" | "fullwidth" | "minimal" | "video" | "parallax";
  sections: { type: string; props: Record<string, any> }[];
  footerStyle: "dark" | "light" | "minimal" | "centered" | "expanded" | "newsletter-focus";
  footerColumns: 2 | 3 | 4;
  showNewsletter: boolean;
  productColumns: 2 | 3 | 4;
  cardStyle: "flat" | "bordered" | "shadowed" | "elevated";
  sectionSpacing: "compact" | "normal" | "spacious";
  borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  websiteType?: string;
  pageLayout?: "fullwidth" | "sidebar-left" | "sidebar-right" | "boxed" | "magazine";
  contentWidth?: "narrow" | "normal" | "wide" | "full";
}

export interface DesignAnalysisResult {
  websiteType?: string;
  detectedColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    palette: string[];
  };
  detectedStyle: {
    vibe: "modern" | "classic" | "luxury" | "playful" | "minimal" | "bold" | "natural" | "tech";
    typography: string[];
    layout: "centered" | "split" | "fullwidth" | "grid" | "magazine";
    mood: string[];
    headingStyle?: "serif" | "sans-serif";
    borderRadius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
    cardStyle?: "flat" | "bordered" | "shadowed" | "elevated";
    spacing?: "compact" | "normal" | "spacious";
  };
  detectedIndustry: string;
  detectedElements: string[];
  detectedLayout: DetectedLayout;
  confidence: number;
  suggestedTemplateId: string;
  suggestedColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  aiPrompt: string;
}

export interface GeneratedTemplateConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  version: string;
  category: string;
  websiteType?: string;
  isPremium: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    error: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: string;
    borderRadius: string;
  };
  layout: {
    maxWidth: string;
    sectionSpacing: string;
    cardStyle: string;
    productColumns: number;
    pageLayout?: "fullwidth" | "sidebar-left" | "sidebar-right" | "boxed" | "magazine";
    contentWidth?: "narrow" | "normal" | "wide" | "full";
  };
  navbar: {
    style: string;
    showSearch: boolean;
    showWishlist: boolean;
    showUserMenu: boolean;
    layout: string;
    announcementBar?: {
      message: string;
      bgColor?: string;
      textColor?: string;
    };
  };
  footer: {
    style: string;
    showNewsletter: boolean;
    showSocial: boolean;
    columns: number;
  };
  homePage: {
    sections: { type: string; props: Record<string, any> }[];
  };
  productPage?: {
    imageLayout: string;
    showReviews: boolean;
    showRecentlyViewed: boolean;
    showRelatedProducts: boolean;
    showWishlist: boolean;
    showFeatures: boolean;
    features?: { icon: string; title: string; description: string }[];
  };
  collectionPage?: {
    showFilters: boolean;
    gridColumns: number;
    cardStyle: string;
  };
}

export interface GenerateFromImageRequest {
  imageBase64?: string;
  imageUrl?: string;
  businessName?: string;
  businessType?: string;
  websiteType?: string; // ecommerce, portfolio, corporate, blog, landing, etc.
}

export interface GenerateFromImageResponse {
  analysis: DesignAnalysisResult;
  templateConfig: GeneratedTemplateConfig;
  previewColors: string[];
  marketingTips: string[];
}

export interface GenerateFromPromptRequest {
  prompt: string;
  businessName?: string;
  industry?: string;
  websiteType?: string; // ecommerce, portfolio, corporate, blog, landing, restaurant, realestate, education, nonprofit
}

export type GenerateFromPromptResponse = GenerateFromImageResponse;

// ─── Website Cloning ───

export interface CloneWebsiteRequest {
  url: string;
  websiteType?: string;
  businessName?: string;
}

export interface CloneWebsiteResponse {
  analysis: DesignAnalysisResult;
  templateConfig: GeneratedTemplateConfig;
  previewColors: string[];
  marketingTips: string[];
  screenshotUrl?: string;
}

export interface MarketingInsightRequest {
  storeName?: string;
  businessType?: string;
  metrics?: {
    visitors?: number;
    orders?: number;
    revenue?: number;
    conversionRate?: number;
    avgOrderValue?: number;
  };
  period?: string;
}

export interface MarketingInsightResponse {
  insights: {
    category: "traffic" | "conversion" | "revenue" | "retention" | "marketing";
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    action: string;
  }[];
  summary: string;
  recommendedActions: string[];
}

export interface SocialPostRequest {
  platform: "facebook" | "instagram" | "twitter" | "whatsapp";
  storeName?: string;
  businessType?: string;
  productName?: string;
  productDescription?: string;
  tone?: "professional" | "friendly" | "casual" | "bangla";
  includeHashtags?: boolean;
  lang?: "en" | "bn";
  context?: string;
}

export interface SocialPostResponse {
  content: string;
  hashtags: string[];
  suggestedTime: string;
  platform: string;
}

export interface GenerateImageRequest {
  prompt: string;
  productName?: string;
  storeName?: string;
  style?: "photorealistic" | "artistic" | "minimal" | "luxury" | "playful";
  width?: number;
  height?: number;
  negativePrompt?: string;
  count?: number;
}

export interface GenerateImageResponse {
  images: { url: string; revisedPrompt?: string }[];
  prompt: string;
}

export interface GenerateStoreAssetsRequest {
  storeName: string;
  businessType?: string;
  style?: "minimal" | "bold" | "luxury" | "playful" | "corporate";
  assetTypes: ("logo" | "banner" | "favicon" | "social-facebook" | "social-instagram" | "social-twitter")[];
}

export interface GenerateStoreAssetsResponse {
  assets: {
    type: string;
    url: string;
    prompt: string;
  }[];
}
