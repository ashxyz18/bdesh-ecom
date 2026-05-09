# Plan: Disable Website Builder — Focus on Prebuilt Templates

## Current State

The app has **two parallel template systems**:

| System | Location | Purpose |
|--------|----------|---------|
| **Store Templates** | `lib/store-templates/` | Prebuilt e-commerce storefronts (default, roseo, shopify, food, salon, pharmacy, etc.) |
| **Builder Templates** | `lib/builder/templates/` | Block-based drag-and-drop website layouts (startup-saas, restaurant-bistro, law-firm, etc.) |

The **builder system** powers:
- `/dashboard/ai-builder` — AI prompt/image → generates a website
- `/dashboard/builder` — Visual drag-and-drop block editor
- The "Website Builder Templates" section on the Templates page

The **store template system** powers:
- `/dashboard/new-store` — Pick a template → create store
- `/dashboard/customize` — Change colors, template, hero text
- The "Store Templates" section on the Templates page

## Goal

**Turn off the website builder entirely.** Customers only select from prebuilt store templates. No AI generation, no visual drag-and-drop editor.

---

## Changes Required (10 files)

### 1. `frontend/web/app/dashboard/layout.tsx` — Sidebar Navigation

**Current:** "Website Builder" section with 4 items: AI Builder, Visual Builder, Customize, Templates

**Change to:** Rename section to "Design" with 2 items only:
- Templates (`/dashboard/templates`) — primary entry point
- Customize (`/dashboard/customize`) — for active stores

Remove from both `navSections` arrays (with-store and without-store):
- `{ href: "/dashboard/ai-builder", icon: Wand2, label: "AI Builder" }`
- `{ href: "/dashboard/builder", icon: MonitorSmartphone, label: "Visual Builder" }`

---

### 2. `frontend/web/app/dashboard/page.tsx` — Dashboard Home

**Changes:**

| Line | Current | New |
|------|---------|-----|
| ~140 | Onboarding: `"Customize your store design" → /dashboard/ai-builder` | → `/dashboard/templates` |
| ~288 | Quick start card: "AI Website Builder" → `/dashboard/ai-builder` | Replace with "Browse Templates" → `/dashboard/templates` |
| ~305 | Quick start card: "Visual Builder" → `/dashboard/builder` | Remove entirely (or replace with "Customize Store" → `/dashboard/customize`) |
| ~362 | Template preview cards → `/dashboard/ai-builder` | → `/dashboard/templates` |
| ~403 | Quick action: "AI Builder" → `/dashboard/ai-builder` | Change to "Templates" → `/dashboard/templates` |

---

### 3. `frontend/web/app/dashboard/templates/page.tsx` — Template Gallery

**This becomes the PRIMARY page for selecting a website design.**

Changes:
- **Remove** the entire "Website Builder Templates" section (lines ~282-299) including `BuilderTemplateCard` component
- **Remove** import of `websiteTemplates` from `@/lib/builder/templates/registry`
- **Remove** `BuilderTemplateCard` component definition (lines ~96-140)
- **Remove** `LayoutTemplate` from lucide imports (only used for builder section)
- **Update** `TemplateCard` "Use Template" button: change from `/dashboard/ai-builder?template=${template.id}` → `/dashboard/new-store?template=${template.id}` (if no store) or `/dashboard/customize` (if store exists)
- **Update** CTA section at bottom: remove "AI Builder" button, keep only "Create Store"
- **Update** description text to emphasize prebuilt templates

---

### 4. `frontend/web/app/dashboard/ai-builder/page.tsx` — Disable AI Builder

**Replace entire page** with a redirect component:

```tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AIBuilderPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard/templates"); }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-slate-500">Redirecting to Templates...</p>
    </div>
  );
}
```

---

### 5. `frontend/web/app/dashboard/builder/page.tsx` — Disable Visual Builder

**Same redirect approach** as AI Builder → redirect to `/dashboard/templates`.

---

### 6. `frontend/web/components/marketing/Navbar.tsx` — Marketing Site Nav

**Current:** "BUILD YOUR WEBSITE" column with "AI Website Builder" and "Website Builder" items.

**Change to:** Replace with template-focused items:
- "AI Website Builder" → "Templates" with desc "Pre-built designs" and href `/#templates`
- "Website Builder" → Remove or change to "Customize" with desc "Personalize your store"

---

### 7. `frontend/web/app/page.tsx` — Landing Page Footer

**Current (line ~186):** `{ label: "AI Builder", href: "/ai-builder" }`

**Change to:** `{ label: "Templates", href: "/#templates" }`

---

### 8. `frontend/web/components/marketing/TemplateCard.tsx` — Marketing Template Card

**Current:** Links to `/dashboard/builder?template=${template.id}`

**Change to:** Links to `/dashboard/templates` (or `/dashboard/new-store?template=${template.id}` for direct store creation)

---

### 9. `frontend/web/app/dashboard/customize/page.tsx` — No Changes Needed

This page already works with **store templates** (uses `templateList` from `@/lib/store-templates/registry`), not the builder system. It's the correct customization flow for prebuilt templates.

---

### 10. `frontend/web/app/dashboard/new-store/page.tsx` — No Changes Needed

Already uses store templates from the registry. This is the correct flow: pick template → create store.

---

## Files NOT Changed (kept for future re-enable)

The following builder infrastructure files are **not deleted** — they're just unreachable from the UI. When the builder is re-enabled later, we simply restore the nav items and remove the redirects:

- `frontend/web/lib/builder/` — entire directory (blocks, components, templates, contexts)
- `frontend/web/lib/template-builder/` — template builder engine
- `frontend/web/app/dashboard/ai-builder/page.tsx` — replaced with redirect (original can be restored from git)
- `frontend/web/app/dashboard/builder/page.tsx` — replaced with redirect (original can be restored from git)
- `backend/ai/` — AI service backend

---

## User Flow After Changes

```
User lands on Dashboard
  → Sees "Templates" in sidebar (primary design entry)
  → Clicks Templates
  → Browses prebuilt store templates
  → Clicks "Use Template" → goes to /dashboard/new-store?template=xxx
  → Creates store with that template
  → Goes to "Customize" to tweak colors, hero text, etc.
  → Done!
```

No AI builder. No visual drag-and-drop. Just: **pick a template → create store → customize.**

---

## Implementation Order

1. Dashboard sidebar nav (`layout.tsx`) — remove builder links
2. Dashboard home (`page.tsx`) — update all builder references
3. Templates page (`templates/page.tsx`) — remove builder section, update CTAs
4. AI Builder page — replace with redirect
5. Visual Builder page — replace with redirect
6. Marketing Navbar — update menu items
7. Landing page footer — update link
8. TemplateCard component — update links
