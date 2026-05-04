# BdeshShop Template Building Guide

Complete reference for building a new storefront template for the BdeshShop e-commerce platform.

---

## 1. Project Structure

```
apps/web/lib/store-templates/
├── registry.tsx              # Template registration (component map + metadata)
├── types.ts                  # All TypeScript interfaces
├── shared/
│   ├── context/
│   │   ├── CartContext.tsx    # Cart state provider
│   │   └── CustomerAuthContext.tsx  # Customer auth provider
│   ├── hooks/
│   │   ├── useWishlist.ts    # Wishlist state hook
│   │   └── useRecentlyViewed.ts  # Recently viewed hook
│   └── demoData.ts           # Template-specific demo products/collections/themes
├── default/                  # "Modern Shop" template
├── roseo/                    # "Roseo" luxury template
├── shopify/                  # "Minimal" template
├── shopnest/                 # "Shopnest" fashion template
├── food/                     # "Food & Restaurant" template
├── electro/                  # "Electro" electronics template
├── boutique/                 # "Boutique" fashion template
├── grocer/                   # "Grocer" grocery template
└── {your-template}/          # ← YOUR NEW TEMPLATE GOES HERE
    └── {Name}StoreFront.tsx  # Single-file template component
```

---

## 2. Step-by-Step: Create a New Template

### Step 1: Create the Template File

Create `apps/web/lib/store-templates/{template-id}/{Name}StoreFront.tsx`

The file must:
- Start with `"use client"`
- Export **default** a component that accepts `StoreTemplateProps`
- Contain an internal router that maps URL path segments to page components
- Include ALL 10 required pages (see Section 4)

### Step 2: Add Demo Data

In `apps/web/lib/store-templates/shared/demoData.ts`, add:

1. **Products array** — e.g., `const myTemplateProducts = [...]` (6-8 products minimum)
2. **Collections array** — e.g., `const myTemplateCollections = [...]` (3-4 collections)
3. **Theme entry** in `demoThemes` object
4. **Store info entry** in `storeInfo` object
5. **Products map entry** in `productsMap` inside `getDemoStore()`
6. **Collections map entry** in `collectionsMap` inside `getDemoStore()`

### Step 3: Register in Registry

In `apps/web/lib/store-templates/registry.tsx`:

1. Add dynamic import to `templateComponents`:
```tsx
mytemplate: dynamic(() => import('./mytemplate/MyTemplateStoreFront')),
```

2. Add metadata entry to `templateList` array:
```tsx
{
  id: 'mytemplate',
  name: 'My Template',
  tagline: 'Short Tagline',
  description: 'One-line description of the template style and purpose',
  color: 'from-gray-700 to-blue-600',  // Tailwind gradient for preview card
  features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
  isPremium: false,
  defaultColors: {
    primary: '#1e3a5f',
    secondary: '#3b82f6',
    accent: '#eff6ff',
  },
},
```

### Step 4: Add to Landing Page

In `apps/web/app/page.tsx`, add to the `templates` array (around line 15):

```tsx
{
  id: "mytemplate",
  name: "My Template",
  tagline: "Short Tagline",
  description: "One-line description",
  color: "from-gray-700 to-blue-600",
  accent: "text-blue-400",
  category: "General",  // Must match a category in templateCategories
  features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
},
```

If your template needs a new category, add it to the `templateCategories` array:
```tsx
const templateCategories = ["All", "General", "Fashion", "Food", "Electronics", "Grocery", "MyCategory"];
```

---

## 3. Core Types Reference

### StoreTemplateProps (the main prop every template receives)

```typescript
interface StoreTemplateProps {
  store: {
    id: string
    name: string
    slug: string
    subdomain: string
    description: string | null
    logo: string | null
    banner: string | null
    theme: StoreTheme
    settings: StoreSettings
    products: StoreProduct[]
    collections: StoreCollection[]
  }
  path: string[]  // URL path segments after /store?store=xxx&path=...
}
```

### StoreProduct

```typescript
interface StoreProduct {
  id: string
  name: string
  slug: string
  description: string | null       // ⚠️ NULLABLE — always guard with (p.description || "")
  price: number
  comparePrice: number | null      // ⚠️ NULLABLE — use for strikethrough pricing
  images: string[]
  featured: boolean
  status: string
  collectionIds: string[]
  attributes?: Record<string, any> // Custom attributes (color, weight, origin, etc.)
  reviews?: StoreProductReview[]
  averageRating?: number           // ⚠️ UNDEFINED — always guard with (rating ?? 0)
  reviewCount?: number
}
```

### StoreCollection

```typescript
interface StoreCollection {
  id: string
  name: string
  slug: string
  image: string | null
}
```

### StoreTheme

```typescript
interface StoreTheme {
  templateId: string
  primaryColor: string
  secondaryColor: string
  fontHeading?: string
  fontBody?: string
  customization?: Record<string, any>
}
```

### StoreSettings

```typescript
interface StoreSettings {
  whatsapp?: string
  phone?: string
  address?: string
  hours?: string
  currency?: string
  [key: string]: any
}
```

---

## 4. Required Pages (All 10)

Every template MUST implement these pages in its internal router:

| Route Key | URL Pattern | Component | Required? |
|-----------|-------------|-----------|-----------|
| (default) | `/` | HomePage | ✅ Yes |
| `product` | `/product/{slug}` | ProductPage | ✅ Yes |
| `collection` | `/collection/{slug}` | CollectionPage | ✅ Yes |
| `cart` | `/cart` | CartPage | ✅ Yes |
| `checkout` | `/checkout` | CheckoutPage | ✅ Yes |
| `login` | `/login` | CustomerLoginPage | ✅ Yes |
| `register` | `/register` | CustomerRegisterPage | ✅ Yes |
| `account` | `/account` | CustomerAccountPage | ✅ Yes |
| `wishlist` | `/wishlist` | WishlistPage | ✅ Yes |
| `search` | `/search/{query}` | SearchPage | ✅ Yes |

---

## 5. Shared Contexts & Hooks — EXACT API Signatures

### useCart() — from `../shared/context/CartContext`

```typescript
const {
  cartItems,        // CartItem[] — each: { product: StoreProduct, quantity: number, variantId?: string }
  addToCart,        // (product: StoreProduct, quantity?: number, variantId?: string) => void
  removeFromCart,   // (productId: string, variantId?: string) => void
  updateQuantity,   // (productId: string, quantity: number, variantId?: string) => void
  clearCart,        // () => void
  itemCount,        // number — total quantity of items
  subtotal,         // number — total price in BDT
} = useCart()
```

⚠️ **CRITICAL**: `addToCart` takes **positional arguments**, NOT an object:
```tsx
// ✅ CORRECT
addToCart(product, 1)
addToCart(product, quantity)

// ❌ WRONG — will cause TypeScript error
addToCart({ product, quantity: 1 })
```

### useWishlist(storeId) — from `../shared/hooks/useWishlist`

```typescript
const {
  wishlistIds,      // string[] — product IDs in wishlist
  wishlistCount,    // number
  toggleWishlist,   // (product: StoreProduct) => void
  isInWishlist,     // (productId: string) => boolean
  getWishlistItems, // (allProducts: StoreProduct[]) => StoreProduct[]
  clearWishlist,    // () => void
} = useWishlist(store.id)
```

⚠️ **CRITICAL**: The method is `isInWishlist`, NOT `isWishlisted`:
```tsx
// ✅ CORRECT
isInWishlist(product.id)

// ❌ WRONG
isWishlisted(product.id)
```

### useRecentlyViewed(storeId) — from `../shared/hooks/useRecentlyViewed`

```typescript
const {
  recentlyViewedIds,     // string[]
  addProduct,            // (product: StoreProduct) => void
  getRecentlyViewed,     // (allProducts: StoreProduct[]) => StoreProduct[]
  clearRecentlyViewed,   // () => void
} = useRecentlyViewed(store.id)
```

⚠️ **CRITICAL**: The method is `addProduct`, NOT `addRecentlyViewed` or `addViewed`:
```tsx
// ✅ CORRECT
addProduct(product)

// ❌ WRONG
addRecentlyViewed(product)
addViewed(product)
```

### useCustomerAuth() — from `../shared/context/CustomerAuthContext`

```typescript
const {
  customer,   // Customer | null — { id, name, email, phone? }
  isLoading,  // boolean
  login,      // (email: string, password: string) => Promise<void>
  register,   // (data: { name: string, email: string, password: string, phone?: string }) => Promise<void>
  logout,     // () => Promise<void>
} = useCustomerAuth()
```

---

## 6. Boilerplate Template Structure

Copy this as your starting point:

```tsx
"use client"

import React, { useState, useEffect, Fragment } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ShoppingCart, Heart, Menu, X, ChevronDown, ArrowRight, ArrowUp,
  CreditCard, RefreshCcw, Shield, Truck, Minus, Plus, Trash2, Check,
  Search, Phone, MapPin, Mail, Facebook, Instagram, Twitter, Star,
  SlidersHorizontal, Eye, ChevronRight, LogIn, UserPlus, LogOut,
  ClipboardList, HeartOff, Loader2, Send, Clock, Package, User,
  MessageCircle
} from "lucide-react"
import type { StoreTemplateProps, StoreProduct, StoreProductReview } from "../types"
import { useCart } from "../shared/context/CartContext"
import { useCustomerAuth } from "../shared/context/CustomerAuthContext"
import { useRecentlyViewed } from "../shared/hooks/useRecentlyViewed"
import { useWishlist } from "../shared/hooks/useWishlist"

type Product = StoreTemplateProps["store"]["products"][0]

// ─── Main Component ───────────────────────────────────────────────────
export default function MyTemplateStoreFront({ store, path = [] }: StoreTemplateProps) {
  return <MyTemplateRouter store={store} path={path} />
}

// ─── Internal Router ─────────────────────────────────────────────────
function MyTemplateRouter({ store, path }: { store: StoreTemplateProps["store"]; path: string[] }) {
  const [page, ...params] = path
  switch (page) {
    case "product": return <ProductPage store={store} slug={params[0]} />
    case "collection": return <CollectionPage store={store} slug={params[0]} />
    case "cart": return <CartPage store={store} />
    case "checkout": return <CheckoutPage store={store} />
    case "login": return <CustomerLoginPage store={store} />
    case "register": return <CustomerRegisterPage store={store} />
    case "account": return <CustomerAccountPage store={store} />
    case "wishlist": return <WishlistPage store={store} />
    case "search": return <SearchPage store={store} query={params[0]} />
    default: return <HomePage store={store} />
  }
}

// ─── Shared Helpers ───────────────────────────────────────────────────
function useStoreHelpers(store: StoreTemplateProps["store"]) {
  const theme = store.theme ?? {}
  const settings = store.settings ?? {}
  const formatPrice = (price: number) => {
    const num = Math.round(Number(price))
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return `৳${formatted}`
  }
  const storeLink = (subpath: string) => {
    const base = `/store?store=${store.subdomain}`
    return subpath ? `${base}&path=${subpath}` : base
  }
  return { theme, settings, formatPrice, storeLink }
}

// ─── Announcement Bar ────────────────────────────────────────────────
function AnnouncementBar() {
  // Rotating announcement messages — customize per template
  const messages = ["🎉 Special Offer — Free Shipping on Orders Over ৳3,000", "📞 Call us at +8801XXXXXXXXX"]
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % messages.length), 4000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="bg-primary text-white text-center py-1.5 text-xs tracking-wider uppercase font-medium">
      <div className="animate-fade-in" key={current}>{messages[current]}</div>
    </div>
  )
}

// ─── Navbar ──────────────────────────────────────────────────────────
function MyTemplateNavbar({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { itemCount } = useCart()
  const { customer, logout } = useCustomerAuth()
  const { wishlistCount } = useWishlist(store.id)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <AnnouncementBar />
      <header className={`sticky top-0 z-50 transition-all ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"} border-b border-gray-100`}>
        <div className="container flex items-center justify-between h-16">
          <Link href={storeLink("")} className="flex items-center gap-2.5">
            <Store className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">{store.name}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href={storeLink("")} className="text-sm font-medium hover:text-primary">Home</Link>
            <Link href={storeLink("collection/all")} className="text-sm font-medium hover:text-primary">Shop</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href={storeLink("search")} className="p-2.5 hover:bg-gray-50 rounded-full"><Search className="w-5 h-5" /></Link>
            <Link href={storeLink("wishlist")} className="relative p-2.5 hover:bg-gray-50 rounded-full">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{wishlistCount}</span>}
            </Link>
            <Link href={storeLink("cart")} className="relative p-2.5 hover:bg-gray-50 rounded-full">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">{itemCount}</span>}
            </Link>
            {customer ? (
              <button onClick={logout} className="p-2.5 hover:bg-gray-50 rounded-full"><LogOut className="w-5 h-5" /></button>
            ) : (
              <Link href={storeLink("login")} className="p-2.5 hover:bg-gray-50 rounded-full"><User className="w-5 h-5" /></Link>
            )}
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2.5"><Menu className="w-5 h-5" /></button>
          </div>
        </div>
      </header>
      {/* Mobile menu overlay — implement per template style */}
    </>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────
function MyTemplateFooter({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">{store.name}</h3>
            <p className="text-gray-400 text-sm">{store.description}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href={storeLink("")} className="block text-gray-400 hover:text-white text-sm">Home</Link>
              <Link href={storeLink("collection/all")} className="block text-gray-400 hover:text-white text-sm">Shop</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-400 text-sm">
              {store.settings?.phone && <p>📞 {store.settings.phone}</p>}
              {store.settings?.address && <p>📍 {store.settings.address}</p>}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <div key={i} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer"><Icon className="w-5 h-5" /></div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} {store.name}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

// ─── Product Card ────────────────────────────────────────────────────
function MyTemplateProductCard({ product, store }: { product: Product; store: StoreTemplateProps["store"] }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist(store.id)
  const { addProduct } = useRecentlyViewed(store.id)
  const wishlisted = isInWishlist(product.id)

  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={storeLink(`product/${product.slug}`)} onClick={() => addProduct(product)} className="block relative aspect-square bg-gray-50">
        {product.images[0] ? (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full"><ShoppingBag className="w-10 h-10 text-gray-300" /></div>
        )}
        {product.comparePrice && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
          </span>
        )}
      </Link>
      <div className="p-4">
        <Link href={storeLink(`product/${product.slug}`)} onClick={() => addProduct(product)}>
          <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">{formatPrice(product.price)}</span>
          {product.comparePrice && <span className="text-sm text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>}
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => addToCart(product, 1)} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
            Add to Cart
          </button>
          <button onClick={() => toggleWishlist(product)} className={`p-2 rounded-lg border ${wishlisted ? "bg-red-50 border-red-200" : "border-gray-200 hover:bg-gray-50"}`}>
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Star Rating ─────────────────────────────────────────────────────
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "w-3.5 h-3.5" : size === "md" ? "w-4 h-4" : "w-5 h-5"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} className={`${sizeClass} ${star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
      ))}
    </div>
  )
}

// ─── HOME PAGE ────────────────────────────────────────────────────────
function HomePage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const featuredProducts = store.products.filter(p => p.featured)
  const allProducts = store.products

  return (
    <div className="min-h-screen bg-white">
      <MyTemplateNavbar store={store} />
      
      {/* Hero Section — customize this heavily per template */}
      <section className="relative bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{store.name}</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">{store.description}</p>
          <Link href={storeLink("collection/all")}>
            <button className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90">
              Shop Now <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <MyTemplateProductCard key={product.id} product={product} store={store} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">All Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allProducts.map(product => (
              <MyTemplateProductCard key={product.id} product={product} store={store} />
            ))}
          </div>
        </div>
      </section>

      <MyTemplateFooter store={store} />
    </div>
  )
}

// ─── PRODUCT PAGE ─────────────────────────────────────────────────────
function ProductPage({ store, slug }: { store: StoreTemplateProps["store"]; slug?: string }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist(store.id)
  const { addProduct } = useRecentlyViewed(store.id)
  const [qty, setQty] = useState(1)

  const product = store.products.find(p => p.slug === slug)
  if (!product) return <NotFound store={store} message="Product not found" />

  // Track recently viewed
  useEffect(() => { addProduct(product) }, [product.id])

  const wishlisted = isInWishlist(product.id)
  const relatedProducts = store.products.filter(p => p.id !== product.id && p.collectionIds.some(c => product.collectionIds.includes(c))).slice(0, 4)

  return (
    <div className="min-h-screen bg-white">
      <MyTemplateNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href={storeLink("")}>Home</Link>
          <ChevronRight className="w-3 h-3" />
          {product.collectionIds.length > 0 && (() => {
            const col = store.collections.find(c => c.id === product.collectionIds[0])
            return col ? <><Link href={storeLink(`collection/${col.slug}`)}>{col.name}</Link><ChevronRight className="w-3 h-3" /></> : null
          })()}
          <span className="text-gray-600">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
              {product.images[0] ? (
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full"><ShoppingBag className="w-16 h-16 text-gray-300" /></div>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            {(product.averageRating ?? 0) > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={product.averageRating ?? 0} />
                <span className="text-sm text-gray-500">({product.reviewCount ?? 0})</span>
              </div>
            )}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.comparePrice && <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>}
            </div>
            {product.description && <p className="text-gray-600 mb-6">{product.description}</p>}

            {/* Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="mb-6 space-y-2">
                {Object.entries(product.attributes).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className="font-medium capitalize text-gray-700">{key}:</span>
                    <span className="text-gray-500">{String(val)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Add to Cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
                <span className="px-4 font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-2 hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={() => addToCart(product, qty)} className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90">
                Add to Cart
              </button>
              <button onClick={() => toggleWishlist(product)} className={`p-3 rounded-lg border ${wishlisted ? "bg-red-50 border-red-200" : "border-gray-200 hover:bg-gray-50"}`}>
                <Heart className={`w-5 h-5 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <section className="mt-12 border-t pt-8">
            <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>
            <div className="space-y-4">
              {product.reviews.map(review => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} size="sm" />
                    {review.title && <span className="font-medium text-sm">{review.title}</span>}
                  </div>
                  {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                  <p className="text-xs text-gray-400 mt-2">{review.userName} • {new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 border-t pt-8">
            <h2 className="text-xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(p => <MyTemplateProductCard key={p.id} product={p} store={store} />)}
            </div>
          </section>
        )}
      </main>
      <MyTemplateFooter store={store} />
    </div>
  )
}

// ─── COLLECTION PAGE ──────────────────────────────────────────────────
function CollectionPage({ store, slug }: { store: StoreTemplateProps["store"]; slug?: string }) {
  const { storeLink } = useStoreHelpers(store)
  const [sortBy, setSortBy] = useState("featured")

  const collection = slug && slug !== "all" ? store.collections.find(c => c.slug === slug) : null
  const products = collection
    ? store.products.filter(p => p.collectionIds.includes(collection.id))
    : store.products

  const sorted = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price
      case "price-high": return b.price - a.price
      case "newest": return 0
      default: return a.featured ? -1 : 1
    }
  })

  return (
    <div className="min-h-screen bg-white">
      <MyTemplateNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href={storeLink("")}>Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">{collection?.name || "All Products"}</span>
        </nav>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{collection?.name || "All Products"}</h1>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        {sorted.length === 0 ? (
          <div className="text-center py-20"><p className="text-gray-400">No products found</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sorted.map(p => <MyTemplateProductCard key={p.id} product={p} store={store} />)}
          </div>
        )}
      </main>
      <MyTemplateFooter store={store} />
    </div>
  )
}

// ─── CART PAGE ────────────────────────────────────────────────────────
function CartPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const { cartItems, removeFromCart, updateQuantity, subtotal } = useCart()

  return (
    <div className="min-h-screen bg-white">
      <MyTemplateNavbar store={store} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Your cart is empty</p>
            <Link href={storeLink("collection/all")}><button className="bg-primary text-white px-6 py-2 rounded-lg">Continue Shopping</button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-4 border rounded-lg p-4">
                <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden relative flex-shrink-0">
                  {product.images[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover" /> : <div className="flex items-center justify-center h-full"><ShoppingBag className="w-6 h-6 text-gray-300" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <p className="text-primary font-bold">{formatPrice(product.price)}</p>
                </div>
                <div className="flex items-center border rounded-lg">
                  <button onClick={() => updateQuantity(product.id, quantity - 1)} className="p-1.5 hover:bg-gray-50"><Minus className="w-3 h-3" /></button>
                  <span className="px-3 text-sm">{quantity}</span>
                  <button onClick={() => updateQuantity(product.id, quantity + 1)} className="p-1.5 hover:bg-gray-50"><Plus className="w-3 h-3" /></button>
                </div>
                <button onClick={() => removeFromCart(product.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-lg font-bold">Total: {formatPrice(subtotal)}</span>
              <Link href={storeLink("checkout")}><button className="bg-primary text-white px-8 py-3 rounded-lg font-medium">Checkout</button></Link>
            </div>
          </div>
        )}
      </main>
      <MyTemplateFooter store={store} />
    </div>
  )
}

// ─── CHECKOUT PAGE ────────────────────────────────────────────────────
function CheckoutPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const { cartItems, subtotal, clearCart } = useCart()
  const { customer } = useCustomerAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: customer?.name || "", phone: customer?.phone || "", address: "", paymentMethod: "cod" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/${store.id}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(({ product, quantity }) => ({ productId: product.id, quantity, price: product.price })),
          shippingAddress: form.address,
          phone: form.phone,
          customerName: form.name,
          paymentMethod: form.paymentMethod,
          total: subtotal,
        }),
      })
      if (res.ok) { clearCart(); alert("Order placed successfully!") }
      else alert("Failed to place order")
    } catch { alert("Something went wrong") }
    finally { setLoading(false) }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <MyTemplateNavbar store={store} />
        <div className="text-center py-20"><p className="text-gray-400">Your cart is empty</p></div>
        <MyTemplateFooter store={store} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <MyTemplateNavbar store={store} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" className="w-full border rounded-lg px-4 py-3" />
            <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone Number" className="w-full border rounded-lg px-4 py-3" />
            <textarea required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Delivery Address" rows={3} className="w-full border rounded-lg px-4 py-3" />
            <div className="space-y-2">
              {[
                { id: "cod", label: "Cash on Delivery" },
                { id: "bkash", label: "bKash" },
                { id: "nagad", label: "Nagad" },
              ].map(method => (
                <label key={method.id} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer ${form.paymentMethod === method.id ? "border-primary bg-primary/5" : "hover:bg-gray-50"}`}>
                  <input type="radio" name="payment" value={method.id} checked={form.paymentMethod === method.id} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="accent-primary" />
                  <span className="text-sm font-medium">{method.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="border rounded-lg p-4 space-y-3">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span>{product.name} × {quantity}</span>
                  <span className="font-medium">{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-medium disabled:opacity-50">
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>
      </main>
      <MyTemplateFooter store={store} />
    </div>
  )
}

// ─── CUSTOMER LOGIN PAGE ─────────────────────────────────────────────
function CustomerLoginPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { login } = useCustomerAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try { await login(email, password) } catch { alert("Invalid credentials") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white">
      <MyTemplateNavbar store={store} />
      <main className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border rounded-lg px-4 py-3" />
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full border rounded-lg px-4 py-3" />
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-medium disabled:opacity-50">Sign In</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account? <Link href={storeLink("register")} className="text-primary font-medium">Register</Link>
        </p>
      </main>
      <MyTemplateFooter store={store} />
    </div>
  )
}

// ─── CUSTOMER REGISTER PAGE ──────────────────────────────────────────
function CustomerRegisterPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { register } = useCustomerAuth()
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try { await register(form) } catch { alert("Registration failed") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white">
      <MyTemplateNavbar store={store} />
      <main className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" className="w-full border rounded-lg px-4 py-3" />
          <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full border rounded-lg px-4 py-3" />
          <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" className="w-full border rounded-lg px-4 py-3" />
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone (optional)" className="w-full border rounded-lg px-4 py-3" />
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-medium disabled:opacity-50">Create Account</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link href={storeLink("login")} className="text-primary font-medium">Sign In</Link>
        </p>
      </main>
      <MyTemplateFooter store={store} />
    </div>
  )
}

// ─── CUSTOMER ACCOUNT PAGE ───────────────────────────────────────────
function CustomerAccountPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { customer, isLoading, logout } = useCustomerAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (customer) {
      fetch(`/api/storefront/orders?storeId=${store.id}&customerId=${customer.id}`)
        .then(r => r.json())
        .then(data => { setOrders(data.orders || []); setLoadingOrders(false) })
        .catch(() => setLoadingOrders(false))
    }
  }, [customer, store.id])

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
  if (!customer) return <NotFound store={store} message="Please sign in to view your account" />

  return (
    <div className="min-h-screen bg-white">
      <MyTemplateNavbar store={store} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Account</h1>
            <p className="text-gray-500">Welcome, {customer.name}</p>
          </div>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"><LogOut className="w-4 h-4" /> Sign Out</button>
        </div>
        <div className="border rounded-lg p-6 mb-8">
          <h2 className="font-semibold mb-4">Profile</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Name:</span> <span className="font-medium">{customer.name}</span></div>
            <div><span className="text-gray-500">Email:</span> <span className="font-medium">{customer.email}</span></div>
            {customer.phone && <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{customer.phone}</span></div>}
          </div>
        </div>
        <h2 className="font-semibold mb-4">Order History</h2>
        {loadingOrders ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> :
         orders.length === 0 ? <p className="text-gray-400">No orders yet</p> :
         <div className="space-y-3">{orders.map((order: any) => <div key={order.id} className="border rounded-lg p-4 flex justify-between items-center"><div><span className="font-medium">#{order.id.slice(-8)}</span><span className="text-sm text-gray-500 ml-2">{new Date(order.createdAt).toLocaleDateString()}</span></div><span className="font-bold">{formatPrice(order.total)}</span></div>)}</div>
        }
      </main>
      <MyTemplateFooter store={store} />
    </div>
  )
}

// ─── WISHLIST PAGE ────────────────────────────────────────────────────
function WishlistPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { getWishlistItems, clearWishlist } = useWishlist(store.id)
  const items = getWishlistItems(store.products)

  return (
    <div className="min-h-screen bg-white">
      <MyTemplateNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Wishlist</h1>
          {items.length > 0 && <button onClick={clearWishlist} className="text-sm text-gray-500 hover:text-red-500">Clear All</button>}
        </div>
        {items.length === 0 ? (
          <div className="text-center py-20"><HeartOff className="w-16 h-16 text-gray-200 mx-auto mb-4" /><p className="text-gray-400">Your wishlist is empty</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map(p => <MyTemplateProductCard key={p.id} product={p} store={store} />)}
          </div>
        )}
      </main>
      <MyTemplateFooter store={store} />
    </div>
  )
}

// ─── SEARCH PAGE ─────────────────────────────────────────────────────
function SearchPage({ store, query }: { store: StoreTemplateProps["store"]; query?: string }) {
  const [searchQuery, setSearchQuery] = useState(query || "")
  const [sortBy, setSortBy] = useState("featured")

  const filtered = store.products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price
      case "price-high": return b.price - a.price
      default: return a.featured ? -1 : 1
    }
  })

  return (
    <div className="min-h-screen bg-white">
      <MyTemplateNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Search</h1>
        <div className="flex gap-4 mb-8">
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="flex-1 border rounded-lg px-4 py-3" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
        {sorted.length === 0 ? (
          <div className="text-center py-20"><p className="text-gray-400">No products found for "{searchQuery}"</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sorted.map(p => <MyTemplateProductCard key={p.id} product={p} store={store} />)}
          </div>
        )}
      </main>
      <MyTemplateFooter store={store} />
    </div>
  )
}

// ─── Not Found ───────────────────────────────────────────────────────
function NotFound({ store, message }: { store: StoreTemplateProps["store"]; message: string }) {
  return (
    <div className="min-h-screen bg-white">
      <MyTemplateNavbar store={store} />
      <div className="text-center py-20"><p className="text-gray-400">{message}</p></div>
      <MyTemplateFooter store={store} />
    </div>
  )
}

// ─── Scroll To Top ───────────────────────────────────────────────────
function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  if (!visible) return null
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90">
      <ArrowUp className="w-4 h-4" />
    </button>
  )
}
```

---

## 7. Demo Data Format

Each template needs 6-8 products and 3-4 collections in `demoData.ts`:

### Product Format

```typescript
{
  id: "template-1",              // Must be unique, prefix with template id
  name: "Product Name",
  slug: "product-slug",          // URL-safe, hyphenated
  description: "Product description here...",
  price: 4500,                   // Price in BDT (integer)
  comparePrice: 5500,            // Original price for strikethrough (or null)
  images: ["/placeholder.svg"],  // Image URLs (placeholder for demo)
  featured: true,                // Show in "Featured" section
  status: "active",
  collectionIds: ["col-1"],      // References to collection IDs
  attributes: { color: "Red", material: "Cotton" },  // Template-specific attributes
  reviews: [
    {
      id: "r1",
      rating: 5,
      title: "Great product!",
      comment: "Detailed review text...",
      userName: "Rahim Ahmed",
      createdAt: "2025-01-15T10:00:00Z",
    },
  ],
  averageRating: 4.5,
  reviewCount: 2,
}
```

### Collection Format

```typescript
{
  id: "col-1",
  name: "Collection Name",
  slug: "collection-slug",
  image: "/placeholder.svg",     // or null
}
```

### Theme Format

```typescript
// Add to demoThemes object
mytemplate: { primaryColor: "#1e3a5f", secondaryColor: "#3b82f6", accent: "#eff6ff" },
```

### Store Info Format

```typescript
// Add to storeInfo object
mytemplate: { name: "My Store Name", description: "Store tagline for the demo preview" },
```

---

## 8. TypeScript Pitfalls — MUST READ

| Pitfall | Wrong | Correct |
|---------|-------|---------|
| `addToCart` signature | `addToCart({ product, quantity: 1 })` | `addToCart(product, 1)` |
| Cart items property | `items` | `cartItems` |
| Remove from cart | `removeItem(id)` | `removeFromCart(id)` |
| Wishlist check | `isWishlisted(id)` | `isInWishlist(id)` |
| Recently viewed add | `addRecentlyViewed(p)` or `addViewed(p)` | `addProduct(p)` |
| Product description | `p.description.toLowerCase()` | `(p.description \|\| "").toLowerCase()` |
| Average rating | `product.averageRating > 0` | `(product.averageRating ?? 0) > 0` |
| Compare price | `product.comparePrice` | `product.comparePrice && ...` (null check) |
| Product images | `product.images[0]` | Always check: `product.images[0] ? ... : fallback` |

---

## 9. Design Differentiation Guidelines

Templates must be **fundamentally different** in layout and feel, not just color swaps. Key differentiation areas:

### Color & Mood
- **Electro**: Dark (gray-950), neon cyan accents, techy
- **Boutique**: Soft blush/rose, editorial, elegant
- **Grocer**: Fresh green, organic, warm yellow accents
- **Food**: Warm orange/red, appetizing
- **Roseo**: Dark luxury, amber/gold accents

### Layout Patterns
- **Hero**: Full-width video vs split-screen vs gradient vs category grid
- **Product cards**: Square vs portrait (3:4) vs landscape, with/without specs overlay
- **Navigation**: Standard navbar vs category icon bar vs sidebar vs mega-menu
- **Footer**: Simple links vs newsletter signup vs Instagram feed

### Unique Features Per Template
- **Electro**: Spec badges on cards, flash sale countdown, category icon bar
- **Boutique**: Lookbook-style hero, Quick Add overlay on hover, editorial typography
- **Grocer**: Freshness badges, weight/origin display, bulk pricing, same-day delivery
- **Food**: Menu categories, WhatsApp ordering, delivery zones

---

## 10. File Checklist

When creating a new template, verify ALL of these:

- [ ] Created `apps/web/lib/store-templates/{id}/{Name}StoreFront.tsx`
- [ ] File starts with `"use client"`
- [ ] Default export accepts `StoreTemplateProps`
- [ ] Internal router handles all 10 page routes
- [ ] Uses `useCart()` with correct API (`addToCart(product, qty)`, `cartItems`, `removeFromCart`)
- [ ] Uses `useWishlist(store.id)` with correct API (`isInWishlist`, `toggleWishlist`)
- [ ] Uses `useRecentlyViewed(store.id)` with correct API (`addProduct`)
- [ ] Uses `useCustomerAuth()` for login/register/account pages
- [ ] All nullable fields guarded (`description || ""`, `averageRating ?? 0`, `comparePrice &&`)
- [ ] Added demo products array to `demoData.ts`
- [ ] Added demo collections array to `demoData.ts`
- [ ] Added theme entry to `demoThemes` in `demoData.ts`
- [ ] Added store info to `storeInfo` in `demoData.ts`
- [ ] Added products/collections to `productsMap`/`collectionsMap` in `getDemoStore()`
- [ ] Added dynamic import to `templateComponents` in `registry.tsx`
- [ ] Added metadata entry to `templateList` in `registry.tsx`
- [ ] Added template entry to `templates` array in `apps/web/app/page.tsx`
- [ ] Added category to `templateCategories` in `apps/web/app/page.tsx` (if new category)
- [ ] Build passes: `cd apps/web && npx next build`
- [ ] Preview works: `http://localhost:3000/preview/{id}`
