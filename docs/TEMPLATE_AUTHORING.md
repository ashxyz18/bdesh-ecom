# Template authoring guide

This platform supports **two kinds of storefront templates**. Pick the path that matches your skill level and goals — both are first-class.

| | **React templates** (recommended) | **ZIP templates** (legacy / external) |
|---|---|---|
| Where it lives | `frontend/web/components/storefront/templates/<slug>/` | `frontend/web/public/templates/<slug>/` |
| Built with | TypeScript + React server components | Any framework — uploaded as a built `dist/` |
| Pulls products from | The platform's database directly (zero glue code) | `/api/adapters/<slug>/...` (you have to wire this up) |
| Cart / PDP / checkout | Inherited from the platform — you only build the homepage | You ship your own (or we serve a fallback iframe) |
| Best for | Fast iteration, motion, video, custom dashboards | Bringing in a designer-built site you've already paid for |

If you have a designer-built `dist/` ZIP, use **ZIP templates**. If you're starting fresh and want the cleanest, fastest result, use **React templates**.

---

## How the storefront engine resolves a template

When a customer visits a storefront, the engine looks at `Store.templateId` and classifies it:

1. **builtin slug** (`"modern" | "boutique" | "tech-store" | "aurora"`) → renders a React component from `components/storefront/templates/`.
2. **filesystem slug** (matches a folder under `public/templates/`) → renders the legacy `/api/templates/serve` iframe.
3. **DB cuid** of an uploaded `Template` row → looked up, then resolved like (1) or (2).
4. **anything else** → falls back to the Modern template so the storefront never goes dark.

The classifier lives at [`lib/storefront/templateKind.ts`](../frontend/web/lib/storefront/templateKind.ts).

---

# Path A — React templates (recommended)

A React template is a single server component that takes a `StorefrontData` prop. The platform handles cart, product pages, checkout, theming, and the dashboard — you only have to render the home page.

## 1. Anatomy

Create one folder per template under `components/storefront/templates/<slug>/`:

```
components/storefront/templates/aurora/
└── AuroraHome.tsx        // the only required file
```

Then register it:

```ts
// lib/storefront/templates.ts
export type BuiltinTemplateSlug = "modern" | "boutique" | "tech-store" | "aurora" | "your-new-slug";

BUILTIN_TEMPLATES.push({
  slug: "your-new-slug",
  name: "Your Template",
  description: "...",
  thumbnail: "https://images.unsplash.com/...?w=800&h=600&fit=crop",
  category: "fashion" | "electronics" | "general" | "food" | "home",
  websiteType: "ECOMMERCE",
  defaultTheme: { /* primaryColor, accentColor, ... */ },
  defaultSettings: { hero: { ... }, announcement: { ... } },
});
```

```tsx
// components/storefront/templates/index.tsx
import { YourNewHome } from "./your-new-slug/YourNewHome";

const HOME_BY_SLUG = {
  modern: ModernHome,
  // ...
  "your-new-slug": YourNewHome,
};
```

That's all the wiring you need — you'll instantly see the template in the onboarding gallery, the marketing site at `/templates`, and the merchant dashboard.

## 2. The `StorefrontData` contract

Your home component receives:

```ts
interface StorefrontData {
  store: {
    id, name, slug, subdomain, customDomain, description,
    logo, banner, templateId,
    theme: StoreTheme,           // colors, fonts, radius
    settings: StoreSettings,     // hero, announcement, social, delivery, ...
  };
  products: StorefrontProduct[];   // active, non-deleted, featured-first
  featured: StorefrontProduct[];   // .featured === true (or top 8 if none)
  categories: string[];            // distinct, non-empty categories
}
```

See [`lib/storefront/types.ts`](../frontend/web/lib/storefront/types.ts) for the full shape.

## 3. Theme tokens

Never hard-code colors or fonts. The layout sets these CSS variables on the storefront root:

| Variable | Purpose |
|---|---|
| `--sf-primary` | Buttons, key brand surface |
| `--sf-accent` | Discount badges, links, secondary highlights |
| `--sf-bg` | Page background |
| `--sf-text` | Body text |
| `--sf-muted` | Secondary text |
| `--sf-font-heading` | Heading font family |
| `--sf-font-body` | Body font family |
| `--sf-radius` | Corner radius for cards/buttons |

Use them with inline styles: `style={{ backgroundColor: "var(--sf-primary)" }}`.

## 4. Reusable building blocks

```tsx
import { ProductGrid }       from "@/components/storefront/ProductGrid";
import { ProductCard }       from "@/components/storefront/ProductCard";
import { HeroMedia }         from "@/components/storefront/HeroMedia";  // image OR video
import { AddToCartButton }   from "@/components/storefront/AddToCartButton";
import { QuantityStepper }   from "@/components/storefront/QuantityStepper";
import { useStoreCart }      from "@/components/storefront/StoreCartProvider";
import "@/components/storefront/animations.css";  // for sf-fade-up, sf-mesh, sf-marquee
```

The cart context, search bar, mobile nav, cart drawer, PDP gallery, catalog filters, and checkout are all provided by the platform layout — your template only renders the home page.

## 5. Hero with background video

```tsx
<section className="relative h-[85vh] overflow-hidden">
  <HeroMedia
    hero={store.settings.hero}     // reads videoUrl, image, overlayOpacity, etc.
    fallbackImage="https://..."
    overlay="gradient"
  />
  <div className="relative z-10 ...">
    <h1>{hero.headline}</h1>
  </div>
</section>
```

Merchants can paste a `videoUrl` (mp4/webm) into the **Customize** dashboard and `HeroMedia` will autoplay it muted with the image as a poster fallback. The `animations.css` file ships ready-made classes (`sf-fade-up`, `sf-mesh`, `sf-marquee`) that all honour `prefers-reduced-motion`.

## 6. Per-store dashboard customization

Every template can declare a custom dashboard manifest at `lib/storefront/templates.ts → defaultSettings.dashboard`. The dashboard nav, setup checklist, and customize-page sections all read from this. See `BUILTIN_TEMPLATES` for examples.

## 7. Best-practice template ideas (ecommerce-focused)

These are gaps in the current built-in set — concrete pitches for templates you might want to add next:

| Slug | Vibe | What makes it different |
|---|---|---|
| `outfit` | Streetwear / sneakers | Edge-to-edge product video on hero, sticky “shop the look” strip, sneaker drop countdown |
| `pharma` | Pharmacy / supplements | Strong trust badges, prescription-upload CTA, category icons grid, search-first layout |
| `home-living` | Furniture / home goods | Room-shoppable lookbook (click hotspots on photos), measurement help block |
| `pulse` | Beauty / cosmetics | Tinted hero gradient, rating-forward cards, “tutorial” video cards inline with products |
| `gallery` | Art / handmade goods | Single-product mode (one-product stores), large editorial photography |
| `bites` | Restaurant / cafe pickup | Menu-style listing, Today's hours block, WhatsApp order CTA |

For all of these, start by copying `AuroraHome.tsx`, swap the layout, and you're done — you don't need to rebuild cart/PDP/checkout.

---

# Path B — ZIP templates (legacy / external)

If you're uploading a template built outside the platform (e.g. a Vite/Next/CRA `dist/` folder you bought from a marketplace), follow this contract or **products will not appear on the storefront**. This is exactly what was broken on the old templates.

## 1. Folder structure inside the ZIP

```
your-template/
├── manifest.json             ← REQUIRED, see below
├── index.html                ← entry — must contain a mount point (e.g. <div id="root">)
└── assets/                   ← bundled CSS / JS / images, referenced relatively from index.html
```

All asset paths in `index.html` MUST be relative (`./assets/...`) or platform-relative (`/templates/<your-slug>/assets/...`). Do not use `/assets/...` — it 404s when the template is served from `/api/templates/serve`.

## 2. The required `manifest.json`

```jsonc
{
  "id": "your-template",
  "name": "Your Template",
  "version": "1.0.0",
  "type": "react",                  // "react" | "static"
  "entryPoint": "index.html",
  "css": ["./assets/index-abc123.css"],
  "js":  ["./assets/index-def456.js"],
  "thumbnail": "https://.../thumbnail.png",

  // OPTIONAL — declares dashboard adaptations for this template
  "dashboard": {
    "navigation": ["overview", "products", "orders", "customers", "customize", "settings"],
    "setupChecklist": [
      { "id": "brand", "label": "Add branding", "href": "/dashboard/customize", "type": "branding", "required": true },
      { "id": "products", "label": "Add products", "href": "/dashboard/products/new", "type": "products", "required": true }
    ],
    "catalog": {
      "collections": [{ "id": "men", "label": "Men" }, { "id": "women", "label": "Women" }],
      "filters":     [{ "id": "size", "label": "Size", "options": ["S","M","L"] }],
      "productFields": [{ "key": "fabric", "label": "Fabric", "type": "text" }]
    }
  },

  // OPTIONAL — exposes settings the merchant can edit in /dashboard/customize
  "configSchema": {
    "hero": {
      "label": "Hero",
      "fields": [
        { "id": "headline",  "type": "text",  "label": "Headline" },
        { "id": "image",     "type": "image", "label": "Hero image" },
        { "id": "videoUrl",  "type": "text",  "label": "Background video URL (mp4/webm)" }
      ]
    }
  },

  // OPTIONAL — remap platform fields onto whatever shape your template expects
  "api": {
    "mappings": {
      "products": {
        "title":      "name",
        "imageUrl":   "images[0]",
        "salePrice":  "price",
        "listPrice":  "comparePrice"
      }
    }
  }
}
```

## 3. THE CRITICAL CONTRACT — fetching products

Inside your template's JavaScript bundle, **all data calls must go through the platform's adapter URL**. The serve route automatically appends `?storeId=...` to any URL starting with `/api/adapters/`.

```js
// ✅ CORRECT — products come from the merchant's database
const products = await fetch("/api/adapters/your-template/products").then(r => r.json());

// ❌ WRONG — bundle ships demo data forever, like the original 7 templates did
const products = HARDCODED_DEMO_PRODUCTS;
```

Endpoints the adapter exposes:

| URL | Purpose |
|---|---|
| `/api/adapters/<slug>/products` | List active products |
| `/api/adapters/<slug>/products/<id-or-slug>` | Single product |
| `/api/adapters/<slug>/cart` | Customer cart (POST/GET/DELETE) |
| `/api/adapters/<slug>/orders` | Place an order |
| `/api/adapters/<slug>/auth/{login,register,me}` | Per-store customer auth |
| `/api/adapters/<slug>/settings` | Read merchant settings/branding |

The serve route also injects `window.__PLATFORM_CONFIG__` with the store id, theme, and settings — read it on boot if you'd rather not call `/api/adapters/<slug>/settings`.

## 4. Asset path checklist

Before zipping, verify with this checklist:

- [ ] `index.html` has a mount point (`<div id="root">` for React, `<body>` works for static HTML).
- [ ] All `<link>` and `<script>` tags use **relative** paths (`./assets/...`).
- [ ] No hardcoded `localhost:3000` or `https://yourdomain.com` URLs in the bundle.
- [ ] The bundle calls `/api/adapters/<your-slug>/products` (not `/api/products`, not a hardcoded JSON file).
- [ ] If your template has its own admin page, it does NOT include auth — the platform handles login.
- [ ] You set `manifest.json` `id` to match the folder name.

## 5. Uploading

`POST /api/site-admin/templates/import` accepts the ZIP. The site-admin dashboard at `/site-admin/templates` is the UI for it. The platform extracts the ZIP into `public/templates/<slug>/`, parses the manifest, and creates a `Template` row.

---

## Quick decision matrix

> "I want to launch fast and have everything just work."
**→ Use a built-in React template** (`modern`, `boutique`, `tech-store`, `aurora`). Customize hero/branding/colors from the dashboard. Done.

> "I have a designer-built HTML/CSS/JS site I want to plug in."
**→ ZIP template path.** Follow the contract in Section B-3 — it's the only way products will show up.

> "I want to add a brand-new template style for everyone to pick from."
**→ Add a React template** under `components/storefront/templates/<slug>/`. Takes ~200 lines for a polished home page; cart, PDP, checkout, and customize are inherited.

---

## Future improvements you could add

These aren't built yet but would slot in cleanly:

1. **Manifest validator on upload.** Reject ZIPs whose bundle never references `/api/adapters/`. Would have caught all 7 of the original broken templates at upload time.
2. **Template-scoped cart/PDP/checkout overrides.** Today React templates only customize the home page. We could let advanced template authors override the PDP layout via a per-template `<TemplatePDP>` component while keeping cart/checkout shared.
3. **Visual section editor.** Each section of a template (Hero, Categories, Featured, Story) is already self-contained in our React templates — wrapping each in a `<Section name="hero">` and exposing toggle/reorder in the dashboard customize page would let merchants compose home pages from blocks without code.
4. **Per-template image presets.** Pre-defined image crops/aspect ratios per template so merchants always upload art that looks right.
