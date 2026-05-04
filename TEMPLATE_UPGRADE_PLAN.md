# Full-Scale E-Commerce Template Upgrade Plan

## Problem Statement
The current store templates are too basic — they lack customer authentication pages, product reviews, recently viewed tracking, wishlist functionality, and a template preview system. The user wants **full-scale professional e-commerce websites** where each template has its own registration/login, product pages with reviews, recently viewed sections, hero banners, and interactive features.

---

## Current State Analysis

### What Exists
| Component | Status | Notes |
|-----------|--------|-------|
| 4 registered templates (roseo, default, shopify, shopnest) | ✅ Working | All have HomePage, ProductPage, CollectionPage, CartPage, CheckoutPage |
| Food template | ⚠️ Not registered | Exists in `food/FoodStoreFront.tsx` but not in registry |
| `CartContext` | ✅ Working | Used in all templates via `CartProvider` |
| `CustomerAuthContext` | ⚠️ Not integrated | Exists but NOT wrapped in any template |
| Storefront auth APIs | ✅ Working | `/api/storefront/auth/login` and `/register` exist |
| Review model in Prisma | ✅ Exists | `Review` model with rating, title, comment |
| `StoreProduct` type | ⚠️ Missing fields | No `reviews`, `averageRating`, `reviewCount` |
| Template preview | ❌ Missing | No way to preview templates before choosing |
| Recently viewed | ❌ Missing | No tracking or display |
| Wishlist | ❌ Missing | No wishlist functionality |
| Customer login/register pages | ❌ Missing | Templates have no auth UI pages |
| Customer account page | ❌ Missing | No order history or profile page |

### Template Sub-Page Routing (Current)
Each template receives `path: string[]` and routes internally:
- `[]` → HomePage
- `["product", slug]` → ProductPage
- `["collection", slug]` → CollectionPage
- `["cart"]` → CartPage
- `["checkout"]` → CheckoutPage

### What's Missing in Routing
- `["login"]` → CustomerLoginPage
- `["register"]` → CustomerRegisterPage
- `["account"]` → CustomerAccountPage (order history, profile)
- `["wishlist"]` → WishlistPage
- `["search"]` → SearchPage

---

## Architecture Plan

### Phase 1: Shared Infrastructure

#### 1.1 New Shared Hooks

**`apps/web/lib/store-templates/shared/hooks/useRecentlyViewed.ts`**
```
- Stores recently viewed product IDs in localStorage (key: `recentlyViewed_{storeId}`)
- Max 10 items, most recent first
- addProduct(product) — adds to front, deduplicates
- getRecentlyViewed() — returns product array
- clearRecentlyViewed() — clears all
```

**`apps/web/lib/store-templates/shared/hooks/useWishlist.ts`**
```
- Stores wishlist product IDs in localStorage (key: `wishlist_{storeId}`)
- toggleWishlist(product) — add/remove toggle
- isInWishlist(productId) — check if wishlisted
- getWishlistItems() — returns full product array
- wishlistCount — number of items
```

#### 1.2 Review API Endpoints

**`apps/web/app/api/storefront/reviews/route.ts`** — POST (create review)
- Body: `{ productId, storeId, rating, title?, comment? }`
- Requires customer auth (uses CustomerAuthContext customer ID)

**`apps/web/app/api/storefront/reviews/[productId]/route.ts`** — GET (list reviews)
- Returns reviews for a product with user name and rating
- Query: `?storeId=xxx`

#### 1.3 Update StoreProduct Type

Add to `StoreProduct` in `types.ts`:
```typescript
reviews?: {
  id: string
  rating: number
  title: string | null
  comment: string | null
  userName: string
  createdAt: string
}[]
averageRating?: number
reviewCount?: number
```

#### 1.4 Update Store Page Query

In `apps/web/app/store/[[...path]]/page.tsx`, add reviews to the product query:
```typescript
products: {
  where: { status: "active" },
  include: {
    collections: { select: { id: true } },
    reviews: {
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    },
  },
},
```

Then map reviews into the parsed product data.

#### 1.5 Wrap Templates with CustomerAuthProvider

In `apps/web/app/store/[[...path]]/page.tsx`, wrap the template:
```tsx
<CustomerAuthProvider storeId={parsedStore.id}>
  <CartProvider storeId={parsedStore.id}>
    <StoreTemplate store={parsedStore} path={path || []} />
  </CartProvider>
</CustomerAuthProvider>
```

Currently only `CartProvider` wraps the template. Need to add `CustomerAuthProvider` as outer wrapper.

---

### Phase 2: Template Preview System

#### 2.1 Preview Route

**`apps/web/app/preview/[templateId]/page.tsx`**
- Server component that renders a template with demo data
- Uses hardcoded demo products, collections, store info
- Shows a floating "Preview Mode" banner with:
  - Template name
  - "Use This Template" button → links to `/dashboard/new-store?template={templateId}`
  - "Back to Templates" button → links to `/register` or landing page
- Demo data includes: 8-12 products, 3-4 collections, store banner, logo placeholder

#### 2.2 Demo Data File

**`apps/web/lib/store-templates/shared/demoData.ts`**
- Exports `getDemoStore(templateId: string)` returning a full `StoreTemplateProps["store"]` object
- Products have realistic Bangladeshi e-commerce data (fashion, electronics, etc.)
- Each template gets slightly different demo data to showcase its strengths

#### 2.3 Preview Buttons

**Landing page** (`apps/web/app/page.tsx`):
- Add "Preview" button next to each template card's "Get Started" button
- Links to `/preview/{templateId}`

**New Store page** (`apps/web/app/dashboard/new-store/page.tsx`):
- Add "Preview" button on each template card
- Opens preview in new tab

**Dashboard Settings** (`apps/web/app/dashboard/settings/page.tsx`):
- Add "Preview Store" button that opens the live store

---

### Phase 3: Enhanced Template Features

Each template needs these new sub-pages added to its router:

#### 3.1 Customer Login Page (`["login"]`)
- Email/password form
- "Register" link → navigates to register page
- "Forgot password?" link (placeholder)
- Uses `useCustomerAuth().login()`
- Redirect to account page after login
- Professional design matching template aesthetic

#### 3.2 Customer Register Page (`["register"]`)
- Name, email, phone, password form
- "Already have account? Login" link
- Uses `useCustomerAuth().register()`
- Redirect to account page after registration

#### 3.3 Customer Account Page (`["account"]`)
- **Profile section**: Name, email, phone (editable)
- **Order history**: List of orders with status badges
- **Logout button**
- Requires auth — redirects to login if not authenticated
- Fetch orders from `/api/storefront/orders` (needs new endpoint)

#### 3.4 Wishlist Page (`["wishlist"]`)
- Grid of wishlisted products
- Remove from wishlist button
- Add to cart button
- "Continue Shopping" link if empty
- Uses `useWishlist()` hook

#### 3.5 Search Page (`["search"]`)
- Search input with results
- Filter by collection
- Sort by price/name/date
- Product grid display

#### 3.6 Recently Viewed Section
- Component that shows on HomePage and ProductPage
- Horizontal scrollable row of recently viewed products
- Uses `useRecentlyViewed()` hook
- Auto-tracks when visiting a product page

#### 3.7 Product Reviews Section
- Star rating display (average + count)
- Review list with user name, date, rating, comment
- "Write a Review" form (requires login)
- Star rating input component
- Uses review API endpoints

#### 3.8 Enhanced Hero Banner
- Use `store.banner` image as background
- Overlay with store name, description, CTA
- Animated entrance effects
- Responsive with mobile-optimized layout

---

### Phase 4: Register Food Template

#### 4.1 Add to Registry
In `registry.tsx`:
```typescript
food: dynamic(() => import('./food/FoodStoreFront')),
```

#### 4.2 Add Template Metadata
Add to `templateList`:
```typescript
{
  id: 'food',
  name: 'Food & Restaurant',
  tagline: 'Tasty & Appetizing',
  description: 'Warm, inviting design perfect for restaurants, bakeries, and food delivery',
  color: 'from-orange-500 to-red-600',
  features: ['Menu-style layout', 'Category filters', 'Quick add to cart', 'Delivery info'],
  isPremium: false,
  defaultColors: { primary: '#ea580c', secondary: '#dc2626', accent: '#f97316' },
}
```

#### 4.3 Update Food Template
- Add `CartProvider` and `CustomerAuthProvider` integration
- Add sub-page routing (product, cart, checkout, login, register, account)
- Add recently viewed section
- Add reviews section on product page
- Make it professional-grade like other templates

---

### Phase 5: Polish All Templates

#### 5.1 Consistent Features Across All Templates
Every template must have:
- ✅ HomePage with hero banner, featured products, collections, recently viewed
- ✅ ProductPage with images, reviews, related products, recently viewed
- ✅ CollectionPage with filters and sorting
- ✅ CartPage with quantity controls and checkout link
- ✅ CheckoutPage with shipping form and payment selection
- ✅ CustomerLoginPage
- ✅ CustomerRegisterPage
- ✅ CustomerAccountPage (order history)
- ✅ WishlistPage
- ✅ SearchPage (or search in navbar)
- ✅ Recently viewed section
- ✅ Product reviews section
- ✅ Navbar with search, cart count, customer auth links
- ✅ Footer with links, newsletter, social

#### 5.2 Loading States
- Add skeleton loading for product grids
- Add loading spinner for page transitions
- Add image placeholder/skeleton

#### 5.3 Toast Notifications
- "Added to cart" toast
- "Added to wishlist" toast
- "Review submitted" toast
- Use a lightweight toast solution (inline, no library)

#### 5.4 Mobile Responsiveness Audit
- Ensure all new pages are mobile-first
- Test navbar collapse on all templates
- Test cart/checkout on mobile

---

## File Structure (New Files)

```
apps/web/
├── app/
│   ├── preview/
│   │   └── [templateId]/
│   │       └── page.tsx                    # Template preview page
│   ├── api/
│   │   └── storefront/
│   │       ├── reviews/
│   │       │   ├── route.ts                # POST create review
│   │       │   └── [productId]/
│   │       │       └── route.ts            # GET list reviews
│   │       └── orders/
│   │           └── route.ts                # GET customer orders (existing, may need update)
│   └── store/
│       └── [[...path]]/
│           └── page.tsx                    # Updated: add reviews, CustomerAuthProvider
├── lib/
│   └── store-templates/
│       ├── shared/
│       │   ├── hooks/
│       │   │   ├── useRecentlyViewed.ts     # Recently viewed tracking
│       │   │   └── useWishlist.ts           # Wishlist management
│       │   ├── demoData.ts                  # Demo data for previews
│       │   └── context/
│       │       ├── CartContext.tsx           # Existing
│       │       └── CustomerAuthContext.tsx   # Existing
│       ├── types.ts                         # Updated: add reviews to StoreProduct
│       ├── registry.tsx                     # Updated: add food template
│       ├── roseo/
│       │   └── RoseoStoreFront.tsx          # Updated: add login, register, account, wishlist, reviews, recently viewed
│       ├── default/
│       │   └── DefaultStoreFront.tsx        # Updated: same additions
│       ├── shopify/
│       │   └── MinimalStoreFront.tsx        # Updated: same additions
│       ├── shopnest/
│       │   └── ShopnestStoreFront.tsx       # Updated: same additions
│       └── food/
│           └── FoodStoreFront.tsx           # Updated: full rewrite with routing, auth, reviews
```

---

## Implementation Order

### Step 1: Shared Infrastructure (no template changes yet)
1. Create `useRecentlyViewed.ts` hook
2. Create `useWishlist.ts` hook
3. Create review API endpoints
4. Update `StoreProduct` type with reviews
5. Update store page query to include reviews
6. Wrap templates with `CustomerAuthProvider` in store page

### Step 2: Template Preview System
1. Create `demoData.ts` with realistic demo data
2. Create preview route `/preview/[templateId]`
3. Add preview buttons to landing page and new-store page

### Step 3: Enhance Roseo Template (reference implementation)
1. Add login/register/account/wishlist/search pages to router
2. Add recently viewed section to HomePage and ProductPage
3. Add reviews section to ProductPage
4. Add wishlist toggle to ProductCard
5. Add customer auth links to Navbar
6. Enhance hero banner with store.banner image

### Step 4: Apply Same Pattern to Other Templates
1. Default (Modern Shop) template
2. Shopify (Minimal) template
3. Shopnest template
4. Food template (also needs full routing rewrite)

### Step 5: Register Food Template
1. Add to registry.tsx
2. Add to templateList
3. Add to new-store page templates array

### Step 6: Polish & Testing
1. Loading skeletons
2. Toast notifications
3. Mobile responsiveness audit
4. Production build verification

---

## Key Design Decisions

1. **Client-side routing within templates** — All sub-pages (login, register, account, wishlist) are handled by the template's internal router using the `path` prop. No new Next.js routes needed.

2. **localStorage for wishlist & recently viewed** — No server-side storage needed for guest users. Wishlist syncs to customer account only if logged in (future enhancement).

3. **Reviews stored in database** — The `Review` Prisma model already exists. We just need API endpoints and UI.

4. **Customer auth uses existing `CustomerAuthContext`** — Already built, just needs to be wired into templates.

5. **Preview uses demo data, not real stores** — No need to create a real store for preview. Demo data is hardcoded and realistic.

6. **Each template maintains its own visual identity** — Login, register, account pages match each template's design language (colors, fonts, spacing).

7. **Deterministic formatting** — All price formatting uses the regex approach to avoid hydration mismatch.

---

## Estimated Scope

| Phase | Files Modified | Files Created | Complexity |
|-------|---------------|---------------|------------|
| Phase 1: Infrastructure | 3 | 4 | Medium |
| Phase 2: Preview | 3 | 2 | Medium |
| Phase 3: Template Enhancement | 5 | 0 (pages added within existing files) | High |
| Phase 4: Food Template | 3 | 0 | Low |
| Phase 5: Polish | 5 | 1 | Medium |

**Total: ~11 files modified, ~7 files created**

The template files (RoseoStoreFront, DefaultStoreFront, etc.) are the largest changes since each needs 5-6 new page components added internally. Each template file will grow by approximately 300-500 lines.
