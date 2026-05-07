import { aiComplete } from "../client";
import type { CloneWebsiteRequest, CloneWebsiteResponse, DesignAnalysisResult, GeneratedTemplateConfig } from "../types";
import { WEBSITE_TYPE_MAP, INDUSTRY_TEMPLATE_MAP, STYLE_VIBE_TO_TEMPLATE } from "./design";

// ─── Clone website from URL ───

export async function cloneWebsiteFromURL(
  request: CloneWebsiteRequest
): Promise<CloneWebsiteResponse> {
  const { url, websiteType = "ecommerce", businessName } = request;

  if (!url) {
    throw new Error("URL is required for website cloning");
  }

  try {
    // First, fetch the webpage content and take a screenshot (using AI vision)
    const screenshotUrl = await getScreenshotUrl(url);

    const result = await aiComplete({
      messages: [
        {
          role: "system",
          content: `You are a professional web designer analyzing a website screenshot to recreate its EXACT design as a ${websiteType} website. Extract EVERY visible detail.

Analyze the website screenshot at the provided URL and extract:

1. **Website Type** — ${websiteType}

2. **Color Palette** — Dominant HEX colors: primary, secondary, accent, background, text color, and a full palette array of ALL colors used.

3. **Design Style** — 
   - Vibe (modern/classic/luxury/playful/minimal/bold/natural/tech)
   - Typography: font families used for headings and body text
   - Layout style (centered/left-aligned/sidebar/fullwidth)
   - Mood words (professional, friendly, elegant, etc.)
   - Heading style (serif/sans-serif)
   - Border radius preference (none/sm/md/lg/xl/2xl/full)
   - Card style (flat/bordered/shadowed/elevated)
   - Section spacing (compact/normal/spacious)

4. **Layout Structure** — This is the MOST IMPORTANT part. Describe the COMPLETE page layout:
   - Header/Navbar: style (sticky-white/sticky-blur/sticky-dark/transparent), layout (centered/left-aligned), whether search is shown
   - Hero section: style (centered/split/fullwidth/minimal/video/parallax), title, subtitle, CTA button text
   - ALL page sections in their exact order with their configuration
   - Footer: style (dark/light/minimal), number of columns, whether newsletter signup is shown
   - Product grid columns (2/3/4) for ecommerce
   - Card style for content items
   - Section spacing throughout the page
   - Border radius used for elements

5. **Confidence** — Rate your confidence in this analysis 0-100

For the sections array, use ONLY these valid section types based on website type:

**Ecommerce**: announcement, hero, collections, featuredProducts, features, products, testimonials, newsletter, stats, cta, banner, faq, team, categories, brandLogos, countdown, pricing, timeline, spacer, recentlyViewed

**Portfolio**: hero, about, projects, gallery, skills, experience, education, testimonials, contact, cta, banner, spacer

**Corporate**: hero, about, services, features, clients, partners, testimonials, team, stats, cta, contact, map, newsletter, faq, spacer

**Blog**: hero, featuredPost, blogPosts, categories, tags, testimonials, newsletter, cta, spacer

**Landing**: hero, features, stats, testimonials, pricing, cta, features, guarantee, comparison, screenshots, video, faq, spacer

**Restaurant**: hero, about, menu, features, testimonials, gallery, contact, map, hours, reservation, cta, spacer

Each section MUST have a "type" and "props" object with relevant configuration.

Respond ONLY with valid JSON in this exact format:
{
  "websiteType": "${websiteType}",
  "detectedColors": { 
    "primary": "#...", 
    "secondary": "#...", 
    "accent": "#...", 
    "background": "#...", 
    "text": "#...", 
    "palette": ["#...", "#...", "#...", "#...", "#..."] 
  },
  "detectedStyle": {
    "vibe": "modern",
    "typography": ["Inter", "Playfair Display"],
    "layout": "centered",
    "mood": ["professional", "clean"],
    "headingStyle": "sans-serif",
    "borderRadius": "lg",
    "cardStyle": "shadowed",
    "spacing": "normal"
  },
  "detectedIndustry": "fashion",
  "detectedElements": ["logo", "navigation", "hero image", "product grid"],
  "detectedLayout": {
    "navbarStyle": "sticky-blur",
    "navbarLayout": "left-aligned",
    "showSearch": true,
    "heroStyle": "centered",
    "sections": [
      { "type": "announcement", "props": { "message": "Free shipping on orders over $50" } },
      { "type": "hero", "props": { "style": "centered", "title": "Welcome to Our Store", "subtitle": "Discover amazing products", "ctaText": "Shop Now", "showStats": true } },
      { "type": "collections", "props": { "layout": "grid", "columns": 4, "title": "Shop by Category" } },
      { "type": "featuredProducts", "props": { "layout": "grid", "columns": 4, "limit": 8, "title": "Featured Products" } },
      { "type": "features", "props": { "layout": "grid", "items": [{"icon":"Truck","title":"Free Shipping","description":"On orders over $50"}] } },
      { "type": "testimonials", "props": { "style": "cards" } },
      { "type": "newsletter", "props": { "title": "Stay Updated", "style": "card" } }
    ],
    "footerStyle": "dark",
    "footerColumns": 4,
    "showNewsletter": true,
    "productColumns": 4,
    "cardStyle": "shadowed",
    "sectionSpacing": "normal",
    "borderRadius": "lg"
  },
  "confidence": 85
}`,
        },
        {
          role: "user",
          content: `Analyze this website screenshot at ${screenshotUrl || url}. I want to CLONE this entire website design for a ${websiteType} site. Extract the COMPLETE layout structure, all colors, typography, section types, and styling details. Be extremely detailed and accurate.`,
        },
      ],
      config: { model: "google/gemini-2.0-flash-001", maxTokens: 4096, temperature: 0.3 },
    });

    const jsonStr = result.content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    const detectedWebsiteType = parsed.websiteType || websiteType;
    const templateId =
      WEBSITE_TYPE_MAP[detectedWebsiteType?.toLowerCase() || ""] ||
      INDUSTRY_TEMPLATE_MAP[parsed.detectedIndustry?.toLowerCase() || ""] ||
      STYLE_VIBE_TO_TEMPLATE[parsed.detectedStyle?.vibe?.toLowerCase() || ""] ||
      "default";

    const c = parsed.detectedColors || {
      primary: "#006A4E",
      secondary: "#F42A41",
      accent: "#059669",
      background: "#ffffff",
      text: "#111827",
      palette: ["#006A4E", "#F42A41", "#059669", "#ffffff", "#111827"],
    };

    const s = parsed.detectedStyle || {
      vibe: "modern",
      typography: ["Inter"],
      layout: "centered",
      mood: ["professional"],
      headingStyle: "sans-serif",
      borderRadius: "lg",
      cardStyle: "shadowed",
      spacing: "normal",
    };

    const layout = parsed.detectedLayout || {
      navbarStyle: "sticky-blur",
      navbarLayout: "left-aligned",
      showSearch: true,
      heroStyle: "centered",
      sections: [],
      footerStyle: "dark",
      footerColumns: 4,
      showNewsletter: true,
      productColumns: 4,
      cardStyle: "shadowed",
      sectionSpacing: "normal",
      borderRadius: "lg",
      websiteType: detectedWebsiteType,
    };

    // Build sections from AI-detected layout
    const sections = sanitizeSectionsForClone(
      layout.sections || [],
      businessName || "",
      c.primary,
      layout.heroStyle || "centered",
    );

    const templateConfig: GeneratedTemplateConfig = {
      id: `ai-clone-${Date.now()}`,
      name: businessName || `${capitalize(detectedWebsiteType || "modern")} Clone`,
      tagline: `Beautiful ${parsed.detectedIndustry || detectedWebsiteType} site cloned with AI`,
      description: `AI-cloned ${s.vibe} template from ${url}`,
      version: "1.0.0",
      category: parsed.detectedIndustry || detectedWebsiteType || "general",
      websiteType: detectedWebsiteType,
      isPremium: false,
      colors: {
        primary: c.primary,
        secondary: c.secondary,
        accent: c.accent,
        background: c.background || "#ffffff",
        surface: lighten(c.background || "#ffffff", 20),
        text: c.text || "#111827",
        textMuted: "#6b7280",
        border: "#e5e7eb",
        success: "#22c55e",
        error: "#ef4444",
      },
      typography: {
        headingFont: s.typography?.[0] || "Inter",
        bodyFont: s.typography?.[1] || s.typography?.[0] || "Inter",
        headingWeight: s.headingStyle === "serif" ? "600" : "700",
        borderRadius: layout.borderRadius || s.borderRadius || "lg",
      },
      layout: {
        maxWidth: "7xl",
        sectionSpacing: layout.sectionSpacing || s.spacing || "normal",
        cardStyle: layout.cardStyle || s.cardStyle || "shadowed",
        productColumns: layout.productColumns || 4,
      },
      navbar: {
        style: layout.navbarStyle || "sticky-blur",
        showSearch: layout.showSearch !== false,
        showWishlist: detectedWebsiteType === "ecommerce",
        showUserMenu: detectedWebsiteType === "ecommerce",
        layout: layout.navbarLayout || "left-aligned",
        announcementBar: {
          message: `Welcome to ${businessName || "our site"}!`,
          bgColor: c.primary,
          textColor: "#ffffff",
        },
      },
      footer: {
        style: layout.footerStyle || "dark",
        showNewsletter: layout.showNewsletter !== false,
        showSocial: true,
        columns: layout.footerColumns || 4,
      },
      homePage: {
        sections,
      },
      productPage: detectedWebsiteType === "ecommerce" ? {
        imageLayout: "stacked",
        showReviews: true,
        showRecentlyViewed: true,
        showRelatedProducts: true,
        showWishlist: true,
        showFeatures: true,
        features: [
          { icon: "Truck", title: "Free Shipping", description: "On orders over $50" },
          { icon: "ShieldCheck", title: "Secure Payment", description: "100% secure checkout" },
          { icon: "RefreshCw", title: "Easy Returns", description: "7-day return policy" },
        ],
      } : undefined,
      collectionPage: detectedWebsiteType === "ecommerce" ? {
        showFilters: true,
        gridColumns: layout.productColumns || 4,
        cardStyle: "standard",
      } : undefined,
    };

    return {
      analysis: {
        websiteType: detectedWebsiteType,
        detectedColors: c,
        detectedStyle: s,
        detectedIndustry: parsed.detectedIndustry || "general",
        detectedElements: parsed.detectedElements || [],
        detectedLayout: {
          ...layout,
          websiteType: detectedWebsiteType,
        },
        confidence: parsed.confidence || 75,
        suggestedTemplateId: templateId,
        suggestedColors: {
          primary: c.primary,
          secondary: c.secondary,
          accent: c.accent,
        },
        aiPrompt: `Cloned from ${url} with ${s.vibe} vibe`,
      },
      templateConfig,
      previewColors: [c.primary, c.secondary, c.accent, c.background || "#ffffff"],
      marketingTips: [
        `Your ${s.vibe} design pairs well with ${s.typography?.[0] || "Inter"} fonts`,
        `Add content matching your ${parsed.detectedIndustry || detectedWebsiteType} niche for best results`,
        detectedWebsiteType === "ecommerce"
          ? "Set up payments to reach more customers"
          : `Promote your ${detectedWebsiteType} site on social media for maximum reach`,
      ],
      screenshotUrl: screenshotUrl || undefined,
    };
  } catch (error: any) {
    throw new Error(`Failed to clone website: ${error.message}`);
  }
}

// ─── Helper: Get screenshot URL ───

async function getScreenshotUrl(url: string): Promise<string | null> {
  // Use a screenshot service or return the original URL for AI vision
  // For now, return null and let the AI use the URL directly
  // In production, you would use a service like screenshotapi.net or similar
  return null;
}

// ─── Helper: Sanitize sections for cloned websites ───

function sanitizeSectionsForClone(
  raw: { type: string; props: Record<string, any> }[] | undefined,
  businessName: string,
  primary: string,
  heroStyle: string,
): { type: string; props: Record<string, any> }[] {
  const VALID_SECTION_TYPES = new Set([
    "announcement", "hero", "collections", "featuredProducts", "features",
    "products", "testimonials", "newsletter", "recentlyViewed", "stats",
    "cta", "spacer", "banner", "brandLogos", "countdown", "faq", "team",
    "pricing", "timeline", "categories",
    "projects", "gallery", "skills", "experience", "education", "contact",
    "about", "services", "clients", "partners", "mission", "values",
    "blogPosts", "featuredPost", "categories", "tags", "author",
    "video", "screenshots", "integration", "comparison", "guarantee",
    "map", "form", "socialFeed", "instagram", "videoHero", "parallax",
  ]);

  if (!raw || !Array.isArray(raw) || raw.length === 0) {
    return defaultSectionsForClone(businessName, primary);
  }

  const sanitized: { type: string; props: Record<string, any> }[] = [];

  for (const section of raw) {
    if (!section.type || !VALID_SECTION_TYPES.has(section.type)) continue;

    const props = section.props && typeof section.props === "object" ? { ...section.props } : {};

    // Inject AI-detected colors into specific section types
    if (section.type === "announcement") {
      props.bgColor = props.bgColor || primary;
      props.textColor = props.textColor || "#ffffff";
    }

    if (section.type === "hero") {
      props.style = heroStyle || props.style || "centered";
    }

    sanitized.push({ type: section.type, props });
  }

  return sanitized;
}

function defaultSectionsForClone(businessName: string, primary: string): { type: string; props: Record<string, any> }[] {
  return [
    { type: "hero", props: { style: "centered", title: `Welcome to ${businessName || "Our Site"}`, subtitle: "Discover amazing content", ctaText: "Learn More", ctaLink: "/about" } },
    { type: "features", props: { layout: "grid", items: [
      { icon: "Star", title: "Quality", description: "We provide the best quality" },
      { icon: "ShieldCheck", title: "Secure", description: "Your trust is our priority" },
      { icon: "Truck", title: "Fast", description: "Quick delivery and response" },
    ] } },
  ];
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function lighten(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}
