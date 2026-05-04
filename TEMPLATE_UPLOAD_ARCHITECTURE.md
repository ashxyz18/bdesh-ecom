# Template Upload System — Architecture Plan

## Problem Statement

Currently, all 5 templates (Default, Roseo, Minimal, Shopnest, Food) are **hardcoded React components** compiled at build time. Adding a new template requires:
1. Writing a full React component (~1500 lines)
2. Adding it to `registry.tsx`
3. Rebuilding and redeploying the entire app

The user needs a **template upload system** where new full-scale website templates can be added dynamically without code changes.

---

## Architecture Decision: Config-Driven Template Engine

### Why Not Upload React Code?
Uploading arbitrary React/JSX code and executing it at runtime is:
- **Security risk** — arbitrary code execution (XSS, server access)
- **Not supported** by Next.js — can't dynamically import non-bundled React components
- **Unmaintainable** — no type safety, no linting, no build validation

### Why Config-Driven?
Like Shopify themes, WordPress templates, and Wix sites — templates are **JSON configurations** that compose pre-built, themeable sections. A powerful rendering engine interprets the config and produces diverse, professional designs.

**Key Insight**: Our 5 existing templates already share the same structural sections (hero, products, features, etc.). They differ in:
- Color schemes & typography
- Layout choices (grid vs carousel, columns, spacing)
- Section ordering & visibility
- Visual style (rounded vs sharp, shadows vs flat)
- Feature toggles (wishlist, reviews, recently viewed)

We capture **90%+ of design variation** through configuration. The remaining gap is closed with custom CSS support.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TEMPLATE SYSTEM                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Built-in      │  │ Uploaded     │  │ Template     │      │
│  │ Templates     │  │ Templates    │  │ Builder      │      │
│  │ (React code)  │  │ (DB config)  │  │ (Dashboard)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                       │
│                   │ Template Engine  │                       │
│                   │ (Config Renderer)│                       │
│                   └────────┬────────┘                       │
│                            │                                 │
│              ┌─────────────┼─────────────┐                   │
│              │             │             │                   │
│        ┌─────▼────┐ ┌─────▼────┐ ┌─────▼────┐              │
│        │Storefront│ │ Preview  │ │Landing   │              │
│        │Renderer   │ │Renderer  │ │Page      │              │
│        └──────────┘ └──────────┘ └──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### New `Template` Model

```prisma
model Template {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  thumbnail   String?   // URL to preview screenshot
  config      String    // JSON: full template configuration (see schema below)
  category    String    @default("general") // general, fashion, food, electronics, salon, etc.
  isPremium   Boolean   @default(false)
  isPublic    Boolean   @default(true)      // visible in marketplace
  isBuiltIn   Boolean   @default(false)     // system template (not deletable)
  uploadedBy  String?   // userId (null = system)
  downloads   Int       @default(0)
  version     String    @default("1.0.0")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  uploader User? @relation(fields: [uploadedBy], references: [id], onDelete: SetNull)

  @@map("templates")
}
```

### Migration for Store table
The `Store.theme` JSON field already contains `templateId`. This will now reference either a built-in ID (`default`, `roseo`, etc.) or a database template `slug`.

---

## Template Config Schema

```typescript
interface TemplateConfig {
  // ─── Identity ───
  id: string                          // unique slug
  name: string
  tagline: string
  description: string
  version: string
  category: string                    // general | fashion | food | electronics | salon | portfolio
  isPremium: boolean

  // ─── Colors ───
  colors: {
    primary: string                   // hex
    secondary: string                 // hex
    accent: string                    // hex
    background: string                // hex — main bg
    surface: string                   // hex — card/section bg
    text: string                      // hex — primary text
    textMuted: string                 // hex — secondary text
    border: string                    // hex — borders
    success: string                   // hex
    error: string                     // hex
  }

  // ─── Typography ───
  typography: {
    headingFont: string               // Google Font name
    bodyFont: string                  // Google Font name
    headingWeight: string             // 400-900
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  }

  // ─── Layout ───
  layout: {
    maxWidth: string                  // Tailwind max-w-* class
    sectionSpacing: 'compact' | 'normal' | 'spacious'
    cardStyle: 'flat' | 'bordered' | 'shadowed' | 'elevated'
    productColumns: 2 | 3 | 4
  }

  // ─── Navbar ───
  navbar: {
    style: 'sticky-white' | 'sticky-blur' | 'sticky-dark' | 'transparent'
    showSearch: boolean
    showWishlist: boolean
    showUserMenu: boolean
    layout: 'centered' | 'left-aligned'
    announcementBar?: {
      message: string
      bgColor?: string
      textColor?: string
    }
  }

  // ─── Footer ───
  footer: {
    style: 'dark' | 'light' | 'minimal'
    showNewsletter: boolean
    showSocial: boolean
    columns: 2 | 3 | 4
  }

  // ─── Home Page Sections ───
  homePage: {
    sections: HomeSectionConfig[]
  }

  // ─── Product Page ───
  productPage: {
    imageLayout: 'stacked' | 'grid' | 'sidebar'
    showReviews: boolean
    showRecentlyViewed: boolean
    showRelatedProducts: boolean
    showWishlist: boolean
    showFeatures: boolean
    features?: FeatureItem[]
  }

  // ─── Collection Page ───
  collectionPage: {
    showFilters: boolean
    gridColumns: 2 | 3 | 4
    cardStyle: 'standard' | 'overlay' | 'minimal'
  }

  // ─── Custom CSS ───
  customCss?: string                  // Optional custom styles
}

// ─── Section Types ───
type HomeSectionConfig =
  | { type: 'announcement'; props: AnnouncementProps }
  | { type: 'hero'; props: HeroProps }
  | { type: 'collections'; props: CollectionsProps }
  | { type: 'featuredProducts'; props: FeaturedProductsProps }
  | { type: 'features'; props: FeaturesProps }
  | { type: 'products'; props: ProductsProps }
  | { type: 'testimonials'; props: TestimonialsProps }
  | { type: 'newsletter'; props: NewsletterProps }
  | { type: 'recentlyViewed'; props: RecentlyViewedProps }
  | { type: 'stats'; props: StatsProps }
  | { type: 'cta'; props: CtaProps }
  | { type: 'spacer'; props: { height: 'sm' | 'md' | 'lg' } }

interface HeroProps {
  style: 'centered' | 'split' | 'fullwidth' | 'minimal'
  title?: string                      // defaults to store name
  subtitle?: string                   // defaults to store description
  ctaText?: string
  ctaLink?: string
  showStats?: boolean
  stats?: { label: string; value: string }[]
  showFeatures?: boolean
  features?: { icon: string; title: string; description: string }[]
  backgroundImage?: boolean           // use store banner
  overlay?: boolean
  minHeight?: string                  // Tailwind class
}

interface CollectionsProps {
  layout: 'grid' | 'carousel' | 'list'
  columns?: number
  showAll?: boolean
  title?: string
  limit?: number
}

interface FeaturedProductsProps {
  layout: 'grid' | 'carousel'
  columns?: number
  limit: number
  title?: string
  showQuickAdd?: boolean
}

interface FeaturesProps {
  layout: 'grid' | 'cards' | 'icons'
  items: { icon: string; title: string; description: string }[]
  style?: 'default' | 'colored' | 'minimal'
}

interface ProductsProps {
  layout: 'grid'
  columns: number
  showFilters: boolean
  showSearch: boolean
  title?: string
}

interface TestimonialsProps {
  style: 'cards' | 'carousel' | 'minimal'
  limit?: number
}

interface NewsletterProps {
  title: string
  subtitle: string
  style: 'inline' | 'card' | 'fullwidth'
}

interface RecentlyViewedProps {
  title?: string
}

interface StatsProps {
  items: { label: string; value: string }[]
  style?: 'simple' | 'animated'
}

interface CtaProps {
  title: string
  subtitle?: string
  buttonText: string
  buttonLink?: string
  style: 'centered' | 'split' | 'banner'
}

interface AnnouncementProps {
  message: string
  bgColor?: string
  textColor?: string
}

interface FeatureItem {
  icon: string                        // lucide icon name
  title: string
  description: string
}
```

---

## Template Engine Architecture

### File Structure

```
apps/web/lib/store-templates/
├── registry.tsx                      # Updated: loads both built-in + DB templates
├── types.ts                          # Updated: adds TemplateConfig types
├── engine/                           # NEW: Config-driven template engine
│   ├── ConfigTemplate.tsx            # Main renderer component
│   ├── sections/                     # Section components
│   │   ├── AnnouncementSection.tsx
│   │   ├── HeroSection.tsx
│   │   ├── CollectionsSection.tsx
│   │   ├── FeaturedProductsSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── ProductsSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── NewsletterSection.tsx
│   │   ├── RecentlyViewedSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── CtaSection.tsx
│   │   └── SpacerSection.tsx
│   ├── pages/                        # Full page renderers
│   │   ├── ConfigHomePage.tsx
│   │   ├── ConfigProductPage.tsx
│   │   ├── ConfigCollectionPage.tsx
│   │   ├── ConfigCartPage.tsx
│   │   ├── ConfigCheckoutPage.tsx
│   │   ├── ConfigAuthPages.tsx       # Login, Register, Account
│   │   ├── ConfigWishlistPage.tsx
│   │   └── ConfigSearchPage.tsx
│   ├── components/                   # Shared engine components
│   │   ├── ConfigNavbar.tsx
│   │   ├── ConfigFooter.tsx
│   │   ├── ConfigProductCard.tsx
│   │   ├── ConfigStarRating.tsx
│   │   └── ScrollToTop.tsx
│   └── hooks/
│       └── useTemplateTheme.ts       # Resolves colors/typography to Tailwind
├── shared/                           # Existing shared code
├── default/                          # Existing built-in templates (unchanged)
├── roseo/
├── shopify/
├── shopnest/
└── food/
```

### Rendering Flow

```
1. Store page loads → fetch store.theme.templateId
2. Check if templateId matches a built-in template (default, roseo, etc.)
   → YES: Load hardcoded React component (existing flow)
   → NO: Fetch template config from DB via API
3. ConfigTemplate renderer:
   a. Parse TemplateConfig JSON
   b. Apply color scheme via CSS variables
   c. Render Navbar (config-driven)
   d. Render page sections based on route + config
   e. Render Footer (config-driven)
```

### CSS Variable System

The engine injects CSS variables from the template config, allowing all sections to be themeable:

```css
:root {
  --tpl-primary: {{colors.primary}};
  --tpl-secondary: {{colors.secondary}};
  --tpl-accent: {{colors.accent}};
  --tpl-bg: {{colors.background}};
  --tpl-surface: {{colors.surface}};
  --tpl-text: {{colors.text}};
  --tpl-text-muted: {{colors.textMuted}};
  --tpl-border: {{colors.border}};
  --tpl-radius: {{typography.borderRadius}};
}
```

Sections use these variables: `bg-[var(--tpl-primary)]`, `text-[var(--tpl-text)]`, etc.

---

## API Routes

### Template CRUD

```
GET    /api/templates                  # List all public templates
GET    /api/templates/[templateId]     # Get template config
POST   /api/templates                  # Upload new template (admin/merchant)
PATCH  /api/templates/[templateId]     # Update template
DELETE /api/templates/[templateId]      # Delete template
POST   /api/templates/[templateId]/thumbnail  # Upload thumbnail image
```

### Template Upload Flow

```
1. User fills template metadata (name, description, category)
2. User uploads thumbnail image
3. User either:
   a. Uploads a JSON config file, OR
   b. Uses the Template Builder UI to configure sections visually
4. System validates the config against the schema
5. System stores template in DB
6. Template immediately available for selection
```

---

## Dashboard UI

### New Pages

```
/dashboard/templates                  # Template gallery (browse, preview, install)
/dashboard/templates/upload           # Upload new template (JSON + thumbnail)
/dashboard/templates/builder          # Visual template builder
/dashboard/templates/[id]/edit        # Edit template config
```

### Template Builder UI

A visual drag-and-drop interface where users can:
1. **Choose sections** from a palette (hero, products, features, etc.)
2. **Reorder sections** via drag-and-drop
3. **Configure each section** via a sidebar panel (colors, text, layout)
4. **Preview live** as they build
5. **Save as template** for reuse

### Template Gallery

A marketplace-style page showing:
- Built-in templates (with "Built-in" badge)
- Uploaded templates (with "Custom" badge)
- Category filters
- Preview buttons
- Install/Apply buttons
- Upload new template CTA

---

## Implementation Plan (Phased)

### Phase 1: Core Engine + DB Schema
**Files to create/modify:**
1. `packages/database/prisma/schema.prisma` — Add `Template` model
2. `apps/web/lib/store-templates/types.ts` — Add `TemplateConfig` types
3. `apps/web/lib/store-templates/engine/ConfigTemplate.tsx` — Main renderer
4. `apps/web/lib/store-templates/engine/hooks/useTemplateTheme.ts` — Theme resolver
5. `apps/web/lib/store-templates/engine/components/ConfigNavbar.tsx`
6. `apps/web/lib/store-templates/engine/components/ConfigFooter.tsx`
7. `apps/web/lib/store-templates/engine/components/ConfigProductCard.tsx`
8. `apps/web/lib/store-templates/engine/components/ConfigStarRating.tsx`
9. `apps/web/lib/store-templates/engine/sections/` — All 11 section components
10. `apps/web/lib/store-templates/engine/pages/` — All page renderers

### Phase 2: API + Upload
1. `apps/web/app/api/templates/route.ts` — List + Create
2. `apps/web/app/api/templates/[templateId]/route.ts` — Get + Update + Delete
3. `apps/web/app/api/templates/[templateId]/thumbnail/route.ts` — Image upload
4. Config validation utility

### Phase 3: Dashboard UI
1. `apps/web/app/dashboard/templates/page.tsx` — Template gallery
2. `apps/web/app/dashboard/templates/upload/page.tsx` — Upload form
3. `apps/web/app/dashboard/templates/builder/page.tsx` — Visual builder
4. Update `apps/web/app/dashboard/new-store/page.tsx` — Include uploaded templates
5. Update `apps/web/app/dashboard/settings/page.tsx` — Include uploaded templates

### Phase 4: Integration + Landing Page
1. Update `apps/web/lib/store-templates/registry.tsx` — Hybrid resolution
2. Update `apps/web/app/store/[[...path]]/page.tsx` — Support DB templates
3. Update `apps/web/app/preview/[templateId]/page.tsx` — Support DB templates
4. Update `apps/web/app/page.tsx` — Show uploaded templates on landing
5. Seed existing 5 templates as DB records (for consistency)

---

## Security Considerations

1. **Config validation** — Strict JSON schema validation before storing
2. **No code execution** — Config-driven only, never execute uploaded code
3. **Custom CSS sanitization** — Strip `javascript:`, `expression()`, `@import` from custom CSS
4. **Rate limiting** — Template upload rate-limited to prevent abuse
5. **Authorization** — Only ADMIN or template owner can edit/delete
6. **File upload** — Thumbnail images validated (type, size ≤ 2MB, dimensions)

---

## Example: Minimal Template Config

```json
{
  "id": "minimal-dark",
  "name": "Minimal Dark",
  "tagline": "Sleek & Modern",
  "description": "A dark minimal template for tech and electronics stores",
  "version": "1.0.0",
  "category": "electronics",
  "isPremium": false,
  "colors": {
    "primary": "#6366f1",
    "secondary": "#818cf8",
    "accent": "#312e81",
    "background": "#0f0f23",
    "surface": "#1e1e3f",
    "text": "#e2e8f0",
    "textMuted": "#94a3b8",
    "border": "#334155",
    "success": "#22c55e",
    "error": "#ef4444"
  },
  "typography": {
    "headingFont": "Inter",
    "bodyFont": "Inter",
    "headingWeight": "700",
    "borderRadius": "xl"
  },
  "layout": {
    "maxWidth": "7xl",
    "sectionSpacing": "normal",
    "cardStyle": "bordered",
    "productColumns": 4
  },
  "navbar": {
    "style": "sticky-dark",
    "showSearch": true,
    "showWishlist": true,
    "showUserMenu": true,
    "layout": "left-aligned",
    "announcementBar": {
      "message": "Free shipping on orders over ৳5000",
      "bgColor": "#6366f1",
      "textColor": "#ffffff"
    }
  },
  "footer": {
    "style": "dark",
    "showNewsletter": true,
    "showSocial": true,
    "columns": 4
  },
  "homePage": {
    "sections": [
      { "type": "hero", "props": { "style": "centered", "showStats": true, "showFeatures": true, "features": [
        { "icon": "Truck", "title": "Fast Delivery", "description": "Nationwide shipping" },
        { "icon": "ShieldCheck", "title": "Secure Payment", "description": "bKash & Nagad" },
        { "icon": "RefreshCcw", "title": "Easy Returns", "description": "7-day return policy" }
      ]}},
      { "type": "collections", "props": { "layout": "grid", "columns": 4, "title": "Shop by Category" }},
      { "type": "featuredProducts", "props": { "layout": "grid", "columns": 4, "limit": 8, "title": "Featured Products", "showQuickAdd": true }},
      { "type": "features", "props": { "layout": "grid", "items": [
        { "icon": "Headphones", "title": "24/7 Support", "description": "Always here to help" },
        { "icon": "CreditCard", "title": "Secure Payments", "description": "SSL encrypted checkout" },
        { "icon": "Package", "title": "Fast Shipping", "description": "Delivered in 2-3 days" }
      ]}},
      { "type": "products", "props": { "layout": "grid", "columns": 4, "showFilters": true, "showSearch": true, "title": "All Products" }},
      { "type": "newsletter", "props": { "title": "Stay Updated", "subtitle": "Get the latest deals", "style": "fullwidth" }},
      { "type": "recentlyViewed", "props": {} }
    ]
  },
  "productPage": {
    "imageLayout": "grid",
    "showReviews": true,
    "showRecentlyViewed": true,
    "showRelatedProducts": true,
    "showWishlist": true,
    "showFeatures": true,
    "features": [
      { "icon": "Truck", "title": "Free Shipping", "description": "On orders over ৳1000" },
      { "icon": "ShieldCheck", "title": "Genuine Products", "description": "100% authentic" },
      { "icon": "RefreshCcw", "title": "Easy Returns", "description": "7-day return policy" }
    ]
  },
  "collectionPage": {
    "showFilters": true,
    "gridColumns": 4,
    "cardStyle": "standard"
  }
}
```

---

## Backward Compatibility

- **Built-in templates** (Default, Roseo, Minimal, Shopnest, Food) remain as hardcoded React components — zero changes to their code
- The `registry.tsx` resolves template IDs: built-in → React component, custom → ConfigTemplate engine
- `Store.theme.templateId` works for both built-in slugs and DB template slugs
- Existing stores continue working without any migration
- Landing page, new-store flow, and settings page are updated to show both built-in + uploaded templates

---

## Estimated Effort

| Phase | Description | Files | Effort |
|-------|-------------|-------|--------|
| 1 | Core Engine + DB Schema | ~20 files | 3-4 days |
| 2 | API + Upload | ~4 files | 1 day |
| 3 | Dashboard UI | ~5 files | 2-3 days |
| 4 | Integration + Landing | ~5 files | 1-2 days |
| **Total** | | **~34 files** | **7-10 days** |
