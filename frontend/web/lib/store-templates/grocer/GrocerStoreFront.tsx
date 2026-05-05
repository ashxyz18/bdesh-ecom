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
  MessageCircle, Leaf, Apple, Carrot, Milk, Wheat, Flower2, Sun,
  Droplets, BadgePercent, Store, Tag
} from "lucide-react"
import type { StoreTemplateProps, StoreProduct, StoreProductReview } from "../types"
import { useCart } from "../shared/context/CartContext"
import { useCustomerAuth } from "../shared/context/CustomerAuthContext"
import { useRecentlyViewed } from "../shared/hooks/useRecentlyViewed"
import { useWishlist } from "../shared/hooks/useWishlist"

type Product = StoreTemplateProps["store"]["products"][0]

// ─── Main Component ───────────────────────────────────────────────────
export default function GrocerStoreFront({ store, path = [] }: StoreTemplateProps) {
  return <GrocerRouter store={store} path={path} />
}

// ─── Internal Router ─────────────────────────────────────────────────
function GrocerRouter({ store, path }: { store: StoreTemplateProps["store"]; path: string[] }) {
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
    return settings.currency === "BDT" ? `৳${num.toLocaleString()}` : `$${num.toLocaleString()}`
  }
  const storeLink = (subpath: string) => `/${store.subdomain}${subpath ? `/${subpath}` : ""}`
  return { formatPrice, storeLink, theme, settings }
}

// ─── Category Icons ───────────────────────────────────────────────────
const categoryIcons: Record<string, React.ElementType> = {
  "rice-grains": Wheat,
  "dairy-eggs": Milk,
  "honey-spices": Flower2,
  "bakery": Apple,
}

// ─── Announcement Bar ────────────────────────────────────────────────
function AnnouncementBar() {
  const messages = ["🥬 Fresh produce delivered daily", "🚚 Free delivery on orders over ৳500", "🌿 100% organic & locally sourced"]
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setCurrent(i => (i + 1) % messages.length), 4000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="bg-green-700 text-green-50 text-center py-2 text-xs tracking-wide font-medium">
      <span className="transition-all duration-500">{messages[current]}</span>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────
function GrocerNavbar({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { cartItems } = useCart()
  const { wishlistIds } = useWishlist(store.id)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"} border-b border-green-100`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
          <Link href={storeLink("")} className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600" />
            <span className="text-xl font-bold text-green-900">{store.name}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {store.collections.slice(0, 6).map(col => {
              const Icon = categoryIcons[col.slug] || Tag
              return (
                <Link key={col.id} href={storeLink(`collection/${col.slug}`)} className="flex items-center gap-1.5 text-sm text-green-800 hover:text-green-600 transition-colors font-medium">
                  <Icon className="w-4 h-4" /> {col.name}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href={storeLink("search")} className="p-2 hover:bg-green-50 rounded-full transition-colors text-green-700">
              <Search className="w-5 h-5" />
            </Link>
            <Link href={storeLink("wishlist")} className="relative p-2 hover:bg-green-50 rounded-full transition-colors text-green-700">
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-600 text-white text-[10px] rounded-full flex items-center justify-center">{wishlistIds.length}</span>}
            </Link>
            <Link href={storeLink("cart")} className="relative p-2 hover:bg-green-50 rounded-full transition-colors text-green-700">
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-600 text-white text-[10px] rounded-full flex items-center justify-center">{cartItems.length}</span>}
            </Link>
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-green-700">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-white">
          <div className="flex items-center justify-between h-16 px-4 border-b border-green-100">
            <span className="text-lg font-bold text-green-900">{store.name}</span>
            <button onClick={() => setMobileOpen(false)} className="p-2 text-green-700"><X className="w-5 h-5" /></button>
          </div>
          <nav className="p-6 space-y-4">
            {store.collections.map(col => (
              <Link key={col.id} href={storeLink(`collection/${col.slug}`)} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-lg text-green-800 hover:text-green-600 font-medium">
                {(() => { const Icon = categoryIcons[col.slug] || Tag; return <Icon className="w-5 h-5" /> })()}
                {col.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-green-100 space-y-3">
              <Link href={storeLink("search")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-green-700"><Search className="w-5 h-5" /> Search</Link>
              <Link href={storeLink("wishlist")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-green-700"><Heart className="w-5 h-5" /> Wishlist</Link>
              <Link href={storeLink("cart")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-green-700"><ShoppingCart className="w-5 h-5" /> Cart</Link>
              <Link href={storeLink("account")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-green-700"><User className="w-5 h-5" /> Account</Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────
function GrocerFooter({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink, settings } = useStoreHelpers(store)
  const [subscribed, setSubscribed] = useState(false)
  const handleSubscribe = (e: React.FormEvent) => { e.preventDefault(); setSubscribed(true) }

  return (
    <footer className="bg-green-950 text-green-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-5 h-5 text-green-400" />
              <span className="text-lg font-bold">{store.name}</span>
            </div>
            <p className="text-green-300 text-sm leading-relaxed">{store.description}</p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-green-900/50 flex items-center justify-center hover:bg-green-800 transition-colors"><Icon className="w-4 h-4" /></a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase mb-4 text-green-200">Categories</h4>
            <div className="space-y-2">
              {store.collections.map(col => (
                <Link key={col.id} href={storeLink(`collection/${col.slug}`)} className="block text-sm text-green-300 hover:text-white transition-colors">{col.name}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase mb-4 text-green-200">Customer Care</h4>
            <div className="space-y-2 text-sm text-green-300">
              <p>Delivery Information</p>
              <p>Return Policy</p>
              <p>Freshness Guarantee</p>
              <p>Bulk Orders</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase mb-4 text-green-200">Newsletter</h4>
            <p className="text-sm text-green-300 mb-3">Get weekly deals and seasonal updates.</p>
            {subscribed ? (
              <p className="text-green-300 text-sm flex items-center gap-2"><Check className="w-4 h-4" /> Subscribed!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input type="email" placeholder="Your email" className="flex-1 bg-green-900/50 border border-green-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-green-400 focus:outline-none focus:border-green-600" />
                <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"><ArrowRight className="w-4 h-4" /></button>
              </form>
            )}
            {settings.phone && <p className="text-sm text-green-300 mt-4 flex items-center gap-2"><Phone className="w-3 h-3" /> {settings.phone}</p>}
          </div>
        </div>
        <div className="border-t border-green-900 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-green-400">&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-green-400">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Product Card (Grocery Style) ──────────────────────────────────
function GrocerProductCard({ product, store, formatPrice, storeLink }: { product: Product; store: StoreTemplateProps["store"]; formatPrice: (p: number) => string; storeLink: (s: string) => string }) {
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist(store.id)
  const isWished = isInWishlist(product.id)
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100) : 0
  const attrs = product.attributes || {}

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  return (
    <Link href={storeLink(`product/${product.slug}`)} className="group block bg-white border border-green-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-green-100/50 transition-all duration-300">
      <div className="relative aspect-square bg-green-50 overflow-hidden">
        <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="280px" />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discountPct}%</span>
        )}
        {attrs.freshness === "Today" && (
          <span className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Sun className="w-3 h-3" /> Fresh</span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button onClick={handleQuickAdd} className="w-10 h-10 bg-green-600 hover:bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product) }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white">
          <Heart className={`w-4 h-4 ${isWished ? "fill-red-500 text-red-500" : "text-green-700"}`} />
        </button>
        {attrs.freshness === "Today" && <span className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Sun className="w-3 h-3" /> Fresh</span>}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-green-950 group-hover:text-green-700 transition-colors line-clamp-1">{product.name}</h3>
        {attrs.weight && <p className="text-xs text-green-500 mt-0.5">{String(attrs.weight)}</p>}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-bold text-green-900">{formatPrice(product.price)}</span>
          {hasDiscount && <span className="text-xs text-green-400 line-through">{formatPrice(product.comparePrice!)}</span>}
        </div>
        <button onClick={handleQuickAdd} className="w-full mt-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
          <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
        </button>
      </div>
    </Link>
  )
}

// ─── Home Page ────────────────────────────────────────────────────────
function HomePage({ store }: { store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const featuredProducts = store.products.filter(p => p.featured)
  const allProducts = store.products.filter(p => p.status === "active")

  return (
    <div className="min-h-screen bg-green-50/30">
      {/* Hero - Fresh & Local */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-green-100 px-4 py-2 rounded-full text-sm">
                <Leaf className="w-4 h-4" /> Farm Fresh Daily
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Fresh Groceries,<br />
                <span className="text-green-200">Delivered to You</span>
              </h1>
              <p className="text-green-100 text-lg max-w-md">
                Get farm-fresh produce, organic essentials, and daily groceries delivered straight to your doorstep. Quality you can taste.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={storeLink("")} className="inline-flex items-center justify-center gap-2 bg-white text-green-800 px-8 py-3.5 rounded-xl font-bold hover:bg-green-50 transition-colors">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href={storeLink("")} className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                  View Deals
                </Link>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4">
              {[
                { icon: Apple, label: "Fruits & Veggies", color: "bg-green-500/20" },
                { icon: Milk, label: "Dairy & Eggs", color: "bg-blue-500/20" },
                { icon: Wheat, label: "Rice & Grains", color: "bg-amber-500/20" },
                { icon: Flower2, label: "Spices & Honey", color: "bg-orange-500/20" },
              ].map((cat, i) => (
                <div key={i} className={`${cat.color} backdrop-blur-sm rounded-2xl p-6 text-center text-white`}>
                  <cat.icon className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm font-semibold">{cat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-6 bg-white border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, label: "Same-Day Delivery", sub: "Order before 2pm" },
              { icon: RefreshCcw, label: "Freshness Guarantee", sub: "100% quality assured" },
              { icon: Shield, label: "Secure Payment", sub: "Multiple options" },
              { icon: Leaf, label: "Organic Options", sub: "Locally sourced" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-900">{f.label}</p>
                  <p className="text-[10px] text-green-500">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      {store.collections.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h2 className="text-2xl font-bold text-green-950 mb-6">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {store.collections.map(col => {
                const Icon = categoryIcons[col.slug] || Tag
                return (
                  <Link key={col.id} href={storeLink(`collection/${col.slug}`)} className="group flex items-center gap-4 bg-white border border-green-100 rounded-2xl p-4 hover:border-green-300 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-950">{col.name}</p>
                      <p className="text-xs text-green-500">{store.products.filter(p => p.collectionIds.includes(col.id)).length} items</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured / Fresh Picks */}
      {featuredProducts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Fresh Picks</p>
                <h2 className="text-2xl font-bold text-green-950">Featured Products</h2>
              </div>
              <Link href={storeLink("")} className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.slice(0, 8).map(product => (
                <GrocerProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} storeLink={storeLink} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Deals Banner */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white">
              <BadgePercent className="w-8 h-8 mb-3" />
              <h3 className="text-xl font-bold mb-2">Weekly Specials</h3>
              <p className="text-green-100 text-sm mb-4">Save up to 30% on selected organic items this week.</p>
              <Link href={storeLink("")} className="inline-flex items-center gap-2 bg-white text-green-800 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors">Shop Deals <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-8 text-white">
              <Truck className="w-8 h-8 mb-3" />
              <h3 className="text-xl font-bold mb-2">Free Delivery</h3>
              <p className="text-amber-100 text-sm mb-4">On all orders above ৳500. Same-day delivery in Dhaka.</p>
              <Link href={storeLink("")} className="inline-flex items-center gap-2 bg-white text-amber-800 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-50 transition-colors">Order Now <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-green-950 mb-6">All Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allProducts.slice(0, 12).map(product => (
              <GrocerProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} storeLink={storeLink} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-green-950 mb-6 text-center">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Kamal Hossain", text: "The freshest vegetables I've found online. Delivery is always on time.", rating: 5 },
              { name: "Rashida Akter", text: "Love the organic options. The honey is absolutely amazing!", rating: 5 },
              { name: "Farid Miah", text: "Great prices and quality. My family's go-to for weekly groceries.", rating: 5 },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-green-100">
                <div className="flex gap-1 mb-3">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-green-700 text-sm leading-relaxed mb-3">&ldquo;{t.text}&rdquo;</p>
                <p className="text-sm font-semibold text-green-900">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 bg-green-100/50">
        <div className="max-w-xl mx-auto px-4 text-center">
          <Leaf className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-green-950 mb-2">Stay Fresh</h2>
          <p className="text-green-600 text-sm mb-6">Get weekly deals, seasonal recipes, and new product alerts.</p>
          <form className="flex gap-3 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault() }}>
            <input type="email" placeholder="Enter your email" className="flex-1 bg-white border border-green-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 text-green-900 placeholder:text-green-300" />
            <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-500 transition-colors">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  )
}

// ─── Product Page ─────────────────────────────────────────────────────
function ProductPage({ store, slug }: { store: StoreTemplateProps["store"]; slug?: string }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const product = store.products.find(p => p.slug === slug)
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist(store.id)
  const { addProduct } = useRecentlyViewed(store.id)
  const { customer } = useCustomerAuth()
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviews, setReviews] = useState<StoreProductReview[]>(product?.reviews || [])
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => { if (product) addProduct(product) }, [product])

  if (!product) return <div className="min-h-screen flex items-center justify-center bg-green-50/30"><p className="text-green-400 font-semibold">Product not found</p></div>

  const isWished = isInWishlist(product.id)
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100) : 0
  const attrs = product.attributes || {}
  const relatedProducts = store.products.filter(p => p.id !== product.id && p.collectionIds.some(c => product.collectionIds.includes(c))).slice(0, 4)

  const handleAddToCart = () => {
    addToCart(product, qty)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewText.trim()) return
    const newReview: StoreProductReview = {
      id: `rev-${Date.now()}`, rating: reviewRating, title: reviewTitle, comment: reviewText,
      userName: customer?.name || "Anonymous", createdAt: new Date().toISOString(),
    }
    setReviews(prev => [newReview, ...prev])
    setReviewText(""); setReviewTitle(""); setReviewRating(5)
  }

  return (
    <div className="min-h-screen bg-green-50/30">
      <GrocerNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <nav className="text-sm text-green-400 mb-6 flex items-center gap-2">
          <Link href={storeLink("")} className="hover:text-green-700">Home</Link>
          <ChevronRight className="w-3 h-3" />
          {product.collectionIds.length > 0 && (() => {
            const col = store.collections.find(c => c.id === product.collectionIds[0])
            return col ? <><Link href={storeLink(`collection/${col.slug}`)} className="hover:text-green-700">{col.name}</Link><ChevronRight className="w-3 h-3" /></> : null
          })()}
          <span className="text-green-700">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square bg-green-50 rounded-2xl overflow-hidden">
              <Image src={product.images[activeImg] || "/placeholder.svg"} alt={product.name} width={600} height={600} className="w-full h-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${i === activeImg ? "border-green-500" : "border-green-100"}`}>
                    <Image src={img || "/placeholder.svg"} alt="" width={64} height={64} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            {hasDiscount && <span className="inline-block bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full">Save {discountPct}%</span>}
            <h1 className="text-3xl font-bold text-green-950">{product.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-green-900">{formatPrice(product.price)}</span>
              {hasDiscount && <span className="text-lg text-green-400 line-through">{formatPrice(product.comparePrice!)}</span>}
            </div>

            {(product.averageRating ?? 0) > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(product.averageRating ?? 0) ? "fill-amber-400 text-amber-400" : "text-green-200"}`} />)}</div>
                <span className="text-sm text-green-500">({product.reviewCount} reviews)</span>
              </div>
            )}

            <p className="text-green-700 leading-relaxed">{product.description || ""}</p>

            {/* Attributes */}
            {Object.keys(attrs).length > 0 && (
              <div className="bg-green-50 rounded-xl p-4 space-y-2">
                {Object.entries(attrs).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-green-500 capitalize">{key}</span>
                    <span className="text-green-900 font-semibold">{String(val)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity + Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-green-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-3 text-green-700 hover:bg-green-50"><Minus className="w-4 h-4" /></button>
                <span className="px-4 py-3 text-green-900 font-semibold min-w-[40px] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-3 text-green-700 hover:bg-green-50"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-500 transition-colors flex items-center justify-center gap-2">
                {addedToCart ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
              </button>
              <button onClick={() => toggleWishlist(product)} className={`p-3 rounded-xl border transition-colors ${isWished ? "border-red-200 bg-red-50" : "border-green-200 hover:bg-green-50"}`}>
                <Heart className={`w-5 h-5 ${isWished ? "fill-red-500 text-red-500" : "text-green-700"}`} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-green-100">
              {[
                { icon: Truck, label: "Same-Day Delivery" },
                { icon: RefreshCcw, label: "Freshness Guarantee" },
                { icon: Shield, label: "Secure Payment" },
                { icon: Leaf, label: "Organic Options" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-green-600">
                  <f.icon className="w-4 h-4 text-green-400" /> {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-12 border-t border-green-100 pt-10">
          <h2 className="text-2xl font-bold text-green-950 mb-6">Customer Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4 mb-8">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-green-50 pb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-green-200"}`} />)}</div>
                    <span className="text-sm font-semibold text-green-900">{review.userName}</span>
                    <span className="text-xs text-green-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.title && <p className="text-sm font-semibold text-green-900 mb-0.5">{review.title}</p>}
                  <p className="text-sm text-green-600">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-400 mb-8">No reviews yet. Be the first to review this product.</p>
          )}
          <form onSubmit={handleReviewSubmit} className="bg-green-50 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-green-950">Write a Review</h3>
            <div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <button key={i} type="button" onClick={() => setReviewRating(i + 1)}><Star className={`w-5 h-5 ${i < reviewRating ? "fill-amber-400 text-amber-400" : "text-green-200"}`} /></button>)}</div>
            <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} placeholder="Review title" className="w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 text-green-900 placeholder:text-green-300" />
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." rows={3} className="w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 text-green-900 placeholder:text-green-300 resize-none" />
            <button type="submit" className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-500 transition-colors">Submit Review</button>
          </form>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 border-t border-green-100 pt-10">
            <h2 className="text-2xl font-bold text-green-950 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map(p => <GrocerProductCard key={p.id} product={p} store={store} formatPrice={formatPrice} storeLink={storeLink} />)}
            </div>
          </section>
        )}
      </main>
      <GrocerFooter store={store} />
    </div>
  )
}

// ─── Collection Page ──────────────────────────────────────────────────
function CollectionPage({ store, slug }: { store: StoreTemplateProps["store"]; slug?: string }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const collection = store.collections.find(c => c.slug === slug)
  const products = store.products.filter(p => collection ? p.collectionIds.includes(collection.id) : true)
  const [sortBy, setSortBy] = useState("featured")

  const sorted = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price
      case "price-high": return b.price - a.price
      case "rating": return (b.averageRating || 0) - (a.averageRating || 0)
      default: return a.featured ? -1 : 1
    }
  })

  if (!collection) return <div className="min-h-screen flex items-center justify-center bg-green-50/30"><p className="text-green-400 font-semibold">Category not found</p></div>

  return (
    <div className="min-h-screen bg-green-50/30">
      <GrocerNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <nav className="text-sm text-green-400 mb-4 flex items-center gap-2">
          <Link href={storeLink("")} className="hover:text-green-700">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-green-700">{collection.name}</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-950">{collection.name}</h1>
            <p className="text-sm text-green-500 mt-1">{sorted.length} products</p>
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700 focus:outline-none focus:border-green-400 font-medium">
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-20"><p className="text-green-400">No products in this category.</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorted.map(p => <GrocerProductCard key={p.id} product={p} store={store} formatPrice={formatPrice} storeLink={storeLink} />)}
          </div>
        )}
      </main>
      <GrocerFooter store={store} />
    </div>
  )
}

// ─── Cart Page ────────────────────────────────────────────────────────
function CartPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()
  const total = cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)

  return (
    <div className="min-h-screen bg-green-50/30">
      <GrocerNavbar store={store} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-950 mb-6">Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <ShoppingCart className="w-12 h-12 text-green-200 mx-auto mb-4" />
            <p className="text-green-400 mb-4 font-semibold">Your cart is empty</p>
            <Link href={storeLink("")} className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-500 transition-colors">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="bg-white rounded-2xl p-4 flex gap-4">
                  <div className="w-20 h-20 bg-green-50 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} width={80} height={80} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={storeLink(`product/${product.slug}`)} className="text-sm font-semibold text-green-950 hover:text-green-700">{product.name}</Link>
                    <p className="text-sm text-green-700 font-bold mt-1">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-green-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2 py-1 text-green-700 hover:bg-green-50"><Minus className="w-3 h-3" /></button>
                        <span className="px-2 text-xs text-green-900 font-semibold">{quantity}</span>
                        <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2 py-1 text-green-700 hover:bg-green-50"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeFromCart(product.id)} className="text-green-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-sm text-green-900 font-bold">{formatPrice(product.price * quantity)}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 h-fit">
              <h3 className="text-lg font-bold text-green-950 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-green-600"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
                <div className="flex justify-between text-green-600"><span>Delivery</span><span>{total >= 500 ? "Free" : formatPrice(60)}</span></div>
                <div className="border-t border-green-100 pt-3 flex justify-between text-green-950 font-bold text-lg"><span>Total</span><span>{formatPrice(total + (total >= 500 ? 0 : 60))}</span></div>
              </div>
              <Link href={storeLink("checkout")} className="block mt-6 bg-green-600 text-white py-3 rounded-xl font-bold text-center hover:bg-green-500 transition-colors">Checkout</Link>
              <button onClick={clearCart} className="w-full mt-2 text-sm text-green-400 hover:text-red-500 py-2">Clear Cart</button>
            </div>
          </div>
        )}
      </main>
      <GrocerFooter store={store} />
    </div>
  )
}

// ─── Checkout Page ────────────────────────────────────────────────────
function CheckoutPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink, settings } = useStoreHelpers(store)
  const { cartItems, clearCart } = useCart()
  const { customer } = useCustomerAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: customer?.name || "", email: customer?.email || "", phone: "", address: "", city: "Dhaka", notes: "", paymentMethod: "cod" })
  const total = cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
  const delivery = total >= 500 ? 0 : 60

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/storefront/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store.id, customerName: form.name, customerEmail: form.email, customerPhone: form.phone,
          shippingAddress: `${form.address}, ${form.city}`, paymentMethod: form.paymentMethod,
          items: cartItems.map(({ product, quantity }) => ({ productId: product.id, name: product.name, price: product.price, quantity })),
          total: total + delivery,
        }),
      })
      if (res.ok) { clearCart(); window.location.href = storeLink("account") }
    } finally { setLoading(false) }
  }

  if (cartItems.length === 0) return <div className="min-h-screen bg-green-50/30"><GrocerNavbar store={store} /><div className="text-center py-20"><p className="text-green-400 font-semibold">Your cart is empty</p></div><GrocerFooter store={store} /></div>

  return (
    <div className="min-h-screen bg-green-50/30">
      <GrocerNavbar store={store} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-950 mb-6">Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-green-950">Contact Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full Name" className="border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400" />
                  <input required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" type="email" className="border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400" />
                </div>
                <input required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone Number" className="w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400" />
              </div>
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-green-950">Delivery Address</h2>
                <input required value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Street Address" className="w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400" />
                <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="City" className="w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400" />
              </div>
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-green-950">Payment</h2>
                {[
                  { id: "cod", label: "Cash on Delivery", desc: "Pay when delivered" },
                  { id: "bkash", label: "bKash", desc: "Mobile banking" },
                  { id: "card", label: "Card Payment", desc: "Credit or debit card" },
                ].map(method => (
                  <label key={method.id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === method.id ? "border-green-400 bg-green-50" : "border-green-100 hover:bg-green-50/50"}`}>
                    <input type="radio" name="payment" value={method.id} checked={form.paymentMethod === method.id} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))} className="accent-green-600" />
                    <div><p className="text-sm font-semibold text-green-900">{method.label}</p><p className="text-xs text-green-400">{method.desc}</p></div>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 h-fit">
              <h3 className="text-lg font-bold text-green-950 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-sm"><span className="text-green-600">{product.name} × {quantity}</span><span className="text-green-900 font-semibold">{formatPrice(product.price * quantity)}</span></div>
                ))}
              </div>
              <div className="border-t border-green-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-green-600"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
                <div className="flex justify-between text-green-600"><span>Delivery</span><span>{delivery === 0 ? "Free" : formatPrice(delivery)}</span></div>
                <div className="flex justify-between text-green-950 font-bold text-lg pt-2 border-t border-green-100"><span>Total</span><span>{formatPrice(total + delivery)}</span></div>
              </div>
              <button type="submit" disabled={loading} className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-500 transition-colors disabled:bg-green-300">
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </form>
      </main>
      <GrocerFooter store={store} />
    </div>
  )
}

// ─── Auth Pages ──────────────────────────────────────────────────────
function CustomerLoginPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { login } = useCustomerAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("")
    try { await login(email, password); window.location.href = storeLink("account") }
    catch { setError("Invalid email or password") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-green-50/30 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Leaf className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-green-950">Welcome Back</h1>
          <p className="text-sm text-green-500 mt-1">Sign in to your account</p>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border border-green-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" />
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full border border-green-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" />
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-500 transition-colors disabled:bg-green-300">Sign In</button>
        </form>
        <p className="text-center text-sm text-green-500 mt-6">Don't have an account? <Link href={storeLink("register")} className="text-green-700 font-semibold hover:underline">Create one</Link></p>
      </div>
    </div>
  )
}

function CustomerRegisterPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { register } = useCustomerAuth()
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("")
    try { await register(form); window.location.href = storeLink("account") }
    catch { setError("Registration failed. Email may already be in use.") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-green-50/30 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Leaf className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-green-950">Create Account</h1>
          <p className="text-sm text-green-500 mt-1">Join us for fresh deals</p>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full Name" className="w-full border border-green-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" />
          <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" className="w-full border border-green-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" />
          <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Password" className="w-full border border-green-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" />
          <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone (optional)" className="w-full border border-green-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" />
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-500 transition-colors disabled:bg-green-300">Create Account</button>
        </form>
        <p className="text-center text-sm text-green-500 mt-6">Already have an account? <Link href={storeLink("login")} className="text-green-700 font-semibold hover:underline">Sign in</Link></p>
      </div>
    </div>
  )
}

// ─── Account Page ─────────────────────────────────────────────────────
function CustomerAccountPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { customer, logout } = useCustomerAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch(`/api/${store.id}/orders`)
        if (res.ok) { const data = await res.json(); setOrders(data.orders || []) }
      } catch {} finally { setLoadingOrders(false) }
    }
    fetchOrders()
  }, [store.id])

  const statusColor = (s: string) => {
    switch (s) { case "DELIVERED": return "text-emerald-600 bg-emerald-50"; case "CANCELLED": return "text-red-600 bg-red-50"; default: return "text-amber-600 bg-amber-50" }
  }

  if (!customer) return <div className="min-h-screen bg-green-50/30 flex items-center justify-center"><Link href={storeLink("login")} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold">Sign In</Link></div>

  return (
    <div className="min-h-screen bg-green-50/30">
      <GrocerNavbar store={store} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-950">My Account</h1>
            <p className="text-sm text-green-500 mt-1">Welcome, {customer.name}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 font-semibold"><LogOut className="w-4 h-4" /> Sign Out</button>
        </div>
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-green-100">
            <h2 className="text-lg font-bold text-green-950">Order History</h2>
          </div>
          {loadingOrders ? (
            <div className="p-6 text-center"><Loader2 className="w-6 h-6 text-green-400 animate-spin mx-auto" /></div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center"><p className="text-green-400">No orders yet</p></div>
          ) : (
            <div className="divide-y divide-green-50">
              {orders.map((order: any) => (
                <div key={order.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-900">#{order.id.slice(-8)}</p>
                    <p className="text-xs text-green-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColor(order.status)}`}>{order.status}</span>
                  <p className="text-sm font-bold text-green-900">{formatBDT(order.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <GrocerFooter store={store} />
    </div>
  )
}

function formatBDT(amount: number): string { return `৳${Math.round(amount).toLocaleString()}` }

// ─── Wishlist Page ────────────────────────────────────────────────────
function WishlistPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { getWishlistItems, clearWishlist } = useWishlist(store.id)
  const items = getWishlistItems(store.products)

  return (
    <div className="min-h-screen bg-green-50/30">
      <GrocerNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-950">Wishlist</h1>
          {items.length > 0 && <button onClick={clearWishlist} className="text-sm text-green-400 hover:text-red-500 font-semibold">Clear All</button>}
        </div>
        {items.length === 0 ? (
          <div className="text-center py-20"><Heart className="w-12 h-12 text-green-200 mx-auto mb-4" /><p className="text-green-400 mb-4 font-semibold">Your wishlist is empty</p><Link href={storeLink("")} className="text-sm text-green-700 font-semibold hover:underline">Browse Products</Link></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(p => <GrocerProductCard key={p.id} product={p} store={store} formatPrice={formatPrice} storeLink={storeLink} />)}
          </div>
        )}
      </main>
      <GrocerFooter store={store} />
    </div>
  )
}

// ─── Search Page ──────────────────────────────────────────────────────
function SearchPage({ store, query }: { store: StoreTemplateProps["store"]; query?: string }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const [searchQuery, setSearchQuery] = useState(query || "")
  const [sortBy, setSortBy] = useState("featured")

  const filteredProducts = store.products.filter(p =>
    p.status === "active" && (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const sorted = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price
      case "price-high": return b.price - a.price
      case "rating": return (b.averageRating || 0) - (a.averageRating || 0)
      default: return a.featured ? -1 : 1
    }
  })

  return (
    <div className="min-h-screen bg-green-50/30">
      <GrocerNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-950 mb-6">Search</h1>
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search for products..." className="w-full border border-green-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-green-400" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-green-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 font-medium">
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
        {sorted.length === 0 ? (
          <div className="text-center py-20"><p className="text-green-400">No products found matching &ldquo;{searchQuery}&rdquo;</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorted.map(p => <GrocerProductCard key={p.id} product={p} store={store} formatPrice={formatPrice} storeLink={storeLink} />)}
          </div>
        )}
      </main>
      <GrocerFooter store={store} />
    </div>
  )
}

// ─── Scroll to Top ────────────────────────────────────────────────────
function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])
  if (!visible) return null
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-500 transition-colors z-40">
      <ArrowUp className="w-4 h-4" />
    </button>
  )
}
