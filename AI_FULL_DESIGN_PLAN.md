# AI Builder: Full Design Generation Plan

## Problem Statement

The current AI Builder only extracts **colors** from uploaded images and applies them to a hardcoded layout. The user wants the AI to copy the **full design** — layout structure, section ordering, navbar/footer styles, typography, spacing, card styles, and all visual characteristics — not just colors.

## Current Architecture (What's Broken)

```
Image Upload
    ↓
analyzeDesign() → AI extracts: colors, vibe, industry, elements
    ↓
generateTemplateFromImage() → Builds STATIC GeneratedTemplateConfig
    ↓                              (always same sections, same order)
page.tsx → Shows HARDCODED preview (lines 698-824)
    ↓                              (only uses detectedColors, ignores templateConfig)
handleApplyToStore() → Saves FLAT theme {primaryColor, secondaryColor, ...}
    ↓                              (loses all layout/section/navbar/footer data)
Store renders → Only colors change, layout stays the same
```

### Key Issues

1. **AI prompt** (`analyzeDesign()`) only asks for colors, vibe, industry — not layout structure, section types, navbar/footer style
2. **`generateTemplateFromImage()`** builds a hardcoded `GeneratedTemplateConfig` — same sections every time regardless of image
3. **Preview** in `page.tsx` (lines 698-824) is entirely hardcoded HTML — doesn't use `templateConfig` at all
4. **`handleApplyToStore()`** saves only a flat color theme — discards all layout/section/navbar/footer data
5. **`AIDesignResult` interface** doesn't carry the full `TemplateConfig`

## Proposed Architecture

```
Image Upload
    ↓
analyzeDesign() → AI extracts: colors, style, industry, AND:
    ↓              • section types + order (hero, features, products, testimonials, etc.)
    ↓              • navbar style (sticky-blur, transparent, sticky-dark, etc.)
    ↓              • footer style (dark, light, minimal, columns)
    ↓              • hero style (centered, split, fullwidth, minimal)
    ↓              • card style (flat, bordered, shadowed, elevated)
    ↓              • spacing (compact, normal, spacious)
    ↓              • product columns (2, 3, 4)
    ↓
generateTemplateFromImage() → Builds DYNAMIC TemplateConfig
    ↓                          using AI-detected sections, navbar, footer, etc.
    ↓
page.tsx → Renders ConfigTemplate component with generated TemplateConfig
    ↓        (true WYSIWYG — same component the live store uses)
    ↓
handleApplyToStore() → Saves FULL TemplateConfig as JSON in store.theme
    ↓                      (preserves all layout data)
Store renders → ConfigTemplateWrapper reads TemplateConfig → full design applied
```

---

## Implementation Plan

### Step 1: Enhance AI Prompt in `analyzeDesign()`

**File:** `packages/ai/src/services/design.ts`

Expand the system prompt to ask the vision model to also detect:

```json
{
  "detectedColors": { ... },       // existing
  "detectedStyle": {               // expanded
    "vibe": "...",
    "typography": ["..."],
    "layout": "...",
    "mood": ["..."],
    "headingStyle": "serif|sans-serif",        // NEW
    "borderRadius": "none|sm|md|lg|xl|full",    // NEW
    "cardStyle": "flat|bordered|shadowed|elevated", // NEW
    "spacing": "compact|normal|spacious"          // NEW
  },
  "detectedIndustry": "...",       // existing
  "detectedElements": ["..."],     // existing
  "confidence": 85,                // existing
  "detectedLayout": {              // NEW - entire block
    "navbarStyle": "sticky-blur|sticky-white|sticky-dark|transparent",
    "navbarLayout": "centered|left-aligned",
    "showSearch": true,
    "heroStyle": "centered|split|fullwidth|minimal",
    "sections": [
      { "type": "announcement", "props": { "message": "..." } },
      { "type": "hero", "props": { "style": "centered", "title": "...", "showStats": true } },
      { "type": "collections", "props": { "layout": "grid", "columns": 4 } },
      { "type": "featuredProducts", "props": { "layout": "grid", "columns": 4 } },
      { "type": "features", "props": { "layout": "grid", "items": [...] } },
      { "type": "testimonials", "props": { "style": "cards" } },
      { "type": "newsletter", "props": { "style": "card" } }
    ],
    "footerStyle": "dark|light|minimal",
    "footerColumns": 3|4,
    "showNewsletter": true,
    "productColumns": 2|3|4
  }
}
```

The AI prompt should instruct the model to:
- Look at the image's visual hierarchy and determine what sections are present
- Identify navbar position/style (top bar, transparent overlay, sticky)
- Detect hero section style (big centered text, split with image, full-width background)
- Identify what content blocks appear and in what order
- Detect footer style (dark, light, minimal)
- Infer card styles from product/content cards visible in the image

### Step 2: Update Types

**File:** `packages/ai/src/types.ts`

Add `detectedLayout` to `DesignAnalysisResult`:

```typescript
export interface DetectedLayout {
  navbarStyle: "sticky-white" | "sticky-blur" | "sticky-dark" | "transparent";
  navbarLayout: "centered" | "left-aligned";
  showSearch: boolean;
  heroStyle: "centered" | "split" | "fullwidth" | "minimal";
  sections: { type: string; props: Record<string, any> }[];
  footerStyle: "dark" | "light" | "minimal";
  footerColumns: 2 | 3 | 4;
  showNewsletter: boolean;
  productColumns: 2 | 3 | 4;
}

// Add to DesignAnalysisResult:
export interface DesignAnalysisResult {
  // ... existing fields
  detectedLayout: DetectedLayout;
}
```

Also update `GeneratedTemplateConfig` to match `TemplateConfig` from the engine types (they're already very similar).

### Step 3: Make `generateTemplateFromImage()` Dynamic

**File:** `packages/ai/src/services/design.ts`

Replace the hardcoded `homePage.sections` with AI-detected sections:

```typescript
// BEFORE (hardcoded):
homePage: {
  sections: [
    { type: "announcement", props: { ... } },
    { type: "hero", props: { style: s.layout === "split" ? "split" : "centered", ... } },
    { type: "collections", props: { ... } },
    { type: "featuredProducts", props: { ... } },
    { type: "features", props: { ... } },
    { type: "products", props: { ... } },
    { type: "newsletter", props: { ... } },
  ],
}

// AFTER (dynamic from AI):
const layout = analysis.detectedLayout;

homePage: {
  sections: layout?.sections?.length > 0
    ? layout.sections.map(section => ({
        type: section.type,
        props: {
          ...section.props,
          // Inject AI-detected colors into section props
          ...(section.type === "announcement" ? { bgColor: c.primary, textColor: "#ffffff" } : {}),
          ...(section.type === "hero" ? { style: layout.heroStyle } : {}),
        }
      }))
    : // fallback to default sections
},
navbar: {
  style: layout?.navbarStyle || "sticky-blur",
  showSearch: layout?.showSearch ?? true,
  showWishlist: true,
  showUserMenu: true,
  layout: layout?.navbarLayout || "left-aligned",
},
footer: {
  style: layout?.footerStyle || "dark",
  showNewsletter: layout?.showNewsletter ?? true,
  showSocial: true,
  columns: layout?.footerColumns || 4,
},
```

### Step 4: Replace Hardcoded Preview with ConfigTemplate

**File:** `apps/web/app/dashboard/ai-builder/page.tsx`

Replace lines 698-824 (the hardcoded preview HTML) with the actual `ConfigTemplate` component:

```tsx
// BEFORE: ~130 lines of hardcoded preview HTML using result.detectedColors
// AFTER:
import ConfigTemplate from "@/lib/store-templates/engine/ConfigTemplate";

// Inside the preview container:
<div className={`mx-auto border border-slate-200 rounded-lg overflow-hidden bg-white shadow-inner ${
  previewDevice === "mobile" ? "max-w-[375px]" : "w-full"
}`}>
  {/* Browser chrome (keep this) */}
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

  {/* ACTUAL template preview */}
  <ConfigTemplate
    config={result.templateConfig}
    store={previewStore}
    path={[]}
  />
</div>
```

Where `previewStore` is a mock store object constructed from the AI result:

```typescript
const previewStore = useMemo(() => ({
  id: "preview",
  name: businessName || "Your Store",
  slug: "preview",
  subdomain: businessName?.toLowerCase().replace(/\s+/g, "-") || "preview",
  description: `AI-generated ${result?.detectedIndustry || "general"} store`,
  logo: null,
  banner: null,
  status: "ACTIVE",
  theme: {},
  settings: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  products: [],   // empty for preview
  collections: [],
}), [businessName, result]);
```

### Step 5: Update `handleApplyToStore()` to Save Full TemplateConfig

**File:** `apps/web/app/dashboard/ai-builder/page.tsx`

Replace the flat theme object with the full `TemplateConfig`:

```typescript
// BEFORE:
const theme = {
  templateId: result.suggestedTemplateId || "default",
  primaryColor: c.primary || "#006A4E",
  secondaryColor: c.secondary || "#F42A41",
  // ... flat color-only theme
};

// AFTER:
const theme = {
  templateId: `ai-${Date.now()}`,  // unique ID for AI-generated template
  templateConfig: result.templateConfig,  // FULL layout config
  // Also keep color shortcuts for backward compatibility
  primaryColor: c.primary || "#006A4E",
  secondaryColor: c.secondary || "#F42A41",
  accentColor: c.accent || "#059669",
  backgroundColor: c.background || "#ffffff",
  textColor: c.text || "#111827",
  aiGenerated: true,
  generatedAt: new Date().toISOString(),
};
```

### Step 6: Update Store Rendering to Use TemplateConfig

**File:** `apps/web/app/store/[[...path]]/page.tsx`

The store page already supports `ConfigTemplateWrapper` for custom templates. We need to add a path for AI-generated templates stored in the theme field:

```typescript
// After line 99:
const templateId = parsedStore.theme?.templateId || 'default';

// Add: Check if theme contains a full templateConfig from AI Builder
if (parsedStore.theme?.templateConfig && parsedStore.theme?.aiGenerated) {
  const configJson = JSON.stringify(parsedStore.theme.templateConfig);
  const ConfigTemplateWrapper = (await import('@/lib/store-templates/engine/ConfigTemplateWrapper')).ConfigTemplateWrapper;
  return (
    <StoreProviders storeId={parsedStore.id}>
      <ConfigTemplateWrapper store={parsedStore} path={path || []} configJson={configJson} />
    </StoreProviders>
  );
}

// Existing logic continues...
if (isBuiltInTemplate(templateId)) { ... }
```

### Step 7: Update `AIDesignResult` Interface

**File:** `apps/web/app/dashboard/ai-builder/page.tsx`

```typescript
// BEFORE:
interface AIDesignResult {
  detectedColors: { primary: string; secondary: string; accent: string; background: string; text: string; palette: string[] };
  detectedStyle: { vibe: string; typography: string[]; layout: string; mood: string[] };
  detectedIndustry: string;
  detectedElements: string[];
  suggestedTemplateId: string;
  templateConfig: any;  // ← was `any`
  previewColors: string[];
  marketingTips: string[];
}

// AFTER:
import type { TemplateConfig } from "@/lib/store-templates/engine/types";

interface AIDesignResult {
  detectedColors: { primary: string; secondary: string; accent: string; background: string; text: string; palette: string[] };
  detectedStyle: { vibe: string; typography: string[]; layout: string; mood: string[] };
  detectedIndustry: string;
  detectedElements: string[];
  suggestedTemplateId: string;
  templateConfig: TemplateConfig;  // ← properly typed
  previewColors: string[];
  marketingTips: string[];
}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `packages/ai/src/types.ts` | Add `DetectedLayout` interface, add `detectedLayout` to `DesignAnalysisResult` |
| `packages/ai/src/services/design.ts` | Expand AI prompt for full layout detection, make `generateTemplateFromImage()` dynamic |
| `apps/web/app/dashboard/ai-builder/page.tsx` | Replace hardcoded preview with `ConfigTemplate`, update `AIDesignResult` type, update `handleApplyToStore()` |
| `apps/web/app/store/[[...path]]/page.tsx` | Add AI-generated template detection path before built-in template lookup |

## Risk Mitigation

1. **AI hallucination** — The AI might return invalid section types or props. Validate against `HomeSectionConfig` union type and fall back to defaults for invalid sections.
2. **Preview performance** — `ConfigTemplate` loads real components. Use `dynamic()` imports and ensure the preview store has empty products/collections to avoid loading spinners.
3. **Backward compatibility** — Existing stores with flat color themes continue to work. The new `aiGenerated` flag in the theme object distinguishes AI-generated full designs from legacy color-only themes.
4. **Token limits** — The expanded AI prompt returns more data. Current `maxTokens: 1024` may need to be increased to `2048` for the layout section.

## Fallback Strategy

If the AI fails to detect layout (or returns invalid data), the system falls back to:
1. Industry-based template selection (existing `INDUSTRY_TEMPLATE_MAP`)
2. Default sections (current hardcoded layout)
3. Client-side extracted colors (existing fallback)

This ensures the feature degrades gracefully — users always get at least a color-matched design.
