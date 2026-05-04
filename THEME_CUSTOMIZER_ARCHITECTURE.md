# Shopify-like Theme Customizer — Architecture Plan

## 1. Overview

A full-page visual editor at `/dashboard/customize` where merchants can customize their store's appearance with a live preview — modeled after Shopify's theme customizer.

**Current state**: Merchants can only pick a template and change 2 colors on the settings page. No live preview, no section management, no font/layout controls.

**Target state**: Shopify-like split-screen editor with left sidebar controls and right-side live preview. Merchants can change colors, fonts, layout, add/remove/reorder sections, and edit section content — all with instant visual feedback.

---

## 2. UI Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard    Store Name          [Save] [View Store] │
├─────────────────┬────────────────────────────────────────────────┤
│                 │                                                │
│  SIDEBAR        │           LIVE PREVIEW                        │
│  (380px)        │                                                │
│                 │    ┌──────────────────────────────────┐        │
│  ┌───────────┐  │    │                                  │        │
│  │ Theme     │  │    │   [Navbar]                       │        │
│  │ Sections  │  │    │   [Hero Section]                 │        │
│  │ Content   │  │    │   [Collections]                  │        │
│  └───────────┘  │    │   [Featured Products]             │        │
│                 │    │   [Features]                      │        │
│  [Active Tab    │    │   [Products]                      │        │
│   Content]      │    │   [Newsletter]                    │        │
│                 │    │   [Footer]                        │        │
│  - Color picker │    │                                  │        │
│  - Font select  │    └──────────────────────────────────┘        │
│  - Layout opts  │                                                │
│  - Section list │    Desktop / Tablet / Mobile toggle             │
│  - etc.         │                                                │
│                 │                                                │
└─────────────────┴────────────────────────────────────────────────┘
```

### Top Bar
- Back button → returns to `/dashboard`
- Store name display
- **Save** button (saves all changes to `store.theme`)
- **View Store** link (opens live store in new tab)

### Left Sidebar (380px, scrollable)
Three tabs:
1. **Theme** — Colors, typography, layout, navbar, footer settings
2. **Sections** — List of home page sections with drag handles, visibility toggles, delete buttons, and "Add Section" button
3. **Content** — When a section is selected (clicked in sidebar or preview), shows editable fields for that section

### Live Preview (remaining width)
- Renders the `ConfigTemplate` component with demo data
- Updates instantly when any setting changes
- Responsive toggle: Desktop / Tablet / Mobile viewport widths
- Clicking a section in the preview selects it (highlighted with blue border)

---

## 3. Data Architecture

### 3.1 Extended `store.theme` Structure

Currently, `store.theme` stores:
```json
{
  "templateId": "default",
  "primaryColor": "#006A4E",
  "secondaryColor": "#F42A41",
  "customization": { "accent": "#f0fdf4" }
}
```

**New structure** (backward compatible — old format still works):
```json
{
  "templateId": "default",
  "primaryColor": "#006A4E",
  "secondaryColor": "#F42A41",
  "customization": {
    "colors": {
      "primary": "#006A4E",
      "secondary": "#F42A41",
      "accent": "#f0fdf4",
      "background": "#ffffff",
      "surface": "#f8fafc",
      "text": "#0f172a",
      "textMuted": "#64748b",
      "border": "#e2e8f0",
      "success": "#22c55e",
      "error": "#ef4444"
    },
    "typography": {
      "headingFont": "Inter",
      "bodyFont": "Inter",
      "headingWeight": "700",
      "borderRadius": "lg"
    },
    "layout": {
      "maxWidth": "7xl",
      "sectionSpacing": "normal",
      "cardStyle": "shadowed",
      "productColumns": 4
    },
    "navbar": {
      "style": "sticky-blur",
      "showSearch": true,
      "showWishlist": true,
      "showUserMenu": true,
      "layout": "centered",
      "announcementBar": {
        "message": "🎉 Welcome to our store!",
        "bgColor": "#006A4E",
        "textColor": "#ffffff"
      }
    },
    "footer": {
      "style": "dark",
      "showNewsletter": true,
      "showSocial": true,
      "columns": 4
    },
    "sections": [
      {
        "id": "hero-1",
        "type": "hero",
        "visible": true,
        "props": {
          "style": "centered",
          "title": "Welcome to Our Store",
          "subtitle": "Discover amazing products",
          "ctaText": "Shop Now",
          "showStats": true,
          "stats": [
            { "label": "Products", "value": "500+" },
            { "label": "Customers", "value": "10K+" }
          ]
        }
      },
      {
        "id": "collections-1",
        "type": "collections",
        "visible": true,
        "props": { "layout": "grid", "columns": 4, "title": "Shop by Category" }
      }
    ],
    "productPage": {
      "imageLayout": "stacked",
      "showReviews": true,
      "showRecentlyViewed": true,
      "showRelatedProducts": true,
      "showWishlist": true,
      "showFeatures": true
    },
    "collectionPage": {
      "showFilters": true,
      "gridColumns": 4,
      "cardStyle": "standard"
    }
  }
}
```

### 3.2 Config Resolution Strategy

When the store renderer needs to display a store, it follows this logic:

```
1. Load store.theme.customization
2. If customization.sections exists → FULL CUSTOMIZATION
   → Build TemplateConfig from customization fields
   → Render using ConfigTemplate (config-driven)
3. Else if templateId is a built-in (default, shopnest, food, roseo, minimal)
   → Render using the built-in React component (current behavior)
4. Else if templateId is a custom template (from DB)
   → Load config from templates table
   → Render using ConfigTemplateWrapper
```

**Key decision**: Once a merchant opens the customizer for a built-in template, we generate a full config from the template's base config and store it in `customization.sections`. From that point on, the store renders via `ConfigTemplate` instead of the built-in React component. This is how Shopify works too — once you customize a theme, it becomes "your version" of it.

### 3.3 Base Configs for Built-in Templates

Each built-in React template needs a JSON equivalent that represents its default visual design. These are used as starting points when a merchant first opens the customizer.

Files:
- `apps/web/lib/store-templates/engine/baseConfigs/default.ts`
- `apps/web/lib/store-templates/engine/baseConfigs/shopnest.ts`
- `apps/web/lib/store-templates/engine/baseConfigs/food.ts`
- `apps/web/lib/store-templates/engine/baseConfigs/roseo.ts`
- `apps/web/lib/store-templates/engine/baseConfigs/minimal.ts`

Each exports a `TemplateConfig` object matching the visual design of the corresponding React component.

---

## 4. Implementation Phases

### Phase 1: Core Layout + Theme Settings + Live Preview

**New files:**
| File | Purpose |
|------|---------|
| `apps/web/app/dashboard/customize/page.tsx` | Main customizer page — full-screen layout |
| `apps/web/app/dashboard/customize/CustomizerContext.tsx` | State management — config, selected section, dirty state |
| `apps/web/app/dashboard/customize/CustomizerSidebar.tsx` | Left sidebar with 3 tabs |
| `apps/web/app/dashboard/customize/CustomizerPreview.tsx` | Live preview with responsive toggle |
| `apps/web/app/dashboard/customize/ThemeSettingsPanel.tsx` | Colors, typography, layout, navbar, footer controls |
| `apps/web/app/dashboard/customize/ColorPicker.tsx` | Reusable color picker with hex input |
| `apps/web/lib/store-templates/engine/baseConfigs/default.ts` | Default template base config |
| `apps/web/lib/store-templates/engine/baseConfigs/index.ts` | Registry mapping templateId → base config |

**Modified files:**
| File | Change |
|------|--------|
| `apps/web/app/dashboard/layout.tsx` | Add "Customize" nav item (only when store exists) |
| `apps/web/app/store/[[...path]]/page.tsx` | Check for `customization.sections` → use ConfigTemplate |

**What merchants can do after Phase 1:**
- ✅ Change 10 color tokens with color pickers
- ✅ Change heading/body fonts from dropdown
- ✅ Change border radius, heading weight
- ✅ Change layout (max width, spacing, card style, product columns)
- ✅ Configure navbar (style, toggles, announcement bar)
- ✅ Configure footer (style, toggles, columns)
- ✅ See live preview updating instantly
- ✅ Save changes to store theme
- ✅ Responsive preview (desktop/tablet/mobile)

---

### Phase 2: Section Manager (Add/Remove/Reorder)

**New files:**
| File | Purpose |
|------|---------|
| `apps/web/app/dashboard/customize/SectionsPanel.tsx` | Section list with drag handles, visibility, delete |
| `apps/web/app/dashboard/customize/AddSectionModal.tsx` | Modal to pick section type to add |

**Dependencies:** Requires a drag-and-drop library. Options:
- `@dnd-kit/core` + `@dnd-kit/sortable` — Modern, accessible, React-native feel (recommended)
- `react-beautiful-dnd` — Older but proven (deprecated by author)
- Custom implementation using HTML5 drag API — No dependency but more work

**What merchants can do after Phase 2:**
- ✅ See list of all home page sections
- ✅ Drag to reorder sections
- ✅ Toggle section visibility (eye icon)
- ✅ Delete sections (trash icon)
- ✅ Add new sections from 12 available types
- ✅ Click section to select it (highlights in preview)

---

### Phase 3: Section Content Editor

**New files:**
| File | Purpose |
|------|---------|
| `apps/web/app/dashboard/customize/ContentPanel.tsx` | Dynamic section content editor |
| `apps/web/app/dashboard/customize/editors/HeroEditor.tsx` | Hero section fields |
| `apps/web/app/dashboard/customize/editors/AnnouncementEditor.tsx` | Announcement bar fields |
| `apps/web/app/dashboard/customize/editors/CollectionsEditor.tsx` | Collections section fields |
| `apps/web/app/dashboard/customize/editors/FeaturedProductsEditor.tsx` | Featured products fields |
| `apps/web/app/dashboard/customize/editors/FeaturesEditor.tsx` | Features items editor |
| `apps/web/app/dashboard/customize/editors/ProductsEditor.tsx` | Products section fields |
| `apps/web/app/dashboard/customize/editors/TestimonialsEditor.tsx` | Testimonials fields |
| `apps/web/app/dashboard/customize/editors/NewsletterEditor.tsx` | Newsletter fields |
| `apps/web/app/dashboard/customize/editors/StatsEditor.tsx` | Stats section fields |
| `apps/web/app/dashboard/customize/editors/CtaEditor.tsx` | CTA section fields |
| `apps/web/app/dashboard/customize/editors/FeatureItemEditor.tsx` | Reusable feature item row |
| `apps/web/app/dashboard/customize/editors/StatItemEditor.tsx` | Reusable stat item row |

**What merchants can do after Phase 3:**
- ✅ Click section in sidebar or preview → edit its content
- ✅ Hero: change title, subtitle, CTA text, style, stats, features
- ✅ Announcement: change message, colors
- ✅ Features: add/remove items, pick icon, edit title/description
- ✅ Newsletter: change title, subtitle, style
- ✅ CTA: change title, subtitle, button text, style
- ✅ All changes reflect in live preview immediately

---

## 5. API Design

### Existing API (no changes needed)

```
PATCH /api/stores/[storeId]
Body: { theme: { templateId, primaryColor, secondaryColor, customization: { ... } } }
→ Saves to store.theme (JSON string in DB)
```

### New API

```
GET /api/stores/[storeId]/theme-config
Response: { config: TemplateConfig, source: "customization" | "base" | "template" }
```

This endpoint:
1. Loads the store's `theme.customization`
2. If `customization.sections` exists → build full TemplateConfig from customization fields, return with `source: "customization"`
3. If templateId is built-in → load base config, return with `source: "base"`
4. If templateId is custom → load from templates table, return with `source: "template"`

This gives the customizer a complete TemplateConfig to work with regardless of the source.

---

## 6. CustomizerContext State Design

```typescript
interface CustomizerState {
  // The full template config being edited
  config: TemplateConfig
  
  // Which section is selected (null = none)
  selectedSectionId: string | null
  
  // Active sidebar tab
  activeTab: "theme" | "sections" | "content"
  
  // Preview viewport
  viewport: "desktop" | "tablet" | "mobile"
  
  // Dirty state (unsaved changes)
  isDirty: boolean
  
  // Loading states
  loading: boolean
  saving: boolean
}

interface CustomizerActions {
  // Theme settings
  updateColors: (colors: Partial<TemplateColors>) => void
  updateTypography: (typography: Partial<TemplateTypography>) => void
  updateLayout: (layout: Partial<TemplateLayout>) => void
  updateNavbar: (navbar: Partial<TemplateNavbarConfig>) => void
  updateFooter: (footer: Partial<TemplateFooterConfig>) => void
  
  // Section management
  addSection: (type: HomeSectionConfig["type"], index?: number) => void
  removeSection: (sectionId: string) => void
  moveSection: (fromIndex: number, toIndex: number) => void
  toggleSectionVisibility: (sectionId: string) => void
  updateSectionProps: (sectionId: string, props: any) => void
  
  // Selection
  selectSection: (sectionId: string | null) => void
  
  // Save
  save: () => Promise<void>
  
  // Reset to base config
  resetToDefault: () => void
}
```

---

## 7. Backward Compatibility

- Stores without `customization.sections` continue to render using built-in React components — **zero breaking changes**
- The old settings page (`/dashboard/settings`) continues to work for basic color/template changes
- The customizer is an **additive feature** — merchants can use either the simple settings or the advanced customizer
- When a merchant saves from the customizer, it writes to the same `store.theme` field

---

## 8. Performance Considerations

- **Debounced preview updates**: Color/font changes are applied to preview immediately via React state, but API saves are debounced
- **Demo data for preview**: Use `getDemoStore()` for preview data — no need to load real products
- **Lazy loading**: Section editors (Phase 3) are lazy-loaded to reduce initial bundle
- **No re-rendering entire preview**: Only the changed section re-renders when possible

---

## 9. Scope Estimate

| Phase | New Files | Modified Files | Effort |
|-------|-----------|----------------|--------|
| Phase 1 | 8 | 2 | ~400 lines of new code |
| Phase 2 | 2 | 0 | ~200 lines + DnD library |
| Phase 3 | 13 | 0 | ~600 lines |
| Base configs | 6 | 0 | ~300 lines per template |
| **Total** | **~29** | **~2** | **~2000 lines** |

---

## 10. Open Questions

1. **Should the customizer auto-save?** Shopify auto-saves. Recommendation: Auto-save with debounce (2 seconds after last change), plus explicit Save button.

2. **Should merchants be able to undo/redo?** Nice-to-have for later. Could use `useReducer` with history stack.

3. **What about custom CSS?** The `TemplateConfig.customCss` field exists. We could add a "Custom CSS" tab in the customizer for advanced users. Low priority.

4. **What about product page / collection page customization?** Phase 1 covers the global settings. Product page and collection page specific settings (image layout, card style, etc.) can be added as sub-tabs in the Theme tab.

5. **Should we add a "Reset to Default" button?** Yes — reverts all customization back to the template's base config.
