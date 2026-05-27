/**
 * Built-in storefront template registry.
 *
 * Every template here is a real React component that lives under
 * `components/storefront/templates/<slug>` and renders the home page from
 * `StorefrontData`. Catalog, product detail, cart, and checkout pages are
 * shared across all templates — only the home page (and its theme defaults)
 * are template-specific. This is the same mental model Shopify uses with
 * sections vs. theme.
 */

export type BuiltinTemplateSlug = "modern" | "boutique" | "tech-store" | "aurora";

export interface BuiltinTemplate {
  slug: BuiltinTemplateSlug;
  name: string;
  description: string;
  thumbnail: string;
  category: "general" | "fashion" | "electronics" | "food" | "home";
  websiteType: "ECOMMERCE";
  defaultTheme: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    mutedColor: string;
    fontFamilyHeading: string;
    fontFamilyBody: string;
    cornerRadius: "none" | "small" | "medium" | "large";
  };
  defaultSettings: Record<string, unknown>;
}

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    slug: "modern",
    name: "Modern Store",
    description:
      "Clean, contemporary design with bold typography and crisp product cards. Works for any product category.",
    thumbnail:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
    category: "general",
    websiteType: "ECOMMERCE",
    defaultTheme: {
      primaryColor: "#0f172a",
      accentColor: "#1d4ed8",
      backgroundColor: "#ffffff",
      textColor: "#0f172a",
      mutedColor: "#64748b",
      fontFamilyHeading: "'Inter', system-ui, sans-serif",
      fontFamilyBody: "'Inter', system-ui, sans-serif",
      cornerRadius: "medium",
    },
    defaultSettings: {
      hero: {
        headline: "Welcome to your store",
        subtext:
          "Discover products curated for quality and value. Free delivery on orders over ৳1500.",
        buttonText: "Shop Now",
        buttonUrl: "/products",
      },
      announcement: {
        enabled: true,
        message: "Free delivery on orders over ৳1500",
      },
    },
  },
  {
    slug: "boutique",
    name: "Boutique Fashion",
    description:
      "Elegant editorial design tailored to fashion, jewellery, and lifestyle stores. Big imagery, refined typography.",
    thumbnail:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop",
    category: "fashion",
    websiteType: "ECOMMERCE",
    defaultTheme: {
      primaryColor: "#1c1917",
      accentColor: "#b45309",
      backgroundColor: "#fafaf9",
      textColor: "#1c1917",
      mutedColor: "#78716c",
      fontFamilyHeading: "'Playfair Display', Georgia, serif",
      fontFamilyBody: "'Inter', system-ui, sans-serif",
      cornerRadius: "small",
    },
    defaultSettings: {
      hero: {
        headline: "New season, timeless style",
        subtext:
          "Hand-picked pieces for the modern wardrobe. Thoughtfully made, beautifully delivered.",
        buttonText: "Shop the Collection",
        buttonUrl: "/products",
      },
      announcement: {
        enabled: true,
        message: "Free shipping on orders over ৳2000",
      },
    },
  },
  {
    slug: "tech-store",
    name: "Tech Store",
    description:
      "High-contrast dark theme built for electronics, gadgets, and SaaS hardware. Spec-rich product cards.",
    thumbnail:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
    category: "electronics",
    websiteType: "ECOMMERCE",
    defaultTheme: {
      primaryColor: "#0a0a0a",
      accentColor: "#22d3ee",
      backgroundColor: "#0a0a0a",
      textColor: "#f5f5f5",
      mutedColor: "#a3a3a3",
      fontFamilyHeading: "'Inter', system-ui, sans-serif",
      fontFamilyBody: "'Inter', system-ui, sans-serif",
      cornerRadius: "large",
    },
    defaultSettings: {
      hero: {
        headline: "Tech that performs.",
        subtext:
          "The latest electronics, vetted, supported, and shipped fast. Backed by a 30-day return policy.",
        buttonText: "Browse Products",
        buttonUrl: "/products",
      },
      announcement: {
        enabled: true,
        message: "30-day money-back guarantee on every order",
      },
    },
  },
  {
    slug: "aurora",
    name: "Aurora",
    description:
      "Cinematic full-bleed hero with optional background video, animated gradient mesh, and motion-rich product reveals. Built for fashion, beauty, and lifestyle brands that want to make an impression.",
    thumbnail:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop",
    category: "fashion",
    websiteType: "ECOMMERCE",
    defaultTheme: {
      primaryColor: "#0f0f10",
      accentColor: "#f97316",
      backgroundColor: "#fafafa",
      textColor: "#0f0f10",
      mutedColor: "#737373",
      fontFamilyHeading: "'Inter', system-ui, sans-serif",
      fontFamilyBody: "'Inter', system-ui, sans-serif",
      cornerRadius: "large",
    },
    defaultSettings: {
      hero: {
        headline: "Made to move.",
        subtext:
          "Designed in studio, finished by hand. Every piece is built to last and delivered with care.",
        buttonText: "Shop the new drop",
        buttonUrl: "/products",
        secondaryButtonText: "Watch the film",
        secondaryButtonUrl: "/products?featured=1",
        overlayOpacity: 50,
      },
      announcement: {
        enabled: true,
        message: "Free express delivery on orders over ৳2500",
      },
    },
  },
];

const BUILTIN_BY_SLUG: Record<string, BuiltinTemplate> = Object.fromEntries(
  BUILTIN_TEMPLATES.map((t) => [t.slug, t]),
);

/** Default fallback when a store has no templateId or it doesn't resolve. */
export const DEFAULT_TEMPLATE_SLUG: BuiltinTemplateSlug = "modern";

export function getBuiltinTemplate(slug: string | null | undefined): BuiltinTemplate {
  if (slug && BUILTIN_BY_SLUG[slug]) return BUILTIN_BY_SLUG[slug];
  return BUILTIN_BY_SLUG[DEFAULT_TEMPLATE_SLUG];
}

export function isBuiltinSlug(value: string | null | undefined): value is BuiltinTemplateSlug {
  return Boolean(value) && Boolean(BUILTIN_BY_SLUG[value as string]);
}

/**
 * Given whatever templateId is stored on `Store.templateId`, resolve it to
 * one of our builtin slugs. Accepts:
 *   - a builtin slug ("modern" / "boutique" / "tech-store")
 *   - a Template DB row cuid: looked up by the caller's data layer; if the
 *     caller passes the slug from that row through here, this works for any
 *     Template that was uploaded with a slug matching one of the builtins.
 *   - anything else falls back to "modern" so the storefront still renders.
 */
export function resolveTemplateSlug(value: string | null | undefined): BuiltinTemplateSlug {
  if (isBuiltinSlug(value)) return value;
  return DEFAULT_TEMPLATE_SLUG;
}
