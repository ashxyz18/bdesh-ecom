# Architecture Plan: Template-Driven E-Commerce Store Frontend

## Problem Statement

The current website builder generates **static HTML pages** with basic sections (hero, products, about, contact). These are not real e-commerce websites — they lack shopping cart, checkout, product filtering, user accounts, and order management.

The user wants a **Shopify-like platform** where:
- **Backend** (products, orders, payments, users) is managed by the mother website (bdesh-ecom)
- **Frontend** (the store's visual design) is controlled by the customer via template selection
- When a customer picks a template (e.g., "Roseo"), their store instantly looks like a premium e-commerce website
- The builder should be **simpler** — customers just pick a template and customize basic info

## Current Architecture

```
/builder     → Generates static HTML (basic sections, no e-commerce)
/shop        → Hardcoded SHOP.CO demo store (not template-driven)
/store       → Subdomain-based store (very basic, no template support)
/dashboard   → Merchant admin (products, orders, settings)
```

### Key Issues
1. **Builder templates are static HTML** — no cart, checkout, filtering, or real e-commerce
2. **Store frontend is single-design** — all stores look the same regardless of template choice
3. **Builder flow is too complex** — onboarding wizard → template → customize → export (4 steps)
4. **No connection between builder and live store** — picking a template in the builder doesn't affect the actual store

## Proposed Architecture

### Core Concept: Template-Driven Store Frontend

The store frontend becomes a **React component** that renders differently based on the selected template. The template controls visual design; the backend data comes from the mother website.

```
Customer picks "Roseo" template
        ↓
Store.theme = { templateId: "roseo", primaryColor: "#8B4513", ... }
        ↓
/store/[subdomain] reads templateId from store.theme
        ↓
Renders RoseoStoreFront component with store's products/collections/orders
        ↓
Full e-commerce experience: browse → cart → checkout → order
```

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│                   MOTHER WEBSITE                     │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Database │  │   APIs   │  │  Auth/Payments    │  │
│  │ (SQLite) │  │ (Next.js)│  │  (bKash/COD)     │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │              │                 │             │
│  ┌────▼──────────────▼─────────────────▼──────────┐ │
│  │          Template-Driven Store Frontend          │ │
│  │                                                  │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │ │
│  │  │  Roseo  │  │ Clothing│  │  Default/Basic  │ │ │
│  │  │ Template│  │ Template│  │    Template     │ │ │
│  │  └─────────┘  └─────────┘  └─────────────────┘ │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Store Theme Schema

The existing `Store.theme` JSON field will store template configuration:

```json
{
  "templateId": "roseo",
  "primaryColor": "#8B4513",
  "secondaryColor": "#D4A574",
  "fontHeading": "'Playfair Display', serif",
  "fontBody": "'Inter', sans-serif",
  "layout": "default",
  "customization": {
    "heroTitle": "Crafted for Timeless Elegance",
    "heroSubtitle": "Handcrafted premium leather bags...",
    "announcementText": "Free shipping on orders over $100",
    "showFeatures": true,
    "showTestimonials": true,
    "showBrandMarquee": true,
    "features": [
      { "icon": "shield", "title": "2-Year Warranty", "desc": "Premium craftsmanship guaranteed" },
      { "icon": "truck", "title": "Free Shipping", "desc": "On orders over $100" },
      { "icon": "refresh", "title": "30-Day Returns", "desc": "Hassle-free returns" }
    ]
  }
}
```

## File Structure

### New: Store Template Components

```
apps/web/lib/store-templates/
  types.ts                          # Shared props interface for all templates
  registry.tsx                      # Template registry (maps ID → component)
  default/
    DefaultStoreFront.tsx            # Current basic store (fallback)
  roseo/
    RoseoStoreFront.tsx              # Main Roseo layout wrapper
    components/
      Navbar.tsx                     # Premium nav with categories dropdown
      HeroSection.tsx                # Dark elegant hero with parallax
      ProductGrid.tsx                # Product grid with filtering/sorting
      ProductCard.tsx                # Card with hover effects, quick view
      Features.tsx                   # 3 feature cards (warranty, shipping, returns)
      Testimonials.tsx               # Customer reviews
      Footer.tsx                     # Dark footer with links
      CartDrawer.tsx                 # Slide-in cart with checkout
      QuickViewModal.tsx             # Product quick view popup
      AnnouncementBar.tsx            # Top announcement bar
  clothing/
    ClothingStoreFront.tsx            # Clothing template store frontend
    components/
      ...
```

### Modified: Store Page Router

```
apps/web/app/store/[[...path]]/
  page.tsx                          # Modified: reads templateId, renders correct template
  StoreFront.tsx                    # DELETED (replaced by template system)
```

### Modified: Builder

```
apps/web/app/builder/
  page.tsx                          # Simplified: template-first, skip onboarding
apps/web/lib/builder/
  templates/RoseoTemplate.tsx        # Builder preview template (static HTML for preview)
```

## Implementation Plan

### Phase 1: Store Template Infrastructure

#### 1.1 Create `apps/web/lib/store-templates/types.ts`
```ts
export interface StoreTemplateProps {
  store: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    description: string | null;
    logo: string | null;
    banner: string | null;
    theme: StoreTheme;
    settings: StoreSettings;
    products: StoreProduct[];
    collections: StoreCollection[];
  };
}

export interface StoreTheme {
  templateId: string;
  primaryColor: string;
  secondaryColor: string;
  fontHeading?: string;
  fontBody?: string;
  customization?: Record<string, any>;
}

export interface StoreSettings {
  whatsapp?: string;
  phone?: string;
  address?: string;
  hours?: string;
  currency?: string;
  [key: string]: any;
}

export interface StoreProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  images: string[];
  featured: boolean;
  status: string;
  attributes?: Record<string, any>;
}

export interface StoreCollection {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}
```

#### 1.2 Create `apps/web/lib/store-templates/registry.tsx`
```tsx
import dynamic from 'next/dynamic';

const templates: Record<string, React.ComponentType<StoreTemplateProps>> = {
  default: dynamic(() => import('./default/DefaultStoreFront')),
  roseo: dynamic(() => import('./roseo/RoseoStoreFront')),
  clothing: dynamic(() => import('./clothing/ClothingStoreFront')),
};

export function getStoreTemplate(templateId: string) {
  return templates[templateId] || templates.default;
}
```

#### 1.3 Modify `apps/web/app/store/[[...path]]/page.tsx`
- Read `templateId` from parsed `store.theme`
- Use `getStoreTemplate(templateId)` to get the right component
- Pass store data as props

### Phase 2: Roseo Store Template

#### 2.1 Create `RoseoStoreFront.tsx`
The main layout component that assembles all Roseo sub-components:
- AnnouncementBar (top)
- Navbar (sticky, with category dropdowns)
- Hero section (dark, elegant, parallax)
- Features section (3 cards)
- Product grid (with filtering, sorting, pagination)
- Testimonials
- Footer
- Cart drawer (slide-in)
- Quick view modal

#### 2.2 Create Roseo Sub-Components
Based on the roseo-ecommerce reference project at `C:\Users\dell\Desktop\roseo-ecommerce`:

| Component | Reference | Key Features |
|-----------|-----------|-------------|
| `Navbar.tsx` | `Navbar.jsx` | Categories dropdown (Men, Women, Fragrances, Backpacks), search, cart icon, mobile menu |
| `HeroSection.tsx` | `Hero.jsx` | Dark gradient bg, parallax mouse effect, "Crafted for Timeless Elegance", feature badges |
| `ProductGrid.tsx` | `ProductGrid.jsx` | Category tabs, sorting, pagination, grid/list view |
| `ProductCard.tsx` | `ProductCard.jsx` | Hover effects, wishlist heart, quick view, add to cart, badge (New/Sale) |
| `Features.tsx` | `Features.jsx` | 6 feature cards with icons + stats section |
| `Testimonials.tsx` | `Testimonials.jsx` | Customer reviews with ratings |
| `CartDrawer.tsx` | N/A | Slide-in cart with quantity controls, checkout button |
| `QuickViewModal.tsx` | `QuickViewModal.jsx` | Product detail popup with color/size selection |
| `AnnouncementBar.tsx` | `AnnouncementBar.jsx` | Dismissible top bar with promo text |
| `Footer.tsx` | N/A | Dark footer with store info, links, social |

#### 2.3 Design Tokens for Roseo
```ts
const roseoTheme = {
  colors: {
    primary: '#8B4513',      // Saddle brown
    secondary: '#D4A574',    // Light tan
    accent: '#C8956C',       // Warm gold
    dark: '#1A1A1A',          // Near black
    darker: '#111111',        // Darker black
    light: '#F5F0EB',         // Warm white
    text: '#333333',          // Dark text
    textLight: '#999999',     // Light text
  },
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Inter', sans-serif",
  },
  borderRadius: {
    card: '16px',
    button: '50px',
    input: '8px',
  },
};
```

### Phase 3: Builder Simplification

#### 3.1 Simplify Builder Flow
Current: `onboarding → template → customize → export` (4 steps)
New: `template → customize → publish` (3 steps, skip onboarding)

Changes to `apps/web/app/builder/page.tsx`:
- Change initial step from `'onboarding'` to `'template'`
- When template is selected, auto-populate form data with template defaults
- Remove onboarding wizard or make it optional
- Add "Publish" button that saves to database and activates the store

#### 3.2 Auto-Populate Template Defaults
When a user selects the Roseo template:
```ts
const roseoDefaults = {
  name: 'ROSEO',
  tagline: 'Crafted for Timeless Elegance',
  primaryColor: '#8B4513',
  sections: ['hero', 'features', 'products', 'about', 'testimonials', 'contact'],
  services: [
    { name: 'Classic Leather Backpack', price: '180' },
    { name: 'Premium Leather Tote Bag', price: '150' },
    { name: 'Men\'s Leather Messenger', price: '165' },
    { name: 'Women\'s Leather Crossbody', price: '140' },
    { name: 'Vintage Leather Satchel', price: '195' },
    { name: 'Leather Duffle Bag', price: '210' },
  ],
};
```

#### 3.3 Create RoseoTemplate.tsx for Builder Preview
This is the static HTML preview used in the builder's live preview panel. It follows the same pattern as `ClothingTemplate.tsx` but with the Roseo design aesthetic.

### Phase 4: Store Settings Page Enhancement

#### 4.1 Add Template Selection to Settings
In `apps/web/app/dashboard/settings/page.tsx`:
- Add template picker section
- When template changes, update `store.theme.templateId`
- Show preview of selected template

#### 4.2 Add Theme Customization
- Primary/secondary color pickers
- Font selection
- Toggle sections on/off
- Custom hero text

## Files to Create/Modify

### New Files (8 files)
1. `apps/web/lib/store-templates/types.ts` — Shared type definitions
2. `apps/web/lib/store-templates/registry.tsx` — Template component registry
3. `apps/web/lib/store-templates/default/DefaultStoreFront.tsx` — Current basic store (extracted)
4. `apps/web/lib/store-templates/roseo/RoseoStoreFront.tsx` — Main Roseo layout
5. `apps/web/lib/store-templates/roseo/components/Navbar.tsx` — Premium navigation
6. `apps/web/lib/store-templates/roseo/components/HeroSection.tsx` — Dark elegant hero
7. `apps/web/lib/store-templates/roseo/components/ProductGrid.tsx` — Product catalog with filters
8. `apps/web/lib/store-templates/roseo/components/ProductCard.tsx` — Product card with hover effects

### Modified Files (6 files)
1. `apps/web/app/store/[[...path]]/page.tsx` — Use template registry instead of hardcoded StoreFront
2. `apps/web/app/builder/page.tsx` — Simplify flow, template-first
3. `apps/web/lib/builder/templates/RoseoTemplate.tsx` — Fill in builder preview template
4. `apps/web/lib/builder/data/templates.ts` — Add roseo template entry
5. `apps/web/lib/builder/utils/exportHtml.ts` — Register roseo HTML generator
6. `apps/web/lib/builder/components/TemplateRenderer.tsx` — Register roseo preview component

## Key Design Decisions

### Why React Components Instead of Static HTML?
- **Interactivity**: Cart, filters, quick view, checkout require client-side state
- **Real-time data**: Products come from the database, not hardcoded
- **SEO**: Next.js server components render on the server for SEO
- **Maintainability**: One codebase, template switching via props

### Why Template Registry Pattern?
- **Extensibility**: Adding a new template = adding a new folder + registry entry
- **Code splitting**: `dynamic()` imports mean only the selected template loads
- **Type safety**: All templates share the same `StoreTemplateProps` interface

### Why Keep Builder Templates (Static HTML)?
- The builder preview panel needs a quick preview — static HTML is fine for that
- The builder's "Export HTML" feature still generates standalone pages
- But the **live store** uses React components, not the static HTML

## Priority Order

1. **Store template infrastructure** (types, registry, page.tsx modification) — enables everything else
2. **Roseo store template** — the first premium template, proves the concept
3. **Builder simplification** — better UX for customers
4. **Roseo builder preview template** — so the builder preview matches the live store
5. **Settings page template picker** — let merchants change templates after creation
