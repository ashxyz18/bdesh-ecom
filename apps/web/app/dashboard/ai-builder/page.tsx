"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Sparkles, Upload, Loader2, Check, Palette, X, RefreshCw, Eye,
  ArrowRight, Zap, Wand2, Image as ImageIcon, Layout, Type,
  Monitor, Tablet, Smartphone, Paintbrush, Save, ChevronDown, ChevronUp, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "../DashboardContext";
import Link from "next/link";
import type { TemplateConfig, HomeSectionConfig } from "@/lib/store-templates/engine/types";
import { StoreProviders } from "@/app/store/[[...path]]/providers";

// Lazy-load ConfigTemplate for the live preview (avoids heavy bundle on initial page load)
const ConfigTemplate = dynamic(() => import("@/lib/store-templates/engine/ConfigTemplate"), { ssr: false });

// ─── Client-side color extraction via Canvas ───────────────────────

interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  ratio: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function colorDistance(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function extractColorsFromImage(imageSrc: string, maxColors = 8): Promise<ExtractedColor[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const size = 100;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      // Quantize and count
      const colorMap = new Map<string, { count: number; r: number; g: number; b: number }>();
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const a = data[i + 3];
        if (a < 128) continue; // skip transparent
        const key = `${r},${g},${b}`;
        const existing = colorMap.get(key);
        if (existing) existing.count++;
        else colorMap.set(key, { count: 1, r, g, b });
      }

      // Sort by frequency
      const sorted = [...colorMap.values()].sort((a, b) => b.count - a.count);
      const totalPixels = sorted.reduce((s, c) => s + c.count, 0);

      // Filter out near-whites and near-blacks, then deduplicate
      const filtered = sorted.filter((c) => {
        const brightness = (c.r + c.g + c.b) / 3;
        return brightness > 20 && brightness < 240;
      });

      // Deduplicate similar colors
      const deduplicated: typeof filtered = [];
      for (const color of filtered) {
        const isDuplicate = deduplicated.some(
          (d) => colorDistance(d, color) < 50
        );
        if (!isDuplicate) deduplicated.push(color);
      }

      // Also add the most prominent dark and light colors
      const darks = sorted.filter((c) => (c.r + c.g + c.b) / 3 < 60);
      const lights = sorted.filter((c) => (c.r + c.g + c.b) / 3 > 200);

      const result: ExtractedColor[] = [];

      // Add dark color (for text)
      if (darks.length > 0) {
        const d = darks[0];
        result.push({ hex: rgbToHex(d.r, d.g, d.b), rgb: { r: d.r, g: d.g, b: d.b }, ratio: d.count / totalPixels });
      }

      // Add main colors
      for (const c of deduplicated.slice(0, maxColors)) {
        result.push({ hex: rgbToHex(c.r, c.g, c.b), rgb: { r: c.r, g: c.g, b: c.b }, ratio: c.count / totalPixels });
      }

      // Add light color (for background)
      if (lights.length > 0) {
        const l = lights[0];
        result.push({ hex: rgbToHex(l.r, l.g, l.b), rgb: { r: l.r, g: l.g, b: l.b }, ratio: l.count / totalPixels });
      }

      resolve(result.slice(0, maxColors + 2));
    };
    img.onerror = () => resolve([]);
    img.src = imageSrc;
  });
}

// ─── Types ──────────────────────────────────────────────────────────

interface AIDesignResult {
  detectedColors: { primary: string; secondary: string; accent: string; background: string; text: string; palette: string[] };
  detectedStyle: { vibe: string; typography: string[]; layout: string; mood: string[] };
  detectedIndustry: string;
  detectedElements: string[];
  suggestedTemplateId: string;
  templateConfig: TemplateConfig;
  previewColors: string[];
  marketingTips: string[];
}

// ─── Fallback TemplateConfig builder (used when AI API fails) ──────────────

function buildFallbackSections(websiteType: string, storeName: string, primary: string) {
  const name = storeName || "Our Store";

  if (websiteType === "portfolio") {
    return [
      { type: "hero", props: { style: "fullwidth", title: `Hi, I'm ${name}`, subtitle: "Designer, Developer & Creative Thinker", ctaText: "View My Work", ctaLink: "#projects" } },
      { type: "about", props: { layout: "split", title: "About Me", description: "Passionate about creating beautiful digital experiences." } },
      { type: "projects", props: { layout: "grid", columns: 3, title: "Featured Projects", showFilters: true } },
      { type: "skills", props: { layout: "bars", title: "Skills & Expertise" } },
      { type: "experience", props: { layout: "timeline", title: "Experience" } },
      { type: "testimonials", props: { style: "cards", title: "What Clients Say" } },
      { type: "contact", props: { layout: "split", title: "Get In Touch" } },
    ];
  }

  if (websiteType === "corporate") {
    return [
      { type: "hero", props: { style: "split", title: name, subtitle: "Innovative solutions that drive your business forward", ctaText: "Get Started", ctaLink: "#services", showStats: true, stats: [{ label: "Clients", value: "500+" }, { label: "Projects", value: "1,200+" }, { label: "Years", value: "15+" }] } },
      { type: "services", props: { layout: "grid", columns: 3, title: "Our Services" } },
      { type: "about", props: { layout: "image-right", title: "Who We Are" } },
      { type: "mission", props: { layout: "cards", title: "Our Values" } },
      { type: "stats", props: { title: "By The Numbers" } },
      { type: "clients", props: { layout: "grid", title: "Trusted By" } },
      { type: "team", props: { title: "Meet Our Leadership" } },
      { type: "contact", props: { layout: "split", title: "Contact Us" } },
    ];
  }

  if (websiteType === "blog") {
    return [
      { type: "hero", props: { style: "centered", title: name, subtitle: "Ideas, stories, and insights worth sharing", ctaText: "Start Reading" } },
      { type: "featuredPost", props: { layout: "hero", title: "Featured Story" } },
      { type: "blogPosts", props: { layout: "grid", columns: 3, title: "Latest Articles", showExcerpt: true, showDate: true } },
      { type: "newsletter", props: { title: "Subscribe", subtitle: "Get the latest posts delivered to your inbox", style: "card" } },
    ];
  }

  if (websiteType === "restaurant") {
    return [
      { type: "hero", props: { style: "fullwidth", title: name, subtitle: "Authentic flavors, unforgettable experiences", ctaText: "View Menu" } },
      { type: "about", props: { layout: "split", title: "Our Story" } },
      { type: "menu", props: { layout: "cards", title: "Our Menu", showImages: true, columns: 3 } },
      { type: "gallery", props: { layout: "masonry", columns: 3, title: "Our Space" } },
      { type: "hours", props: { layout: "table", title: "Opening Hours" } },
      { type: "reservation", props: { layout: "split", title: "Make a Reservation" } },
      { type: "contact", props: { layout: "centered", title: "Find Us" } },
    ];
  }

  if (websiteType === "education") {
    return [
      { type: "hero", props: { style: "centered", title: name, subtitle: "Unlock your potential with world-class courses", ctaText: "Explore Courses", showStats: true, stats: [{ label: "Courses", value: "50+" }, { label: "Students", value: "10K+" }, { label: "Instructors", value: "100+" }] } },
      { type: "courses", props: { layout: "grid", columns: 3, title: "Popular Courses" } },
      { type: "features", props: { layout: "grid", title: "Why Choose Us" } },
      { type: "testimonials", props: { style: "cards", title: "Student Testimonials" } },
      { type: "contact", props: { layout: "split", title: "Get In Touch" } },
    ];
  }

  if (websiteType === "landing") {
    return [
      { type: "hero", props: { style: "split", title: name, subtitle: "The smarter way to get things done", ctaText: "Get Started Free", showStats: true, stats: [{ label: "Users", value: "50K+" }, { label: "Uptime", value: "99.9%" }, { label: "Rating", value: "4.9★" }] } },
      { type: "features", props: { layout: "grid", title: "Powerful Features", style: "minimal" } },
      { type: "stats", props: { title: "Trusted by Thousands" } },
      { type: "testimonials", props: { style: "cards", title: "What People Are Saying" } },
      { type: "pricing", props: { title: "Simple Pricing" } },
      { type: "faq", props: { title: "Frequently Asked Questions" } },
      { type: "cta", props: { title: "Ready to Get Started?", buttonText: "Start Free Trial", style: "centered" } },
    ];
  }

  // Default: ecommerce
  return [
    { type: "announcement", props: { message: "🚀 Free shipping on orders over ৳1,000", bgColor: primary, textColor: "#ffffff" } },
    { type: "hero", props: { style: "centered", title: `Welcome to ${name}`, subtitle: "Discover amazing products curated just for you.", ctaText: "Shop Now", ctaLink: "/products", showStats: true, stats: [{ label: "Products", value: "500+" }, { label: "Customers", value: "10K+" }, { label: "Reviews", value: "4.8★" }] } },
    { type: "collections", props: { layout: "grid", columns: 4, showAll: true, title: "Shop by Category" } },
    { type: "featuredProducts", props: { layout: "grid", columns: 4, limit: 8, title: "Featured Products", showQuickAdd: true } },
    { type: "features", props: { layout: "grid", items: [{ icon: "Truck", title: "Free Shipping", description: "On orders over ৳1,000" }, { icon: "ShieldCheck", title: "Secure Payment", description: "100% secure checkout" }, { icon: "RefreshCcw", title: "Easy Returns", description: "7-day return policy" }, { icon: "Star", title: "Top Quality", description: "Verified products only" }], style: "minimal" } },
    { type: "products", props: { layout: "grid", columns: 4, showFilters: true, showSearch: true, title: "All Products" } },
    { type: "newsletter", props: { title: "Stay Updated", subtitle: "Get the latest deals directly in your inbox", style: "card" } },
  ];
}

function buildFallbackTemplateConfig(
  primary: string, secondary: string, accent: string, bg: string, text: string, storeName: string, websiteType: string = "ecommerce"
): TemplateConfig {
  const isEcommerce = websiteType === "ecommerce";
  const sections = buildFallbackSections(websiteType, storeName, primary);

  return {
    id: "ai-fallback",
    name: storeName,
    tagline: `AI-Generated ${websiteType === "ecommerce" ? "Store" : "Website"}`,
    description: "Auto-generated design from extracted colors",
    version: "1.0.0",
    category: "general",
    websiteType,
    isPremium: false,
    colors: {
      primary,
      secondary,
      accent,
      background: bg,
      surface: bg === "#ffffff" ? "#f8fafc" : bg,
      text,
      textMuted: "#6b7280",
      border: "#e5e7eb",
      success: "#22c55e",
      error: "#ef4444",
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: "700",
      borderRadius: "lg",
    },
    layout: {
      maxWidth: "7xl",
      sectionSpacing: "normal",
      cardStyle: "shadowed",
      productColumns: 4,
    },
    navbar: {
      style: "sticky-blur",
      showSearch: isEcommerce,
      showWishlist: isEcommerce,
      showUserMenu: isEcommerce,
      layout: isEcommerce ? "left-aligned" : "centered",
      announcementBar: isEcommerce ? {
        message: `🚀 Welcome to ${storeName}! Free shipping on orders over ৳1,000`,
        bgColor: primary,
        textColor: "#ffffff",
      } : undefined,
    },
    footer: {
      style: "dark",
      showNewsletter: isEcommerce || websiteType === "blog",
      showSocial: true,
      columns: 4,
    },
    homePage: {
      sections: sections as HomeSectionConfig[],
    },
    productPage: isEcommerce ? {
      imageLayout: "stacked" as const,
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
      gridColumns: 4 as const,
      cardStyle: "standard" as const,
    } : undefined,
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AIBuilderDashboardPage() {
  const { activeStore } = useDashboard();
  const storeId = activeStore?.id;

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [inputMode, setInputMode] = useState<"image" | "prompt" | "url">("image");
  const [businessName, setBusinessName] = useState(activeStore?.name || "");
  const [businessType, setBusinessType] = useState("");
  const [websiteType, setWebsiteType] = useState("ecommerce");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIDesignResult | null>(null);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Preview store (mock data for ConfigTemplate rendering) ────────────────

  const previewStore = useMemo(() => ({
    id: "preview",
    name: businessName || "Your Store",
    slug: "preview",
    subdomain: (businessName || "your-store").toLowerCase().replace(/\s+/g, "-"),
    description: `AI-generated ${(result?.detectedIndustry || "general")} store`,
    logo: null,
    banner: null,
    status: "ACTIVE" as const,
    theme: {
      templateId: result?.suggestedTemplateId || "default",
      primaryColor: result?.detectedColors?.primary || "#006A4E",
      secondaryColor: result?.detectedColors?.secondary || "#F42A41",
    },
    settings: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    products: [],
    collections: [],
  }), [businessName, result?.detectedIndustry, result?.detectedColors, result?.suggestedTemplateId]);

  // ─── File handling ──────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    setImageFile(file);
    setError("");
    setResult(null);
    setApplied(false);

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      // Extract colors client-side immediately
      const colors = await extractColorsFromImage(dataUrl);
      setExtractedColors(colors);
    };
    reader.readAsDataURL(file);
  }, [setImage, setImageFile, setExtractedColors, setError, setResult, setApplied]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile, setDragOver]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // ─── Generate website from image ────────────────────────────────────────

  const handleGenerate = async () => {
    if (!image && inputMode !== "url") return;
    if (inputMode === "url" && !url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setApplied(false);

    try {
      const body: Record<string, string> = {};
      
      if (inputMode === "url") {
        body.url = url.trim();
        body.websiteType = websiteType;
      } else {
        if (imageFile && image?.startsWith("data:")) {
          body.imageBase64 = image.split(",")[1];
        } else if (image) {
          body.imageUrl = image;
        }
      }
      
      if (businessName) body.businessName = businessName;
      if (businessType) body.businessType = businessType;
      if (websiteType) body.websiteType = websiteType;

      const endpoint = inputMode === "url" ? "/api/ai/clone-website" : "/api/ai/generate-from-image";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      // Flatten API response: API returns { analysis: { detectedStyle, detectedColors, ... }, ... }
      const analysis = data.analysis || {};
      setResult({
        detectedColors: analysis.detectedColors || data.detectedColors || {},
        detectedStyle: analysis.detectedStyle || data.detectedStyle || {},
        detectedIndustry: analysis.detectedIndustry || data.detectedIndustry || "general",
        detectedElements: analysis.detectedElements || data.detectedElements || [],
        suggestedTemplateId: data.suggestedTemplateId || analysis.suggestedTemplateId || "default",
        templateConfig: data.templateConfig || buildFallbackTemplateConfig(
          analysis.detectedColors?.primary || "#006A4E",
          analysis.detectedColors?.secondary || "#F42A41",
          analysis.detectedColors?.accent || "#059669",
          analysis.detectedColors?.background || "#ffffff",
          analysis.detectedColors?.text || "#111827",
          businessName || activeStore?.name || "Our Store",
          websiteType,
        ),
        previewColors: data.previewColors || [],
        marketingTips: data.marketingTips || [],
      });
    } catch (err: any) {
      setError(err.message || "AI analysis failed. Using extracted colors instead.");
      
      if (inputMode !== "url") {
        // Fallback: use client-side extracted colors to build a result
        const primary = extractedColors[1]?.hex || "#006A4E";
        const secondary = extractedColors[2]?.hex || "#F42A41";
        const accent = extractedColors[3]?.hex || "#059669";
        const bg = extractedColors.find((c) => (c.rgb.r + c.rgb.g + c.rgb.b) / 3 > 180)?.hex || "#ffffff";
        const text = extractedColors.find((c) => (c.rgb.r + c.rgb.g + c.rgb.b) / 3 < 80)?.hex || "#111827";

        setResult({
          detectedColors: {
            primary,
            secondary,
            accent,
            background: bg,
            text,
            palette: extractedColors.map((c) => c.hex),
          },
          detectedStyle: { vibe: "modern", typography: ["Inter", "Noto Sans Bengali"], layout: "centered", mood: ["professional", "clean"] },
          detectedIndustry: businessType || "general",
          detectedElements: [],
          suggestedTemplateId: "default",
          templateConfig: buildFallbackTemplateConfig(primary, secondary, accent, bg, text, businessName || activeStore?.name || "Our Store", websiteType),
          previewColors: [primary, secondary, accent, bg],
          marketingTips: [
            `Set up payments for ${websiteType === "ecommerce" ? "Bangladesh customers" : "your audience"}`,
            "Add high-quality content matching your brand colors",
            websiteType === "ecommerce" ? "Use COD (Cash on Delivery) — preferred by 85% of BD shoppers" : "Promote your site on social media",
          ],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Generate website from text prompt ────────────────────────────────────────

  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setApplied(false);

    try {
      const body: Record<string, string> = { prompt: prompt.trim(), websiteType };
      if (businessName) body.businessName = businessName;
      if (businessType) body.industry = businessType;

      const res = await fetch("/api/ai/generate-from-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      // Flatten API response
      const analysis = data.analysis || {};
      setResult({
        detectedColors: analysis.detectedColors || data.detectedColors || {},
        detectedStyle: analysis.detectedStyle || data.detectedStyle || {},
        detectedIndustry: analysis.detectedIndustry || data.detectedIndustry || "general",
        detectedElements: analysis.detectedElements || data.detectedElements || [],
        suggestedTemplateId: data.suggestedTemplateId || analysis.suggestedTemplateId || "default",
        templateConfig: data.templateConfig || buildFallbackTemplateConfig(
          analysis.detectedColors?.primary || "#006A4E",
          analysis.detectedColors?.secondary || "#F42A41",
          analysis.detectedColors?.accent || "#059669",
          analysis.detectedColors?.background || "#ffffff",
          analysis.detectedColors?.text || "#111827",
          businessName || activeStore?.name || "Our Store",
          websiteType,
        ),
        previewColors: data.previewColors || [],
        marketingTips: data.marketingTips || [],
      });
    } catch (err: any) {
      setError(err.message || "AI generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Apply design to store ──────────────────────────────────────────────────────

  const handleApplyToStore = async () => {
    if (!storeId || !result) return;
    setApplying(true);
    setApplied(false);

    try {
      const c = result.detectedColors || {};
      const theme = {
        templateId: `ai-${Date.now()}`,
        // Full template config for ConfigTemplateWrapper rendering
        templateConfig: result.templateConfig,
        aiGenerated: true,
        generatedAt: new Date().toISOString(),
        // Color shortcuts for backward compatibility
        primaryColor: c.primary || "#006A4E",
        secondaryColor: c.secondary || "#F42A41",
        accentColor: c.accent || "#059669",
        backgroundColor: c.background || "#ffffff",
        textColor: c.text || "#111827",
        palette: c.palette || [],
      };

      const settings = {
        announcementText: `🚀 Welcome to ${businessName || activeStore?.name || "our store"}! Free shipping on orders over ৳1,000`,
        heroTitle: businessName || activeStore?.name || "Welcome to Our Store",
        heroSubtitle: `Discover amazing products curated just for you. Shop with confidence.`,
      };

      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: JSON.stringify(theme),
          settings: JSON.stringify(settings),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to apply design");
      }

      setApplied(true);
      setTimeout(() => setApplied(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to apply design to store");
    } finally {
      setApplying(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setError("");
    setExtractedColors([]);
    setApplied(false);
    setBusinessName(activeStore?.name || "");
    setBusinessType("");
    setPrompt("");
  };

  // ─── Render result view ────────────────────────────────────────────────────────────────

  const renderResultView = (r: AIDesignResult) => (
    <div className="space-y-6">
      {/* Success banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <Check size={20} className="text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-emerald-900">Website Generated Successfully!</h3>
          <p className="text-sm text-emerald-700">
            AI detected <strong>{r.detectedIndustry || "general"}</strong> industry with <strong>{r.detectedStyle?.vibe || "modern"}</strong> style
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Color palette + Design details */}
        <div className="lg:col-span-1 space-y-4">
          {/* Color Palette */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Palette size={16} className="text-purple-500" /> Color Palette
            </h4>
            <div className="space-y-3">
              {[
                { label: "Primary", color: r.detectedColors.primary },
                { label: "Secondary", color: r.detectedColors.secondary },
                { label: "Accent", color: r.detectedColors.accent },
                { label: "Background", color: r.detectedColors.background },
                { label: "Text", color: r.detectedColors.text },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border border-slate-200 shadow-sm shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-sm font-mono font-medium text-slate-700">{item.color}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Full palette */}
            {r.detectedColors.palette.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2">Full Palette</p>
                <div className="flex gap-1.5 flex-wrap">
                  {r.detectedColors.palette.map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-md border border-slate-200 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Design Analysis */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Layout size={16} className="text-purple-500" /> Design Analysis
            </h4>
            {[
              { label: "Industry", value: r.detectedIndustry || "general", icon: "🏭" },
              { label: "Style", value: r.detectedStyle?.vibe || "modern", icon: "🎨" },
              { label: "Layout", value: r.detectedStyle?.layout || "centered", icon: "📐" },
              { label: "Fonts", value: (r.detectedStyle?.typography || ["Inter"]).join(", "), icon: "🔤" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-slate-500">{item.icon} {item.label}</span>
                <span className="text-sm font-medium text-slate-700 capitalize">{item.value}</span>
              </div>
            ))}

            {/* Mood tags */}
            {(r.detectedStyle?.mood || []).length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2">Mood</p>
                <div className="flex flex-wrap gap-1.5">
                  {(r.detectedStyle?.mood || []).map((m) => (
                    <span key={m} className="px-2.5 py-1 rounded-full bg-slate-100 text-xs text-slate-600 capitalize">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Detected elements */}
            {r.detectedElements.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2">Detected Elements</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.detectedElements.map((el) => (
                    <span key={el} className="px-2.5 py-1 rounded-full bg-purple-50 text-xs text-purple-700 capitalize">
                      {el}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Marketing Tips */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5">
            <h4 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <Zap size={16} className="text-amber-600" /> Marketing Tips
            </h4>
            <ul className="space-y-2">
              {r.marketingTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                  <span className="text-emerald-500 mt-0.5">•</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Preview header */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Eye size={16} className="text-purple-500" /> Live Preview
              </h4>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-md transition-colors ${previewDevice === "desktop" ? "bg-white shadow-sm text-slate-700" : "text-slate-400"}`}
                >
                  <Monitor size={16} />
                </button>
                <button
                  onClick={() => setPreviewDevice("tablet")}
                  className={`p-1.5 rounded-md transition-colors ${previewDevice === "tablet" ? "bg-white shadow-sm text-slate-700" : "text-slate-400"}`}
                >
                  <Tablet size={16} />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-md transition-colors ${previewDevice === "mobile" ? "bg-white shadow-sm text-slate-700" : "text-slate-400"}`}
                >
                  <Smartphone size={16} />
                </button>
              </div>
            </div>

            {/* Preview iframe-like container */}
            <div className={`mx-auto border border-slate-200 rounded-lg overflow-hidden bg-white shadow-inner ${
              previewDevice === "mobile" ? "max-w-[375px]" :
              previewDevice === "tablet" ? "max-w-[768px]" : "w-full"
            }`}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-slate-400 border border-slate-200">
                  {businessName || "your-store"}.bdesh.shop
                </div>
              </div>

              {/* Live preview using the actual ConfigTemplate engine */}
              <div className="preview-scroll" style={{ maxHeight: previewDevice === "mobile" ? "600px" : previewDevice === "tablet" ? "700px" : "800px", overflowY: "auto" }}>
                {r.templateConfig && (
                  <StoreProviders storeId={previewStore.id}>
                    <ConfigTemplate
                      config={r.templateConfig}
                      store={previewStore}
                      path={[]}
                    />
                  </StoreProviders>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={`/preview/${r.suggestedTemplateId}`}
              target="_blank"
            >
              <Button className="w-full justify-center border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" variant="outline">
                <Eye size={16} className="mr-1.5" /> Preview Full Template
              </Button>
            </Link>

            {storeId && (
              <Button
                onClick={handleApplyToStore}
                disabled={applying}
                className="w-full justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-600/20"
              >
                {applying ? (
                  <><Loader2 size={16} className="animate-spin mr-1.5" /> Applying...</>
                ) : applied ? (
                  <><Check size={16} className="mr-1.5" /> Applied to Store!</>
                ) : (
                  <><Paintbrush size={16} className="mr-1.5" /> Apply to My Store</>
                )}
              </Button>
            )}
          </div>

          {!storeId && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <strong>No store selected.</strong> Select a store from the sidebar to apply this design.
            </div>
          )}

          {applied && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800 flex items-center gap-2">
              <Check size={16} className="text-emerald-600" />
              Design applied!{" "}
              <a
                href={`/?store=${activeStore?.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:no-underline"
              >
                View your store →
              </a>
            </div>
          )}

          {/* Regenerate */}
          <div className="text-center">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              variant="ghost"
              className="text-slate-500 hover:text-purple-600"
            >
              <RefreshCw size={14} className="mr-1.5" />
              {loading ? "Regenerating..." : "Regenerate with different style"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Main Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wand2 size={24} className="text-purple-600" /> AI Website Builder
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {inputMode === "image" 
              ? "Upload a photo and AI will generate a complete website matching its colors and style"
              : "Describe your dream website and AI will build it for you"
            }
          </p>
        </div>
        {result && (
          <button onClick={handleReset} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <RefreshCw size={14} /> Start Over
          </button>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setInputMode("image")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            inputMode === "image"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:border-purple-300"
          }`}
        >
          <ImageIcon size={16} className="inline mr-1.5" /> Image Upload
        </button>
        <button
          onClick={() => setInputMode("prompt")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            inputMode === "prompt"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:border-purple-300"
          }`}
        >
          <Type size={16} className="inline mr-1.5" /> Text Prompt
        </button>
        <button
          onClick={() => setInputMode("url")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            inputMode === "url"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:border-purple-300"
          }`}
        >
          <Globe size={16} className="inline mr-1.5" /> URL Clone
        </button>
      </div>

      {/* Input Form or Result View */}
      {!result ? (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Upload Section */}
          <div className="lg:col-span-3 space-y-4">
            {inputMode === "url" ? (
              /* URL Input */
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={18} className="text-purple-600" />
                  <h3 className="font-semibold text-slate-700">Clone Website from URL</h3>
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-slate-400">
                  Enter any website URL to clone its design. AI will analyze the layout, colors, and style.
                </p>
              </div>
            ) : inputMode === "image" ? (
              /* Image Upload Drop Zone */
              <div
                className={`border-2 border-dashed rounded-xl p-8 transition-all text-center bg-white ${
                  dragOver
                    ? "border-purple-500 bg-purple-50"
                    : image
                    ? "border-slate-300 bg-slate-50"
                    : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/30"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {image ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={image}
                        alt="Uploaded reference"
                        className="max-h-72 rounded-xl mx-auto object-contain shadow-lg"
                      />
                      <button
                        onClick={() => { setImage(null); setImageFile(null); setExtractedColors([]); }}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-500">
                      {imageFile?.name || "Reference image"} — {Math.round((imageFile?.size || 0) / 1024)}KB
                    </p>

                    {/* Extracted colors preview */}
                    {extractedColors.length > 0 && (
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <Palette size={14} className="text-slate-400" />
                        <span className="text-xs text-slate-400">Detected colors:</span>
                        {extractedColors.slice(0, 6).map((c, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-lg border border-slate-200 shadow-sm"
                            style={{ backgroundColor: c.hex }}
                            title={c.hex}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                      <Upload size={24} className="text-purple-600" />
                    </div>
                    <p className="text-slate-700 font-medium mb-1">
                      Drop an image here, or click to browse
                    </p>
                    <p className="text-slate-400 text-sm">
                      Logo, product photo, mood board, or any reference image (max 10MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            ) : (
              /* Text Prompt Input */
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Type size={18} className="text-purple-600" />
                  <h3 className="font-semibold text-slate-700">Describe Your Dream Website</h3>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your website in detail. For example: 'A modern fashion ecommerce store with a dark luxury theme, gold accents, large hero images, product grid with hover effects, customer reviews section, and newsletter signup. Include a sticky navbar with search, featured products section, and footer with 4 columns...'"
                  className="w-full h-40 px-4 py-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                />
                <p className="text-xs text-slate-400">
                  Be specific about colors, layout, sections, and style for best results
                </p>
              </div>
            )}

            {/* Business details */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Layout size={16} className="text-purple-500" /> Business Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Aarong Fashion"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Business Type</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Auto-detect from image</option>
                    <option value="fashion">Fashion & Clothing</option>
                    <option value="beauty">Beauty & Salon</option>
                    <option value="food">Food & Restaurant</option>
                    <option value="grocery">Grocery & Supermarket</option>
                    <option value="electronics">Electronics & Tech</option>
                    <option value="healthcare">Healthcare & Clinic</option>
                    <option value="pharmacy">Pharmacy & Wellness</option>
                    <option value="education">Education & Tuition</option>
                    <option value="corporate">Corporate & Business</option>
                    <option value="portfolio">Portfolio & Creative</option>
                    <option value="general">General Shop</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Website Type</label>
                <select
                  value={websiteType}
                  onChange={(e) => setWebsiteType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="ecommerce">E-Commerce Store</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="corporate">Corporate / Business</option>
                  <option value="blog">Blog / Magazine</option>
                  <option value="landing">Landing Page</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="realestate">Real Estate</option>
                  <option value="education">Education</option>
                  <option value="nonprofit">Non-Profit</option>
                </select>
              </div>
            </div>

            {/* Generate button */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
            )}

            <Button
              onClick={inputMode === "url" ? handleGenerate : inputMode === "image" ? handleGenerate : handleGenerateFromPrompt}
              disabled={(inputMode === "url" ? !url.trim() : inputMode === "image" ? !image : !prompt.trim()) || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3.5 justify-center text-base font-semibold shadow-lg shadow-purple-600/20 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin mr-2" /> {inputMode === "url" ? "Cloning Website..." : inputMode === "image" ? "Analyzing Image & Generating Website..." : "Generating Website from Prompt..."}</>
              ) : (
                <><Sparkles size={18} className="mr-2" /> {inputMode === "url" ? "Clone Website from URL" : inputMode === "image" ? "Generate Website from Image" : "Generate Website from Prompt"}</>
              )}
            </Button>
          </div>

          {/* Tips sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-5">
              <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Zap size={16} className="text-purple-600" /> How It Works
              </h3>
              {inputMode === "url" ? (
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span className="text-sm text-purple-800">Enter any website URL to clone</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span className="text-sm text-purple-800">AI analyzes the complete layout and design</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span className="text-sm text-purple-800">Get a complete website matching the design</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <span className="text-sm text-purple-800">Apply the design to your store</span>
                  </li>
                </ol>
              ) : inputMode === "image" ? (
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span className="text-sm text-purple-800">Upload any image — your logo, product photo, or mood board</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span className="text-sm text-purple-800">AI analyzes colors, style, industry, and layout preferences</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span className="text-sm text-purple-800">Get a complete website with matching colors, fonts, and layout</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <span className="text-sm text-purple-800">Apply the design to your store with one click</span>
                  </li>
                </ol>
              ) : (
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span className="text-sm text-purple-800">Describe your dream website in detail</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span className="text-sm text-purple-800">Mention colors, layout style, sections you want</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span className="text-sm text-purple-800">AI creates a complete website design from your description</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <span className="text-sm text-purple-800">Apply the design to your store with one click</span>
                  </li>
                </ol>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <ImageIcon size={16} className="text-slate-400" /> Best Results With
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Brand logos or product images
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Mood boards or design references
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Storefront or office photos
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> High-contrast images with clear colors
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Any website URL to clone its design
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        renderResultView(result)
      )}
    </div>
  );
}
