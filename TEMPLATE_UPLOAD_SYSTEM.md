# Template Upload System — Complete Architecture

## 1. The Problem

Merchants' stores all look the same because:
- Only 5 built-in templates
- JSON config engine has only 12 section types with limited layout variants
- No custom CSS support
- No visual builder — admin can only upload raw JSON

## 2. The Solution: 3 Upload Methods

### Method 1: Visual Template Builder (Admin Dashboard)
Admin opens `/admin/templates/builder`, picks sections, changes colors/fonts/layout, adds custom CSS, previews live, and saves as a new template. **This is the primary upload method.**

### Method 2: JSON Config Upload (Admin Dashboard)
Admin uploads a `TemplateConfig` JSON file via the existing upload modal. Already built, but needs more section types and custom CSS support.

### Method 3: Code Deployment (Developer Workflow)
Admin builds React components locally in `apps/web/lib/store-templates/my-template/`, registers in `registry.tsx`, and deploys via git push. Unlimited design freedom but requires code deployment.

## 3. What Makes Templates Look Unique

| Lever | Current State | Target State | Impact |
|-------|--------------|--------------|--------|
| Color scheme (10 tokens) | ✅ Supported | ✅ Same | High |
| Typography (fonts, weight, radius) | ✅ Supported | ✅ Same | High |
| Section composition | ✅ 12 types | 🎯 20+ types | Very High |
| Section layout variants | ⚠️ 1-2 per section | 🎯 3-5 per section | Very High |
| Custom CSS | ❌ Not supported | 🎯 Full CSS injection | Unlimited |
| Built-in React templates | 5 | 🎯 8+ | High |

## 4. New Section Types to Add

| # | Section Type | Description | Key Props |
|---|-------------|-------------|-----------|
| 13 | `banner` | Full-width image/gradient banner with text overlay | image, title, subtitle, ctaText, overlay, height |
| 14 | `brandLogos` | Logo carousel / trust badges row | items[], layout (carousel/grid) |
| 15 | `countdown` | Countdown timer for sales/events | targetDate, title, style |
| 16 | `faq` | Accordion FAQ section | items[], title |
| 17 | `team` | Team members grid | members[], columns |
| 18 | `pricing` | Pricing plans comparison | plans[], columns, highlightIndex |
| 19 | `timeline` | Process/steps timeline | steps[], style (vertical/horizontal) |
| 20 | `categories` | Category icons grid (visual, different from collections) | items[], columns, style (cards/icons/grid) |

## 5. Enhanced Layout Variants for Existing Sections

### Hero Section (currently 4 styles → add 2 more)
- `video` — Video background hero
- `parallax` — Parallax scrolling hero

### Collections Section (currently 3 layouts → add 2 more)
- `cards` — Large image cards with overlay text
- `icons` — Circular icon grid

### Products Section (currently 1 layout → add 3 more)
- `carousel` — Horizontal scrolling carousel
- `list` — List view with large cards
- `masonry` — Pinterest-style masonry grid

### Features Section (currently 3 layouts → add 2 more)
- `sidebar` — Side feature list
- `tabs` — Tabbed features

### Newsletter Section (currently 3 styles → add 1 more)
- `popup` — Floating/popup style

## 6. Custom CSS Support

### Config Schema Addition
```typescript
interface TemplateConfig {
  // ... existing fields
  customCss?: string  // Already in types.ts but not implemented in upload
}
```

### Security
- Sanitize CSS on upload: strip `javascript:`, `expression()`, `@import`, `</style`
- Already partially implemented in `validateTemplateConfig()`
- Render in ConfigTemplate via `<style>` tag with scoped prefix

### CSS Scoping
Each template gets a unique class like `tpl-{slug}` applied to the root div. Custom CSS is automatically scoped:
```css
.tpl-my-template .hero-title { font-size: 4rem; }
.tpl-my-template .product-card { border-radius: 20px; }
```

## 7. Visual Template Builder (Admin Dashboard)

### Route: `/admin/templates/builder`

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back    Template Name: [________]    [Save as Template]       │
├─────────────────┬────────────────────────────────────────────────┤
│                 │                                                │
│  SIDEBAR        │           LIVE PREVIEW                        │
│  (380px)        │                                                │
│                 │    ┌──────────────────────────────────┐        │
│  ┌───────────┐  │    │   [Navbar]                       │        │
│  │ Theme     │  │    │   [Hero Section]                 │        │
│  │ Sections  │  │    │   [Collections]                  │        │
│  │ CSS       │  │    │   [Products]                      │        │
│  └───────────┘  │    │   [Footer]                       │        │
│                 │    └──────────────────────────────────┘        │
│  [Active Tab    │                                                │
│   Content]      │    Desktop / Tablet / Mobile toggle             │
│                 │                                                │
└─────────────────┴────────────────────────────────────────────────┘
```

### 4 Tabs:
1. **Theme** — Colors (10 pickers), Typography (font dropdowns, weight, radius), Layout (max width, spacing, card style, columns)
2. **Sections** — Add/remove/reorder sections, toggle visibility, select section to edit
3. **Content** — Edit selected section's props (title, subtitle, CTA, items, etc.)
4. **CSS** — Custom CSS editor with syntax highlighting

### Save Flow:
1. Admin clicks "Save as Template"
2. Modal: enter name, description, category, thumbnail
3. System builds complete `TemplateConfig` from current state
4. POST `/api/templates` with the config
5. Template appears in admin templates list + merchant template picker

## 8. Data Flow

```
Admin builds template in Visual Builder
  → Saves as TemplateConfig JSON
  → POST /api/templates (stored in DB)
  → Appears in template list

Merchant selects template
  → PATCH /api/stores/[storeId] { theme: { templateId: "my-template" } }
  → Store page loads
  → store/[[...path]]/page.tsx checks templateId
  → Not built-in → loads config from templates table
  → Renders via ConfigTemplateWrapper → ConfigTemplate
```

## 9. Implementation Phases

### Phase 1: Enhanced Config Engine + Custom CSS
**Files to create:**
- 8 new section components in `apps/web/lib/store-templates/engine/sections/`
- Updated types in `apps/web/lib/store-templates/engine/types.ts`

**Files to modify:**
- `ConfigHomePage.tsx` — add new section renderers
- `validateTemplateConfig()` — add new section types
- `ConfigTemplate.tsx` — add CSS scoping class

**Effort:** ~400 lines new code

### Phase 2: Visual Template Builder (Admin)
**Files to create:**
- `apps/web/app/admin/templates/builder/page.tsx` — Main builder page
- `apps/web/app/admin/templates/builder/BuilderContext.tsx` — State management
- `apps/web/app/admin/templates/builder/BuilderSidebar.tsx` — Left sidebar with tabs
- `apps/web/app/admin/templates/builder/BuilderPreview.tsx` — Live preview
- `apps/web/app/admin/templates/builder/ThemePanel.tsx` — Colors, typography, layout
- `apps/web/app/admin/templates/builder/SectionsPanel.tsx` — Section management
- `apps/web/app/admin/templates/builder/ContentPanel.tsx` — Section content editor
- `apps/web/app/admin/templates/builder/CssEditor.tsx` — Custom CSS editor
- `apps/web/app/admin/templates/builder/ColorPicker.tsx` — Reusable color picker

**Files to modify:**
- `apps/web/app/admin/templates/page.tsx` — Add "Create New Template" button → builder

**Effort:** ~800 lines new code

### Phase 3: New Built-in React Templates
**Files to create:**
- `apps/web/lib/store-templates/electro/ElectroStoreFront.tsx` — Dark neon electronics
- `apps/web/lib/store-templates/boutique/BoutiqueStoreFront.tsx` — Soft pink fashion
- `apps/web/lib/store-templates/grocer/GrocerStoreFront.tsx` — Fresh green grocery

**Files to modify:**
- `apps/web/lib/store-templates/registry.tsx` — Register new templates

**Effort:** ~1500 lines per template (copy existing, redesign)

## 10. Why This Approach Works

1. **Admin can upload new websites from dashboard** — via Visual Builder or JSON upload
2. **Templates look unique** — custom CSS + 20+ section types + multiple layout variants
3. **Safe** — no code execution, just data (JSON config + sanitized CSS)
4. **All React features work** — cart, wishlist, auth, reviews, checkout all preserved
5. **Backward compatible** — existing stores continue to work unchanged
6. **Scalable** — adding more section types is easy, just add a component + type definition
