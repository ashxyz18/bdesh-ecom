# Bug Fixes + New Template Plan

## Issue Analysis

### Bug 1: Template selection sends user back to choose template
**Root Cause**: [`new-store/page.tsx`](apps/web/app/dashboard/new-store/page.tsx:67) uses `useSearchParams()` directly in the main component. In Next.js 13+, this requires a `<Suspense>` boundary. Without it, navigation triggers a full component re-mount, resetting `step` state back to `"template"`.

**Fix**: Split into a wrapper component with `<Suspense>` and an inner component that uses `useSearchParams()`.

```tsx
// new-store/page.tsx
import { Suspense } from "react"

export default function NewStorePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <NewStorePageInner />
    </Suspense>
  )
}

function NewStorePageInner() {
  const searchParams = useSearchParams()
  // ... rest of current logic
}
```

---

### Bug 2: Preview vs actual store mismatch
**Root Cause**: [`getDemoStore()`](apps/web/lib/store-templates/shared/demoData.ts:197) returns the same generic products for ALL templates except "food". When a user previews the "Roseo" template, they see generic products (leather bags, silk scarves) instead of luxury-themed products. When they create a real store, they see their own products — completely different experience.

**Fix**: Create template-specific demo data:
- `getDemoStore("roseo")` → luxury fashion products, dark elegant store name
- `getDemoStore("default")` → general store products
- `getDemoStore("shopify")` → tech/gadget products  
- `getDemoStore("shopnest")` → fashion/lifestyle products
- `getDemoStore("food")` → food products (already done)
- `getDemoStore("electro")` → electronics products
- `getDemoStore("boutique")` → women's fashion products
- `getDemoStore("grocer")` → grocery/organic products

Each template preview should also use a matching store name, description, and collection names.

---

### Bug 3: No Store Builder in merchant dashboard
**Root Cause**: The merchant dashboard sidebar ([`layout.tsx`](apps/web/app/dashboard/layout.tsx:49)) only has: Overview, Products, Orders, Templates, Settings. There's no way for merchants to visually customize their store. The template builder exists at `/admin/templates/builder` but that's admin-only for creating new template configs.

**Fix**: Add a "Customize Store" link in the sidebar that navigates to `/dashboard/customize`. This page will be a merchant-facing store customizer that lets them:
1. Pick/change their template
2. Customize colors (primary, secondary)
3. Toggle sections on/off
4. Edit hero text, announcement bar
5. Preview changes live

This is different from the admin template builder — it's a simplified version for merchants to personalize their existing template.

---

### Bug 4: Templates look the same (only color difference)
**Root Cause**: Most templates share the same structural layout:
- Hero section → Collection pills → Featured products grid → Features row → Footer
- Only colors and minor styling differ
- Food template is the most differentiated (menu-style categories, WhatsApp ordering)

**Fix**: Create 3 new templates with **fundamentally different layouts**:

#### Electro (Electronics Store)
- **Color**: Dark (#0a0a0a bg), neon blue (#00d4ff) accents, electric cyan highlights
- **Layout differences**:
  - No traditional hero — instead a "Featured Deals" carousel with countdown timers
  - Product cards show specs (RAM, Storage, Battery) not just description
  - Category navigation as a horizontal icon bar (Phones, Laptops, Audio, Gaming, Accessories)
  - "Compare" button on products
  - Tech specs table on product page
  - Dark mode by default
  - Badge system: "New", "Hot Deal", "Best Seller"

#### Boutique (Fashion Store)
- **Color**: Soft blush (#fdf2f8), rose (#f9a8d4), deep burgundy (#881337)
- **Layout differences**:
  - Editorial/magazine-style hero with large image + overlaid text
  - Lookbook-style product display (2-col asymmetric grid)
  - Size filter chips on collection pages
  - "Complete the Look" outfit builder section
  - Softer rounded corners, more whitespace
  - Instagram-style product hover (quick shop overlay)
  - Customer photo reviews section

#### Grocer (Grocery/Organic Store)
- **Color**: Fresh green (#16a34a), warm yellow (#eab308), cream (#fefce8)
- **Layout differences**:
  - Category-driven homepage with large category cards (Fruits, Vegetables, Dairy, Meat, Bakery)
  - "Fresh Today" badge on products
  - Bulk pricing display (per kg, per dozen)
  - "Add to List" shopping list feature
  - Delivery slot selector
  - Seasonal produce section
  - Organic/eco badges

---

## Implementation Order

### Phase 1: Bug Fixes (Critical — do first)
1. Fix new-store Suspense boundary
2. Fix demo data to be template-specific
3. Add "Customize Store" to merchant sidebar

### Phase 2: New Templates (Major — differentiating)
4. Create Electro template (~1500 lines)
5. Create Boutique template (~1500 lines)
6. Create Grocer template (~1500 lines)

### Phase 3: Integration
7. Register all 3 in registry.tsx
8. Add template-specific demo data
9. Update landing page showcase
10. Build verification

---

## Files to Modify

### Bug Fixes
| File | Change |
|------|--------|
| `apps/web/app/dashboard/new-store/page.tsx` | Add Suspense wrapper around useSearchParams |
| `apps/web/lib/store-templates/shared/demoData.ts` | Template-specific products, collections, store names |
| `apps/web/app/dashboard/layout.tsx` | Add "Customize Store" nav item |
| `apps/web/app/dashboard/customize/page.tsx` | NEW — merchant store customizer page |

### New Templates
| File | Change |
|------|--------|
| `apps/web/lib/store-templates/electro/ElectroStoreFront.tsx` | NEW — electronics template |
| `apps/web/lib/store-templates/boutique/BoutiqueStoreFront.tsx` | NEW — fashion template |
| `apps/web/lib/store-templates/grocer/GrocerStoreFront.tsx` | NEW — grocery template |
| `apps/web/lib/store-templates/registry.tsx` | Register 3 new templates |
| `apps/web/app/page.tsx` | Update landing page template showcase |
