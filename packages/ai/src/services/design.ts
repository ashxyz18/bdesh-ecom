import { aiComplete } from "../client";
import type { 
  DesignAnalysisRequest, 
  DesignAnalysisResult, 
  DetectedLayout, 
  GenerateFromImageRequest, 
  GenerateFromImageResponse, 
  GeneratedTemplateConfig,
  GenerateFromPromptRequest,
  GenerateFromPromptResponse,
} from "../types";

// ─── Website Type Maps ───

export const INDUSTRY_TEMPLATE_MAP: Record<string, string> = {
  fashion: "roseo",
  clothing: "roseo",
  apparel: "roseo",
  beauty: "salon",
  salon: "salon",
  food: "restaurant",
  restaurant: "restaurant",
  grocery: "grocer",
  supermarket: "grocer",
  tech: "electro",
  electronics: "electro",
  gadgets: "electro",
  education: "tuition",
  tuition: "tuition",
  healthcare: "clinic",
  clinic: "clinic",
  medical: "clinic",
  pharmacy: "pharmacy",
  medicine: "pharmacy",
  corporate: "corporate",
  business: "corporate",
  portfolio: "portfolio",
  creative: "portfolio",
  general: "default",
  shop: "default",
};

export const WEBSITE_TYPE_MAP: Record<string, string> = {
  ecommerce: "ecommerce",
  shop: "ecommerce",
  store: "ecommerce",
  portfolio: "portfolio",
  personal: "portfolio",
  resume: "portfolio",
  cv: "portfolio",
  corporate: "corporate",
  business: "corporate",
  company: "corporate",
  saas: "corporate",
  software: "corporate",
  blog: "blog",
  magazine: "blog",
  news: "blog",
  landing: "landing",
  "landing page": "landing",
  splash: "landing",
  restaurant: "restaurant",
  cafe: "restaurant",
  food: "restaurant",
  realestate: "realestate",
  property: "realestate",
  rental: "realestate",
  education: "education",
  school: "education",
  university: "education",
  course: "education",
  nonprofit: "nonprofit",
  charity: "nonprofit",
  ngb: "nonprofit",
};

export const STYLE_VIBE_TO_TEMPLATE: Record<string, string> = {
  modern: "default",
  classic: "shopnest",
  luxury: "roseo",
  playful: "boutique",
  minimal: "shopify",
  bold: "electro",
  natural: "grocer",
  tech: "electro",
};

// Valid section types for validation (expanded for all website types)
const VALID_SECTION_TYPES = new Set([
  // Ecommerce sections
  "announcement", "hero", "collections", "featuredProducts", "features",
  "products", "testimonials", "newsletter", "recentlyViewed", "stats",
  "cta", "spacer", "banner", "brandLogos", "countdown", "faq", "team",
  "pricing", "timeline", "categories",
  // Portfolio sections
  "projects", "gallery", "skills", "experience", "about", "contact",
  // Corporate sections
  "services", "clients", "partners", "mission",
  // Blog sections
  "blogPosts", "featuredPost",
  // Restaurant sections
  "menu", "hours", "reservation",
  // Education sections
  "courses",
]);

function extractHexColors(text: string): string[] {
  const hexRegex = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;
  return (text.match(hexRegex) || []).map((c) => c.toUpperCase());
}

// ─── Industry-specific color palettes ───

const INDUSTRY_COLORS: Record<string, { primary: string; secondary: string; accent: string; background: string; text: string }> = {
  fashion: { primary: "#1a1a2e", secondary: "#e94560", accent: "#f5c518", background: "#fafafa", text: "#1a1a2e" },
  beauty: { primary: "#8b5cf6", secondary: "#ec4899", accent: "#f59e0b", background: "#fdf2f8", text: "#1e1b4b" },
  food: { primary: "#dc2626", secondary: "#f59e0b", accent: "#16a34a", background: "#fffbeb", text: "#1c1917" },
  restaurant: { primary: "#92400e", secondary: "#b91c1c", accent: "#d97706", background: "#fffbeb", text: "#1c1917" },
  grocery: { primary: "#16a34a", secondary: "#f59e0b", accent: "#dc2626", background: "#f0fdf4", text: "#14532d" },
  tech: { primary: "#2563eb", secondary: "#7c3aed", accent: "#06b6d4", background: "#f8fafc", text: "#0f172a" },
  electronics: { primary: "#1e40af", secondary: "#dc2626", accent: "#2563eb", background: "#f1f5f9", text: "#0f172a" },
  education: { primary: "#1d4ed8", secondary: "#059669", accent: "#d97706", background: "#eff6ff", text: "#1e3a5f" },
  healthcare: { primary: "#0891b2", secondary: "#059669", accent: "#2563eb", background: "#f0fdfa", text: "#134e4a" },
  clinic: { primary: "#0d9488", secondary: "#2563eb", accent: "#059669", background: "#f0fdfa", text: "#134e4a" },
  corporate: { primary: "#1e3a5f", secondary: "#2563eb", accent: "#f59e0b", background: "#ffffff", text: "#0f172a" },
  portfolio: { primary: "#111827", secondary: "#7c3aed", accent: "#ec4899", background: "#fafafa", text: "#111827" },
  creative: { primary: "#7c3aed", secondary: "#ec4899", accent: "#f59e0b", background: "#faf5ff", text: "#1e1b4b" },
  blog: { primary: "#1e3a5f", secondary: "#059669", accent: "#d97706", background: "#ffffff", text: "#1f2937" },
  realestate: { primary: "#1e3a5f", secondary: "#b45309", accent: "#059669", background: "#fffbeb", text: "#1c1917" },
  nonprofit: { primary: "#059669", secondary: "#2563eb", accent: "#dc2626", background: "#f0fdf4", text: "#14532d" },
  general: { primary: "#1e3a5f", secondary: "#2563eb", accent: "#059669", background: "#ffffff", text: "#0f172a" },
};

// ─── Industry-specific default sections ───

function industryDefaultSections(
  websiteType: string,
  industry: string,
  businessName: string,
  primary: string,
): { type: string; props: Record<string, any> }[] {
  const name = businessName || "Our Store";

  // ─── Portfolio ───
  if (websiteType === "portfolio") {
    return [
      { type: "hero", props: { style: "fullwidth", title: `Hi, I'm ${name}`, subtitle: "Designer, Developer & Creative Thinker", ctaText: "View My Work", ctaLink: "#projects", showStats: false } },
      { type: "about", props: { layout: "split", title: "About Me", description: `Passionate about creating beautiful digital experiences that make a difference.`, highlights: ["10+ Years Experience", "200+ Projects Completed", "50+ Happy Clients"] } },
      { type: "projects", props: { layout: "grid", columns: 3, title: "Featured Projects", showFilters: true } },
      { type: "skills", props: { layout: "bars", title: "Skills & Expertise" } },
      { type: "experience", props: { layout: "timeline", title: "Experience" } },
      { type: "gallery", props: { layout: "masonry", columns: 3, title: "Gallery" } },
      { type: "testimonials", props: { style: "cards", title: "What Clients Say" } },
      { type: "contact", props: { layout: "split", title: "Get In Touch" } },
    ];
  }

  // ─── Corporate ───
  if (websiteType === "corporate") {
    return [
      { type: "hero", props: { style: "split", title: `${name}`, subtitle: "Innovative solutions that drive your business forward", ctaText: "Get Started", ctaLink: "#services", showStats: true, stats: [{ label: "Clients", value: "500+" }, { label: "Projects", value: "1,200+" }, { label: "Years", value: "15+" }] } },
      { type: "services", props: { layout: "grid", columns: 3, title: "Our Services", style: "default" } },
      { type: "about", props: { layout: "image-right", title: "Who We Are", description: "We are a team of dedicated professionals committed to delivering excellence." } },
      { type: "mission", props: { layout: "cards", title: "Our Values" } },
      { type: "stats", props: { title: "By The Numbers", items: [{ label: "Team Members", value: "50+" }, { label: "Countries", value: "12" }, { label: "Awards", value: "25" }, { label: "Satisfaction", value: "99%" }] } },
      { type: "clients", props: { layout: "grid", title: "Trusted By" } },
      { type: "team", props: { title: "Meet Our Leadership" } },
      { type: "testimonials", props: { style: "cards", title: "Client Testimonials" } },
      { type: "partners", props: { layout: "grid", title: "Our Partners" } },
      { type: "contact", props: { layout: "split", title: "Contact Us" } },
    ];
  }

  // ─── Blog ───
  if (websiteType === "blog") {
    return [
      { type: "hero", props: { style: "centered", title: name, subtitle: "Ideas, stories, and insights worth sharing", ctaText: "Start Reading", ctaLink: "#posts" } },
      { type: "featuredPost", props: { layout: "hero", title: "Featured Story" } },
      { type: "blogPosts", props: { layout: "grid", columns: 3, title: "Latest Articles", showExcerpt: true, showDate: true, showAuthor: true } },
      { type: "newsletter", props: { title: "Subscribe to Our Newsletter", subtitle: "Get the latest posts delivered to your inbox", style: "card" } },
      { type: "about", props: { layout: "centered", title: "About the Author", description: "Writer, thinker, and lifelong learner sharing insights with the world." } },
    ];
  }

  // ─── Restaurant ───
  if (websiteType === "restaurant") {
    return [
      { type: "hero", props: { style: "fullwidth", title: name, subtitle: "Authentic flavors, unforgettable experiences", ctaText: "View Menu", ctaLink: "#menu", showStats: false } },
      { type: "about", props: { layout: "split", title: "Our Story", description: "Bringing the finest culinary traditions to your table since 2010." } },
      { type: "menu", props: { layout: "cards", title: "Our Menu", showImages: true, columns: 3 } },
      { type: "gallery", props: { layout: "masonry", columns: 3, title: "Our Space" } },
      { type: "hours", props: { layout: "table", title: "Opening Hours" } },
      { type: "testimonials", props: { style: "cards", title: "What Our Guests Say" } },
      { type: "reservation", props: { layout: "split", title: "Make a Reservation", subtitle: "Book your table today", showPhone: true, showEmail: true } },
      { type: "contact", props: { layout: "centered", title: "Find Us" } },
    ];
  }

  // ─── Education ───
  if (websiteType === "education") {
    return [
      { type: "hero", props: { style: "centered", title: name, subtitle: "Unlock your potential with world-class courses", ctaText: "Explore Courses", ctaLink: "#courses", showStats: true, stats: [{ label: "Courses", value: "50+" }, { label: "Students", value: "10K+" }, { label: "Instructors", value: "100+" }] } },
      { type: "courses", props: { layout: "grid", columns: 3, title: "Popular Courses", style: "default" } },
      { type: "features", props: { layout: "grid", title: "Why Choose Us", items: [{ icon: "GraduationCap", title: "Expert Instructors", description: "Learn from industry professionals" }, { icon: "Clock", title: "Flexible Schedule", description: "Study at your own pace" }, { icon: "Award", title: "Certification", description: "Earn recognized certificates" }, { icon: "Users", title: "Community", description: "Join a supportive learning community" }] } },
      { type: "testimonials", props: { style: "cards", title: "Student Testimonials" } },
      { type: "stats", props: { title: "Our Impact", items: [{ label: "Graduates", value: "25K+" }, { label: "Success Rate", value: "95%" }, { label: "Countries", value: "30+" }] } },
      { type: "about", props: { layout: "centered", title: "About Our Academy", description: "We are dedicated to providing high-quality education that transforms careers and lives." } },
      { type: "contact", props: { layout: "split", title: "Get In Touch" } },
    ];
  }

  // ─── Landing Page ───
  if (websiteType === "landing") {
    return [
      { type: "hero", props: { style: "split", title: name, subtitle: "The smarter way to get things done", ctaText: "Get Started Free", ctaLink: "#features", showStats: true, stats: [{ label: "Users", value: "50K+" }, { label: "Uptime", value: "99.9%" }, { label: "Rating", value: "4.9★" }] } },
      { type: "features", props: { layout: "grid", title: "Powerful Features", style: "minimal" } },
      { type: "stats", props: { title: "Trusted by Thousands" } },
      { type: "testimonials", props: { style: "cards", title: "What People Are Saying" } },
      { type: "pricing", props: { title: "Simple Pricing" } },
      { type: "faq", props: { title: "Frequently Asked Questions" } },
      { type: "cta", props: { title: "Ready to Get Started?", buttonText: "Start Free Trial", style: "centered" } },
    ];
  }

  // ─── Ecommerce (default) ───
  const industryKey = Object.keys(INDUSTRY_COLORS).find(k => industry.toLowerCase().includes(k)) || "general";

  if (industryKey === "fashion" || industryKey === "beauty" || industryKey === "creative") {
    return [
      { type: "announcement", props: { message: "✨ New Season Collection — Free shipping on orders over ৳2,000", bgColor: primary, textColor: "#ffffff" } },
      { type: "hero", props: { style: "fullwidth", title: name, subtitle: "Discover the new collection. Curated style for the modern you.", ctaText: "Shop Collection", ctaLink: "/products", showStats: false } },
      { type: "collections", props: { layout: "grid", columns: 3, showAll: true, title: "New Arrivals" } },
      { type: "featuredProducts", props: { layout: "grid", columns: 4, limit: 8, title: "Trending Now", showQuickAdd: true } },
      { type: "gallery", props: { layout: "masonry", columns: 4, title: "Shop the Look" } },
      { type: "testimonials", props: { style: "cards", title: "What Our Customers Say" } },
      { type: "newsletter", props: { title: "Join the Club", subtitle: "Get 15% off your first order", style: "card" } },
    ];
  }

  if (industryKey === "food" || industryKey === "grocery") {
    return [
      { type: "announcement", props: { message: "🥕 Fresh deliveries every day — Order before 2pm for same-day delivery", bgColor: primary, textColor: "#ffffff" } },
      { type: "hero", props: { style: "split", title: name, subtitle: "Farm-fresh groceries delivered to your doorstep", ctaText: "Order Now", ctaLink: "/products", showStats: true, stats: [{ label: "Products", value: "2,000+" }, { label: "Daily Orders", value: "500+" }, { label: "Delivery Areas", value: "20+" }] } },
      { type: "collections", props: { layout: "grid", columns: 4, showAll: true, title: "Shop by Category" } },
      { type: "featuredProducts", props: { layout: "grid", columns: 4, limit: 8, title: "Fresh Picks", showQuickAdd: true } },
      { type: "features", props: { layout: "grid", items: [{ icon: "Truck", title: "Same-Day Delivery", description: "Order before 2pm" }, { icon: "Leaf", title: "100% Fresh", description: "Farm to table guarantee" }, { icon: "ShieldCheck", title: "Quality Assured", description: "Handpicked products" }, { icon: "Phone", title: "24/7 Support", description: "Always here to help" }] } },
      { type: "products", props: { layout: "grid", columns: 4, showFilters: true, showSearch: true, title: "All Products" } },
      { type: "newsletter", props: { title: "Get Fresh Deals", subtitle: "Weekly specials in your inbox", style: "card" } },
    ];
  }

  // Default ecommerce
  return [
    { type: "announcement", props: { message: "🚀 Free shipping on orders over ৳1,000", bgColor: primary, textColor: "#ffffff" } },
    { type: "hero", props: { style: "centered", title: `Welcome to ${name}`, subtitle: "Discover amazing products curated just for you. Shop with confidence.", ctaText: "Shop Now", ctaLink: "/products", showStats: true, stats: [{ label: "Products", value: "500+" }, { label: "Customers", value: "10K+" }, { label: "Reviews", value: "4.8★" }] } },
    { type: "collections", props: { layout: "grid", columns: 4, showAll: true, title: "Shop by Category" } },
    { type: "featuredProducts", props: { layout: "grid", columns: 4, limit: 8, title: "Featured Products", showQuickAdd: true } },
    { type: "features", props: { layout: "grid", items: [{ icon: "Truck", title: "Free Shipping", description: "On orders over ৳1,000" }, { icon: "ShieldCheck", title: "Secure Payment", description: "100% secure checkout" }, { icon: "RefreshCcw", title: "Easy Returns", description: "7-day return policy" }, { icon: "Star", title: "Top Quality", description: "Verified products only" }], style: "minimal" } },
    { type: "products", props: { layout: "grid", columns: 4, showFilters: true, showSearch: true, title: "All Products" } },
    { type: "newsletter", props: { title: "Stay Updated", subtitle: "Get the latest deals directly in your inbox", style: "card" } },
  ];
}

// ─── Validate and sanitize AI-detected sections (LIGHT TOUCH) ───

function sanitizeSections(
  raw: { type: string; props: Record<string, any> }[] | undefined,
  businessName: string,
  primary: string,
  heroStyle: string,
  websiteType: string = "ecommerce",
  industry: string = "general",
): { type: string; props: Record<string, any> }[] {
  if (!raw || !Array.isArray(raw) || raw.length === 0) {
    return industryDefaultSections(websiteType, industry, businessName, primary);
  }

  const sanitized: { type: string; props: Record<string, any> }[] = [];

  for (const section of raw) {
    if (!section.type || !VALID_SECTION_TYPES.has(section.type)) continue;

    // Ensure props is an object — preserve AI-generated values
    const props = section.props && typeof section.props === "object" ? { ...section.props } : {};

    // Only set MINIMAL required defaults for specific section types
    // DO NOT overwrite AI-generated values

    if (section.type === "announcement") {
      props.bgColor = props.bgColor || primary;
      props.textColor = props.textColor || "#ffffff";
      props.message = props.message || `Welcome to ${businessName || "Our Store"}`;
    }

    if (section.type === "hero") {
      props.style = props.style || heroStyle || "centered";
      props.title = props.title || `Welcome to ${businessName || "Our Store"}`;
      props.ctaText = props.ctaText || "Get Started";
    }

    if (section.type === "newsletter" && !props.title) {
      props.title = "Stay Updated";
    }

    if (section.type === "faq" && !props.title) {
      props.title = "Frequently Asked Questions";
    }

    // Preserve sectionTheme if provided by AI
    // (no overwriting — this is key for visual diversity)

    sanitized.push({ type: section.type, props });
  }

  // Ensure at least a hero section exists
  if (sanitized.length === 0) {
    return industryDefaultSections(websiteType, industry, businessName, primary);
  }

  if (sanitized[0].type !== "hero") {
    sanitized.unshift({
      type: "hero",
      props: {
        style: heroStyle || "centered",
        title: `Welcome to ${businessName || "Our Store"}`,
        subtitle: "Discover what we have to offer",
        ctaText: "Get Started",
      },
    });
  }

  return sanitized;
}

// ─── Section type reference for AI prompts ───

const SECTION_TYPE_REFERENCE = `
**Ecommerce**: announcement, hero, collections, featuredProducts, features, products, testimonials, newsletter, recentlyViewed, stats, cta, spacer, banner, brandLogos, countdown, faq, team, pricing, timeline, categories

**Portfolio**: hero, about, projects, gallery, skills, experience, contact, testimonials, cta, spacer

**Corporate**: hero, about, services, features, clients, partners, mission, testimonials, team, stats, cta, contact, newsletter, faq, spacer

**Blog**: hero, featuredPost, blogPosts, about, testimonials, newsletter, cta, spacer

**Restaurant**: hero, about, menu, gallery, hours, reservation, testimonials, contact, cta, spacer

**Education**: hero, courses, features, about, testimonials, stats, contact, cta, spacer

**Landing**: hero, features, stats, testimonials, pricing, cta, faq, spacer
`;

// ─── Build the AI system prompt ───

function buildDesignSystemPrompt(websiteType: string): string {
  return `You are a world-class web designer creating a COMPLETE, UNIQUE ${websiteType} website. Your designs must be DIVERSE and tailored to each specific request.

CRITICAL RULES:
1. NEVER output the same design twice — vary layouts, colors, sections, and section props
2. Choose colors that match the industry and vibe — NOT generic blue/green
3. Use sectionTheme overrides to create visual variety between sections (alternate dark/light backgrounds)
4. Match section types to the website type — don't use ecommerce sections for portfolio sites
5. Vary hero styles — not always "centered". Use split, fullwidth, minimal based on context
6. Include 5-9 sections — enough for a complete page, not too many
7. Give each section MEANINGFUL, specific content — not generic placeholder text

Valid section types by website type:
${SECTION_TYPE_REFERENCE}

Each section must have "type" and "props". Use sectionTheme for per-section visual overrides:
- sectionTheme.background: "default" | "dark" | "light" | "primary" | "gradient" | "surface" | "secondary"
- sectionTheme.textColor: "default" | "light" | "dark"
- sectionTheme.padding: "compact" | "normal" | "spacious" | "none"

Example section with theme override:
{ "type": "stats", "props": { "title": "Our Impact", "items": [...], "sectionTheme": { "background": "dark", "textColor": "light" } } }

Respond ONLY with valid JSON in this exact format:
{
  "websiteType": "${websiteType}",
  "detectedColors": { "primary": "#...", "secondary": "#...", "accent": "#...", "background": "#...", "text": "#...", "palette": ["#...", "#...", "#...", "#...", "#..."] },
  "detectedStyle": {
    "vibe": "modern",
    "typography": ["Font1", "Font2"],
    "layout": "centered",
    "mood": ["professional", "clean"],
    "headingStyle": "sans-serif",
    "borderRadius": "lg",
    "cardStyle": "shadowed",
    "spacing": "normal"
  },
  "detectedIndustry": "industry",
  "detectedElements": ["element1", "element2"],
  "detectedLayout": {
    "navbarStyle": "sticky-white|sticky-blur|sticky-dark|transparent",
    "navbarLayout": "centered|left-aligned|centered-logo|minimal",
    "showSearch": true,
    "heroStyle": "centered|split|fullwidth|minimal",
    "sections": [
      { "type": "hero", "props": { "style": "split", "title": "...", "subtitle": "...", "ctaText": "...", "sectionTheme": { "background": "gradient" } } },
      { "type": "...", "props": { ... } }
    ],
    "footerStyle": "dark|light|minimal|centered|expanded|newsletter-focus",
    "footerColumns": 4,
    "showNewsletter": true,
    "productColumns": 4,
    "cardStyle": "flat|bordered|shadowed|elevated",
    "sectionSpacing": "compact|normal|spacious",
    "borderRadius": "none|sm|md|lg|xl|2xl|full",
    "pageLayout": "fullwidth|boxed|magazine",
    "contentWidth": "narrow|normal|wide|full"
  },
  "confidence": 85
}`;
}

// ─── Main analysis function ───

export async function analyzeDesign(request: DesignAnalysisRequest): Promise<DesignAnalysisResult> {
  const imageData = request.imageBase64 || request.imageUrl || "";
  if (!imageData) {
    return fallbackAnalysis(request.websiteType);
  }

  const isBase64 = !request.imageUrl;
  const websiteType = request.websiteType || "ecommerce";

  try {
    const result = await aiComplete({
      messages: [
        {
          role: "system",
          content: buildDesignSystemPrompt(websiteType),
        },
        {
          role: "user",
          content: isBase64
            ? `Analyze this image in detail and create a UNIQUE ${websiteType} website design inspired by it. Extract colors, style, layout structure, section ordering, navbar/footer style, typography, spacing, and card style. Make the design DISTINCTIVE — not a generic template.`
            : `Analyze this image at ${request.imageUrl} and create a UNIQUE ${websiteType} website design inspired by it. Extract colors, style, layout structure, section ordering, navbar/footer style, typography, spacing, and card style. Make the design DISTINCTIVE — not a generic template.`,
        },
      ],
      config: { maxTokens: 8192, temperature: 0.4 },
      responseFormat: "json",
    });

    const jsonStr = result.content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    const websiteTypeDetected = parsed.websiteType || request.websiteType || "ecommerce";
    const templateId =
      WEBSITE_TYPE_MAP[websiteTypeDetected?.toLowerCase() || ""] ||
      INDUSTRY_TEMPLATE_MAP[parsed.detectedIndustry?.toLowerCase() || ""] ||
      STYLE_VIBE_TO_TEMPLATE[parsed.detectedStyle?.vibe?.toLowerCase() || ""] ||
      "default";

    // Parse detected layout with validation
    const rawLayout = parsed.detectedLayout || {};
    const detectedLayout: DetectedLayout = {
      navbarStyle: validateEnum(rawLayout.navbarStyle, ["sticky-white", "sticky-blur", "sticky-dark", "transparent"], "sticky-blur"),
      navbarLayout: validateEnum(rawLayout.navbarLayout, ["centered", "left-aligned", "centered-logo", "minimal"], "left-aligned"),
      showSearch: rawLayout.showSearch !== false,
      heroStyle: validateEnum(rawLayout.heroStyle, ["centered", "split", "fullwidth", "minimal", "video", "parallax"], "centered"),
      sections: rawLayout.sections || [],
      footerStyle: validateEnum(rawLayout.footerStyle, ["dark", "light", "minimal", "centered", "expanded", "newsletter-focus"], "dark"),
      footerColumns: validateNumber(rawLayout.footerColumns, [2, 3, 4], 4),
      showNewsletter: rawLayout.showNewsletter !== false,
      productColumns: validateNumber(rawLayout.productColumns, [2, 3, 4], 4),
      cardStyle: validateEnum(rawLayout.cardStyle, ["flat", "bordered", "shadowed", "elevated"], "shadowed"),
      sectionSpacing: validateEnum(rawLayout.sectionSpacing, ["compact", "normal", "spacious"], "normal"),
      borderRadius: validateEnum(rawLayout.borderRadius, ["none", "sm", "md", "lg", "xl", "2xl", "full"], "lg"),
      websiteType: websiteTypeDetected,
    };

    return {
      websiteType: websiteTypeDetected,
      detectedColors: parsed.detectedColors || fallbackAnalysis(websiteType).detectedColors,
      detectedStyle: {
        vibe: parsed.detectedStyle?.vibe || "modern",
        typography: parsed.detectedStyle?.typography || ["Inter"],
        layout: parsed.detectedStyle?.layout || "centered",
        mood: parsed.detectedStyle?.mood || ["professional"],
        headingStyle: parsed.detectedStyle?.headingStyle || "sans-serif",
        borderRadius: detectedLayout.borderRadius,
        cardStyle: detectedLayout.cardStyle,
        spacing: detectedLayout.sectionSpacing,
      },
      detectedIndustry: parsed.detectedIndustry || "general",
      detectedElements: parsed.detectedElements || [],
      detectedLayout,
      confidence: parsed.confidence || 50,
      suggestedTemplateId: templateId,
      suggestedColors: {
        primary: parsed.detectedColors?.primary || "#1e3a5f",
        secondary: parsed.detectedColors?.secondary || "#2563eb",
        accent: parsed.detectedColors?.accent || "#059669",
      },
      aiPrompt: `Design based on ${parsed.detectedIndustry || "general"} industry with ${parsed.detectedStyle?.vibe || "modern"} vibe`,
    };
  } catch {
    return fallbackAnalysis(websiteType);
  }
}

// ─── Validation helpers ───

function validateEnum<T extends string>(value: any, valid: T[], fallback: T): T {
  if (typeof value === "string" && valid.includes(value as T)) return value as T;
  return fallback;
}

function validateNumber<T extends number>(value: any, valid: readonly T[], fallback: T): T {
  if (typeof value === "number" && (valid as readonly number[]).includes(value)) return value as T;
  return fallback;
}

// ─── Fallback analysis with industry-specific colors ───

function fallbackAnalysis(websiteType: string = "ecommerce"): DesignAnalysisResult {
  const colors = INDUSTRY_COLORS[websiteType] || INDUSTRY_COLORS.general;

  return {
    websiteType,
    detectedColors: {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      text: colors.text,
      palette: [colors.primary, colors.secondary, colors.accent, colors.background, colors.text],
    },
    detectedStyle: {
      vibe: "modern",
      typography: ["Inter", "Noto Sans"],
      layout: "centered",
      mood: ["professional", "clean", "trustworthy"],
      headingStyle: "sans-serif",
      borderRadius: "lg",
      cardStyle: "shadowed",
      spacing: "normal",
    },
    detectedIndustry: websiteType === "ecommerce" ? "general" : websiteType,
    detectedElements: [],
    detectedLayout: {
      navbarStyle: "sticky-blur",
      navbarLayout: "left-aligned",
      showSearch: websiteType === "ecommerce",
      heroStyle: "centered",
      sections: [],
      footerStyle: "dark",
      footerColumns: 4,
      showNewsletter: websiteType === "ecommerce" || websiteType === "blog",
      productColumns: 4,
      cardStyle: "shadowed",
      sectionSpacing: "normal",
      borderRadius: "lg",
      websiteType,
    },
    confidence: 0,
    suggestedTemplateId: "default",
    suggestedColors: { primary: colors.primary, secondary: colors.secondary, accent: colors.accent },
    aiPrompt: "Default modern template",
  };
}

// ─── Generate full template config from text prompt ───

export async function generateTemplateFromPrompt(
  request: GenerateFromPromptRequest
): Promise<GenerateFromPromptResponse> {
  const { prompt, businessName, industry, websiteType = "ecommerce" } = request;

  try {
    const result = await aiComplete({
      messages: [
        {
          role: "system",
          content: buildDesignSystemPrompt(websiteType),
        },
        {
          role: "user",
          content: `Create a UNIQUE, COMPLETE ${websiteType} website design based on this description: "${prompt}". Business name: ${businessName || "Not specified"}. Industry: ${industry || "Auto-detect from prompt"}. Website type: ${websiteType}.

IMPORTANT: Make this design DISTINCTIVE and tailored to the specific business. Do NOT use generic placeholder text — write specific, relevant content. Use sectionTheme overrides to create visual variety. Choose colors that match the industry and mood.`,
        },
      ],
      config: { maxTokens: 8192, temperature: 0.5 },
      responseFormat: "json",
    });

    const jsonStr = result.content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    const detectedWebsiteType = parsed.websiteType || websiteType;
    const templateId =
      WEBSITE_TYPE_MAP[detectedWebsiteType?.toLowerCase() || ""] ||
      INDUSTRY_TEMPLATE_MAP[parsed.detectedIndustry?.toLowerCase() || ""] ||
      STYLE_VIBE_TO_TEMPLATE[parsed.detectedStyle?.vibe?.toLowerCase() || ""] ||
      "default";

    const c = parsed.detectedColors || fallbackAnalysis(websiteType).detectedColors;
    const s = parsed.detectedStyle || fallbackAnalysis(websiteType).detectedStyle;
    const layout = parsed.detectedLayout || fallbackAnalysis(websiteType).detectedLayout;

    const sections = sanitizeSections(
      layout.sections || [],
      businessName || "",
      c.primary,
      layout.heroStyle || "centered",
      detectedWebsiteType,
      parsed.detectedIndustry || industry || "general",
    );

    const templateConfig = buildTemplateConfig({
      id: `ai-prompt-${Date.now()}`,
      businessName: businessName || `${capitalize(parsed.detectedIndustry || detectedWebsiteType || "modern")} Site`,
      websiteType: detectedWebsiteType,
      colors: c,
      style: s,
      layout,
      sections,
      industry: parsed.detectedIndustry || industry || detectedWebsiteType,
    });

    return {
      analysis: {
        websiteType: detectedWebsiteType,
        detectedColors: c,
        detectedStyle: s,
        detectedIndustry: parsed.detectedIndustry || "general",
        detectedElements: parsed.detectedElements || [],
        detectedLayout: {
          navbarStyle: validateEnum(layout.navbarStyle, ["sticky-white", "sticky-blur", "sticky-dark", "transparent"], "sticky-blur"),
          navbarLayout: validateEnum(layout.navbarLayout, ["centered", "left-aligned", "centered-logo", "minimal"], "left-aligned"),
          showSearch: layout.showSearch !== false,
          heroStyle: validateEnum(layout.heroStyle, ["centered", "split", "fullwidth", "minimal", "video", "parallax"], "centered"),
          sections: sections,
          footerStyle: validateEnum(layout.footerStyle, ["dark", "light", "minimal", "centered", "expanded", "newsletter-focus"], "dark"),
          footerColumns: validateNumber(layout.footerColumns, [2, 3, 4], 4),
          showNewsletter: layout.showNewsletter !== false,
          productColumns: validateNumber(layout.productColumns, [2, 3, 4], 4),
          cardStyle: validateEnum(layout.cardStyle, ["flat", "bordered", "shadowed", "elevated"], "shadowed"),
          sectionSpacing: validateEnum(layout.sectionSpacing, ["compact", "normal", "spacious"], "normal"),
          borderRadius: validateEnum(layout.borderRadius, ["none", "sm", "md", "lg", "xl", "2xl", "full"], "lg"),
          websiteType: detectedWebsiteType,
        },
        confidence: parsed.confidence || 75,
        suggestedTemplateId: templateId,
        suggestedColors: {
          primary: c.primary,
          secondary: c.secondary,
          accent: c.accent,
        },
        aiPrompt: `Design based on "${prompt}" with ${s.vibe} vibe`,
      },
      templateConfig,
      previewColors: [c.primary, c.secondary, c.accent, c.background || "#ffffff"],
      marketingTips: [
        `Your ${s.vibe} design pairs well with ${s.typography?.[0] || "Inter"} fonts`,
        `Add content matching your ${parsed.detectedIndustry || detectedWebsiteType || "general"} niche for best results`,
        detectedWebsiteType === "ecommerce" ? `Set up bKash and Nagad payments to reach 90% of Bangladeshi customers` : `Promote your ${detectedWebsiteType} site on social media for maximum reach`,
      ],
    };
  } catch (error) {
    const fallback = fallbackAnalysis(websiteType);
    return {
      analysis: fallback,
      templateConfig: generateFallbackConfig(businessName || "My Site", fallback, websiteType),
      previewColors: [fallback.detectedColors.primary, fallback.detectedColors.secondary, fallback.detectedColors.accent, "#ffffff"],
      marketingTips: ["Add your content to get started", "Configure settings for your specific website type"],
    };
  }
}

// ─── Shared template config builder ───

interface TemplateConfigParams {
  id: string;
  businessName: string;
  websiteType: string;
  colors: { primary: string; secondary: string; accent: string; background?: string; text?: string; palette?: string[] };
  style: { vibe?: string; typography?: string[]; headingStyle?: string; borderRadius?: string; cardStyle?: string; spacing?: string };
  layout: { navbarStyle?: string; navbarLayout?: string; showSearch?: boolean; heroStyle?: string; footerStyle?: string; footerColumns?: number; showNewsletter?: boolean; productColumns?: number; cardStyle?: string; sectionSpacing?: string; borderRadius?: string; pageLayout?: string; contentWidth?: string };
  sections: { type: string; props: Record<string, any> }[];
  industry?: string;
}

function buildTemplateConfig(params: TemplateConfigParams): GeneratedTemplateConfig {
  const { id, businessName, websiteType, colors: c, style: s, layout, sections, industry } = params;
  const isEcommerce = websiteType === "ecommerce";

  return {
    id,
    name: businessName,
    tagline: `Beautiful ${industry || websiteType} site built with AI`,
    description: `AI-generated ${s.vibe || "modern"} template for ${industry || websiteType}`,
    version: "1.0.0",
    category: industry || websiteType || "general",
    isPremium: false,
    websiteType,
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
      pageLayout: validateEnum(layout.pageLayout, ["fullwidth", "sidebar-left", "sidebar-right", "boxed", "magazine"], undefined as any) || undefined,
      contentWidth: validateEnum(layout.contentWidth, ["narrow", "normal", "wide", "full"], undefined as any) || undefined,
    },
    navbar: {
      style: layout.navbarStyle || "sticky-blur",
      showSearch: layout.showSearch !== false && isEcommerce,
      showWishlist: isEcommerce,
      showUserMenu: isEcommerce,
      layout: layout.navbarLayout || "left-aligned",
      announcementBar: isEcommerce ? {
        message: `🚀 Welcome to ${businessName}! Free shipping on orders over ৳1,000`,
        bgColor: c.primary,
        textColor: "#ffffff",
      } : undefined,
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
    productPage: isEcommerce ? {
      imageLayout: "stacked",
      showReviews: true,
      showRecentlyViewed: true,
      showRelatedProducts: true,
      showWishlist: true,
      showFeatures: true,
      features: [
        { icon: "Truck", title: "Free Shipping", description: "On orders over ৳1,000" },
        { icon: "ShieldCheck", title: "Secure Payment", description: "100% secure checkout" },
        { icon: "RefreshCw", title: "Easy Returns", description: "7-day return policy" },
      ],
    } : undefined,
    collectionPage: isEcommerce ? {
      showFilters: true,
      gridColumns: layout.productColumns || 4,
      cardStyle: "standard",
    } : undefined,
  };
}

function generateFallbackConfig(businessName: string, analysis: any, websiteType: string = "ecommerce"): GeneratedTemplateConfig {
  const c = analysis.detectedColors;
  const sections = industryDefaultSections(websiteType, analysis.detectedIndustry || "general", businessName, c.primary);

  return buildTemplateConfig({
    id: `ai-fallback-${Date.now()}`,
    businessName,
    websiteType,
    colors: c,
    style: analysis.detectedStyle || {},
    layout: analysis.detectedLayout || {},
    sections,
    industry: analysis.detectedIndustry || websiteType,
  });
}

// ─── Generate full template config from image ───

export async function generateTemplateFromImage(
  request: GenerateFromImageRequest
): Promise<GenerateFromImageResponse> {
  const analysis = await analyzeDesign({
    imageBase64: request.imageBase64,
    imageUrl: request.imageUrl,
    businessName: request.businessName,
    industry: request.businessType,
    websiteType: request.websiteType,
  });

  const c = analysis.detectedColors;
  const s = analysis.detectedStyle;
  const layout = analysis.detectedLayout;
  const websiteType = analysis.websiteType || "ecommerce";

  // Build sections from AI-detected layout, with validation and fallbacks
  const sections = sanitizeSections(
    layout.sections,
    request.businessName || "",
    c.primary,
    layout.heroStyle,
    websiteType,
    analysis.detectedIndustry || request.businessType || "general",
  );

  const templateConfig = buildTemplateConfig({
    id: `ai-${Date.now()}`,
    businessName: request.businessName || `${capitalize(analysis.detectedIndustry || websiteType)} Site`,
    websiteType,
    colors: c,
    style: s,
    layout,
    sections,
    industry: analysis.detectedIndustry || websiteType,
  });

  return {
    analysis,
    templateConfig,
    previewColors: [c.primary, c.secondary, c.accent, c.background || "#ffffff"],
    marketingTips: [
      `Your ${s.vibe} design pairs well with ${s.typography?.[0] || "Inter"} fonts`,
      `Add content matching your ${analysis.detectedIndustry || websiteType} niche for best results`,
      websiteType === "ecommerce"
        ? `Set up bKash and Nagad payments to reach 90% of Bangladeshi customers`
        : `Promote your ${websiteType} site on social media for maximum reach`,
    ],
  };
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
