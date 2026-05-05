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
  MessageCircle, Sparkles, Crown, Gem, Palette, Ruler, Scissors
} from "lucide-react"
import type { StoreTemplateProps, StoreProduct, StoreProductReview } from "../types"
import { useCart } from "../shared/context/CartContext"
import { useCustomerAuth } from "../shared/context/CustomerAuthContext"
import { useRecentlyViewed } from "../shared/hooks/useRecentlyViewed"
import { useWishlist } from "../shared/hooks/useWishlist"

type Product = StoreTemplateProps["store"]["products"][0]

// ─── Main Component ───────────────────────────────────────────────────
export default function BoutiqueStoreFront({ store, path = [] }: StoreTemplateProps) {
  return <BoutiqueRouter store={store} path={path} />
}

// ─── Internal Router ─────────────────────────────────────────────────
function BoutiqueRouter({ store, path }: { store: StoreTemplateProps["store"]; path: string[] }) {
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

// ─── Announcement Bar ────────────────────────────────────────────────
function AnnouncementBar() {
  const messages = ["✨ Free shipping on orders over ৳3,000", "🎀 New collection just dropped", "💝 Gift wrapping available"]
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setCurrent(i => (i + 1) % messages.length), 4000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="bg-rose-900 text-rose-100 text-center py-2 text-xs tracking-widest uppercase font-light">
      <span className="transition-all duration-500">{messages[current]}</span>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────
function BoutiqueNavbar({ store }: { store: StoreTemplateProps["store"] }) {
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
      <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"} border-b border-rose-100/50`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
          <Link href={storeLink("")} className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-rose-700" />
            <span className="text-xl font-light tracking-[0.2em] text-rose-950 uppercase">{store.name}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {store.collections.slice(0, 5).map(col => (
              <Link key={col.id} href={storeLink(`collection/${col.slug}`)} className="text-sm tracking-wider text-rose-800 hover:text-rose-600 transition-colors uppercase font-light">
                {col.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href={storeLink("search")} className="p-2 hover:bg-rose-50 rounded-full transition-colors text-rose-700">
              <Search className="w-4 h-4" />
            </Link>
            <Link href={storeLink("wishlist")} className="relative p-2 hover:bg-rose-50 rounded-full transition-colors text-rose-700">
              <Heart className="w-4 h-4" />
              {wishlistIds.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-white text-[10px] rounded-full flex items-center justify-center">{wishlistIds.length}</span>}
            </Link>
            <Link href={storeLink("cart")} className="relative p-2 hover:bg-rose-50 rounded-full transition-colors text-rose-700">
              <ShoppingCart className="w-4 h-4" />
              {cartItems.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-white text-[10px] rounded-full flex items-center justify-center">{cartItems.length}</span>}
            </Link>
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-rose-700">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-white">
          <div className="flex items-center justify-between h-16 px-4 border-b border-rose-100">
            <span className="text-lg font-light tracking-[0.2em] text-rose-950 uppercase">{store.name}</span>
            <button onClick={() => setMobileOpen(false)} className="p-2 text-rose-700"><X className="w-5 h-5" /></button>
          </div>
          <nav className="p-6 space-y-4">
            {store.collections.map(col => (
              <Link key={col.id} href={storeLink(`collection/${col.slug}`)} onClick={() => setMobileOpen(false)} className="block text-lg tracking-wider text-rose-800 hover:text-rose-600 uppercase font-light">
                {col.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-rose-100 space-y-3">
              <Link href={storeLink("search")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-rose-700"><Search className="w-4 h-4" /> Search</Link>
              <Link href={storeLink("wishlist")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-rose-700"><Heart className="w-4 h-4" /> Wishlist</Link>
              <Link href={storeLink("cart")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-rose-700"><ShoppingCart className="w-4 h-4" /> Cart</Link>
              <Link href={storeLink("account")} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-rose-700"><User className="w-4 h-4" /> Account</Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────
function BoutiqueFooter({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink, settings } = useStoreHelpers(store)
  const [subscribed, setSubscribed] = useState(false)
  const handleSubscribe = (e: React.FormEvent) => { e.preventDefault(); setSubscribed(true) }

  return (
    <footer className="bg-rose-950 text-rose-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-rose-300" />
              <span className="text-lg font-light tracking-[0.2em] uppercase">{store.name}</span>
            </div>
            <p className="text-rose-300 text-sm leading-relaxed font-light">{store.description}</p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-rose-900/50 flex items-center justify-center hover:bg-rose-800 transition-colors"><Icon className="w-4 h-4" /></a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm tracking-wider uppercase mb-4 text-rose-200">Collections</h4>
            <div className="space-y-2">
              {store.collections.map(col => (
                <Link key={col.id} href={storeLink(`collection/${col.slug}`)} className="block text-sm text-rose-300 hover:text-white transition-colors font-light">{col.name}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm tracking-wider uppercase mb-4 text-rose-200">Customer Care</h4>
            <div className="space-y-2 text-sm text-rose-300 font-light">
              <p>Shipping & Returns</p>
              <p>Size Guide</p>
              <p>Gift Cards</p>
              <p>Contact Us</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm tracking-wider uppercase mb-4 text-rose-200">Newsletter</h4>
            <p className="text-sm text-rose-300 font-light mb-3">Subscribe for exclusive offers and new arrivals.</p>
            {subscribed ? (
              <p className="text-rose-300 text-sm flex items-center gap-2"><Check className="w-4 h-4" /> Subscribed!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input type="email" placeholder="Your email" className="flex-1 bg-rose-900/50 border border-rose-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-rose-400 focus:outline-none focus:border-rose-600" />
                <button type="submit" className="bg-rose-700 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"><ArrowRight className="w-4 h-4" /></button>
              </form>
            )}
            {settings.phone && <p className="text-sm text-rose-300 mt-4 font-light flex items-center gap-2"><Phone className="w-3 h-3" /> {settings.phone}</p>}
          </div>
        </div>
        <div className="border-t border-rose-900 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-rose-400 font-light">&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-rose-400 font-light">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Product Card (Editorial Style) ──────────────────────────────────
function BoutiqueProductCard({ product, store, formatPrice, storeLink }: { product: Product; store: StoreTemplateProps["store"]; formatPrice: (p: number) => string; storeLink: (s: string) => string }) {
  const { addToCart } = useCart()
  const { toggleWishlist, wishlistIds } = useWishlist(store.id)
  const isWished = wishlistIds.includes(product.id)
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100) : 0

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  return (
    <Link href={storeLink(`product/${product.slug}`)} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-rose-50/50 aspect-[3/4] mb-3">
        <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-rose-700 text-white text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full font-light">
            -{discountPct}%
          </span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button onClick={handleQuickAdd} className="w-full bg-white/95 backdrop-blur-sm text-rose-900 py-2.5 rounded-xl text-xs tracking-wider uppercase font-medium hover:bg-white transition-colors shadow-lg">
            Quick Add
          </button>
        </div>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product) }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white">
          <Heart className={`w-4 h-4 ${isWished ? "fill-rose-600 text-rose-600" : "text-rose-700"}`} />
        </button>
      </div>
      <div className="px-1">
        <h3 className="text-sm font-light text-rose-950 tracking-wide group-hover:text-rose-700 transition-colors">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-rose-900 font-medium">{formatPrice(product.price)}</span>
          {hasDiscount && <span className="text-xs text-rose-400 line-through font-light">{formatPrice(product.comparePrice!)}</span>}
        </div>
        {product.attributes?.color && (
          <p className="text-xs text-rose-400 mt-1 font-light">{product.attributes.color}</p>
        )}
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
    <div className="min-h-screen bg-white">
      {/* Hero - Editorial Lookbook */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-xs tracking-widest uppercase font-light">
                <Sparkles className="w-3 h-3" /> New Season
              </div>
              <h1 className="text-5xl lg:text-7xl font-extralight text-rose-950 leading-[1.1] tracking-tight">
                Elegance<br />
                <span className="font-light italic text-rose-700">Redefined</span>
              </h1>
              <p className="text-rose-600 text-lg font-light max-w-md leading-relaxed">
                Discover our curated collection of timeless pieces designed for the modern woman. Where sophistication meets comfort.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={storeLink("collection/dresses-skirts")} className="inline-flex items-center justify-center gap-2 bg-rose-900 text-white px-8 py-3.5 rounded-xl text-sm tracking-wider uppercase hover:bg-rose-800 transition-colors font-light">
                  Shop Collection <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href={storeLink("")} className="inline-flex items-center justify-center gap-2 border border-rose-300 text-rose-700 px-8 py-3.5 rounded-xl text-sm tracking-wider uppercase hover:bg-rose-50 transition-colors font-light">
                  Lookbook
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-[3/4] bg-rose-100 rounded-3xl overflow-hidden shadow-2xl shadow-rose-200/50">
                <Image src="/placeholder.svg" alt="Featured Look" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl">
                <p className="text-xs text-rose-500 tracking-wider uppercase font-light">Trending Now</p>
                <p className="text-rose-950 font-light mt-1">Silk Blouse Collection</p>
                <p className="text-rose-700 text-sm mt-1">From {formatPrice(2800)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-8 border-y border-rose-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: "Free Shipping", sub: "Orders over ৳3,000" },
              { icon: RefreshCcw, label: "Easy Returns", sub: "30-day policy" },
              { icon: Shield, label: "Secure Payment", sub: "100% protected" },
              { icon: Gem, label: "Premium Quality", sub: "Handpicked items" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-rose-900 tracking-wide">{f.label}</p>
                  <p className="text-[10px] text-rose-400 font-light">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections Grid - Editorial Style */}
      {store.collections.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs tracking-[0.3em] uppercase text-rose-500 font-light mb-3">Curated For You</p>
              <h2 className="text-3xl lg:text-4xl font-extralight text-rose-950 tracking-tight">Shop by Collection</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {store.collections.slice(0, 4).map((col, i) => (
                <Link key={col.id} href={storeLink(`collection/${col.slug}`)} className="group relative overflow-hidden rounded-2xl aspect-[3/4]">
                  <div className={`absolute inset-0 ${["bg-rose-100", "bg-pink-100", "bg-fuchsia-100", "bg-rose-200"][i % 4]}`} />
                  <Image src={col.image || "/placeholder.svg"} alt={col.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-950/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white text-lg font-light tracking-wider">{col.name}</h3>
                    <span className="text-rose-200 text-xs tracking-wider uppercase font-light flex items-center gap-1 mt-1 group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products - Lookbook Grid */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-rose-50/30">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-rose-500 font-light mb-3">Handpicked</p>
                <h2 className="text-3xl lg:text-4xl font-extralight text-rose-950 tracking-tight">Featured Pieces</h2>
              </div>
              <Link href={storeLink("")} className="hidden sm:flex items-center gap-2 text-sm text-rose-700 hover:text-rose-900 tracking-wider uppercase font-light">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map(product => (
                <BoutiqueProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} storeLink={storeLink} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Editorial Banner */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden">
            <div className="aspect-square lg:aspect-auto bg-rose-200 relative">
              <Image src="/placeholder.svg" alt="Editorial" fill className="object-cover" />
            </div>
            <div className="bg-rose-900 flex items-center p-10 lg:p-16">
              <div className="space-y-6">
                <p className="text-xs tracking-[0.3em] uppercase text-rose-300 font-light">Limited Edition</p>
                <h2 className="text-3xl lg:text-4xl font-extralight text-white tracking-tight leading-tight">
                  The Art of<br />Dressing Well
                </h2>
                <p className="text-rose-200 font-light leading-relaxed max-w-sm">
                  Our exclusive capsule collection brings together the finest fabrics and timeless designs. Each piece tells a story of craftsmanship and elegance.
                </p>
                <Link href={storeLink("")} className="inline-flex items-center gap-2 bg-white text-rose-900 px-8 py-3.5 rounded-xl text-sm tracking-wider uppercase hover:bg-rose-50 transition-colors font-medium">
                  Discover Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-rose-500 font-light mb-3">Our Collection</p>
            <h2 className="text-3xl lg:text-4xl font-extralight text-rose-950 tracking-tight">All Pieces</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allProducts.slice(0, 12).map(product => (
              <BoutiqueProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} storeLink={storeLink} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-rose-50/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-rose-500 font-light mb-3">What They Say</p>
            <h2 className="text-3xl font-extralight text-rose-950 tracking-tight">Client Love</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Anika Rahman", text: "The quality is exceptional. Every piece feels luxurious and fits perfectly.", rating: 5 },
              { name: "Tasneem Islam", text: "I love how each item is carefully curated. It's like having a personal stylist.", rating: 5 },
              { name: "Nusrat Jahan", text: "The fabric quality and attention to detail is unmatched. My go-to boutique.", rating: 5 },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-rose-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-rose-500 text-rose-500" />)}
                </div>
                <p className="text-rose-700 font-light leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="text-sm text-rose-900 font-light">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-50">
        <div className="max-w-xl mx-auto px-4 text-center">
          <Sparkles className="w-8 h-8 text-rose-400 mx-auto mb-4" />
          <h2 className="text-3xl font-extralight text-rose-950 tracking-tight mb-3">Stay in the Loop</h2>
          <p className="text-rose-600 font-light mb-8">Get early access to new collections, exclusive offers, and style inspiration.</p>
          <form className="flex gap-3 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault() }}>
            <input type="email" placeholder="Enter your email" className="flex-1 bg-white border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 text-rose-900 placeholder:text-rose-300" />
            <button type="submit" className="bg-rose-900 text-white px-6 py-3 rounded-xl text-sm tracking-wider uppercase hover:bg-rose-800 transition-colors font-light">Subscribe</button>
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
  const { cartItems, addToCart } = useCart()
  const { toggleWishlist, wishlistIds } = useWishlist(store.id)
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

  if (!product) return <div className="min-h-screen flex items-center justify-center bg-white"><p className="text-rose-400 font-light tracking-wider">Product not found</p></div>

  const isWished = wishlistIds.includes(product.id)
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100) : 0
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
    <div className="min-h-screen bg-white">
      <BoutiqueNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <nav className="text-sm text-rose-400 mb-8 flex items-center gap-2 font-light">
          <Link href={storeLink("")} className="hover:text-rose-700">Home</Link>
          <ChevronRight className="w-3 h-3" />
          {product.collectionIds.length > 0 && (() => {
            const col = store.collections.find(c => c.id === product.collectionIds[0])
            return col ? <><Link href={storeLink(`collection/${col.slug}`)} className="hover:text-rose-700">{col.name}</Link><ChevronRight className="w-3 h-3" /></> : null
          })()}
          <span className="text-rose-700">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-rose-50 rounded-2xl overflow-hidden">
              <Image src={product.images[activeImg] || "/placeholder.svg"} alt={product.name} width={600} height={800} className="w-full h-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-colors ${i === activeImg ? "border-rose-600" : "border-rose-100"}`}>
                    <Image src={img || "/placeholder.svg"} alt="" width={80} height={96} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {hasDiscount && <span className="inline-block bg-rose-100 text-rose-700 text-xs tracking-wider uppercase px-3 py-1 rounded-full font-light">Save {discountPct}%</span>}
            <h1 className="text-3xl font-extralight text-rose-950 tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-2xl text-rose-900 font-light">{formatPrice(product.price)}</span>
              {hasDiscount && <span className="text-lg text-rose-400 line-through font-light">{formatPrice(product.comparePrice!)}</span>}
            </div>

            {/* Rating */}
            {(product.averageRating ?? 0) > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(product.averageRating ?? 0) ? "fill-rose-500 text-rose-500" : "text-rose-200"}`} />)}</div>
                <span className="text-sm text-rose-500 font-light">({product.reviewCount} reviews)</span>
              </div>
            )}

            <p className="text-rose-600 font-light leading-relaxed">{product.description}</p>

            {/* Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="space-y-3 border-t border-rose-100 pt-4">
                {Object.entries(product.attributes).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-rose-400 tracking-wider uppercase font-light w-24">{key}</span>
                    <span className="text-sm text-rose-900 font-light">{String(val)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity + Actions */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center border border-rose-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5 text-rose-700 hover:bg-rose-50"><Minus className="w-4 h-4" /></button>
                <span className="px-4 py-2.5 text-sm text-rose-900 min-w-[40px] text-center font-light">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2.5 text-rose-700 hover:bg-rose-50"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 bg-rose-900 text-white py-3 rounded-xl text-sm tracking-wider uppercase hover:bg-rose-800 transition-colors font-light flex items-center justify-center gap-2">
                {addedToCart ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingCart className="w-4 h-4" /> Add to Bag</>}
              </button>
              <button onClick={() => toggleWishlist(product)} className={`p-3 rounded-xl border transition-colors ${isWished ? "border-rose-300 bg-rose-50" : "border-rose-200 hover:bg-rose-50"}`}>
                <Heart className={`w-5 h-5 ${isWished ? "fill-rose-600 text-rose-600" : "text-rose-700"}`} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-rose-100">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: RefreshCcw, label: "Easy Returns" },
                { icon: Shield, label: "Secure Payment" },
                { icon: Package, label: "Gift Wrapping" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-rose-600 font-light">
                  <f.icon className="w-3.5 h-3.5 text-rose-400" /> {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-16 border-t border-rose-100 pt-12">
          <h2 className="text-2xl font-extralight text-rose-950 tracking-tight mb-8">Customer Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-6 mb-8">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-rose-50 pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-rose-500 text-rose-500" : "text-rose-200"}`} />)}</div>
                    <span className="text-sm text-rose-900 font-light">{review.userName}</span>
                    <span className="text-xs text-rose-400 font-light">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.title && <p className="text-sm font-medium text-rose-900 mb-1">{review.title}</p>}
                  <p className="text-sm text-rose-600 font-light">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-rose-400 font-light mb-8">No reviews yet. Be the first to review this product.</p>
          )}
          <form onSubmit={handleReviewSubmit} className="bg-rose-50/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-light text-rose-950">Write a Review</h3>
            <div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <button key={i} type="button" onClick={() => setReviewRating(i + 1)}><Star className={`w-5 h-5 ${i < reviewRating ? "fill-rose-500 text-rose-500" : "text-rose-200"}`} /></button>)}</div>
            <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} placeholder="Review title" className="w-full border border-rose-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 text-rose-900 placeholder:text-rose-300 font-light" />
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." rows={3} className="w-full border border-rose-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 text-rose-900 placeholder:text-rose-300 font-light resize-none" />
            <button type="submit" className="bg-rose-900 text-white px-6 py-2.5 rounded-xl text-sm tracking-wider uppercase hover:bg-rose-800 transition-colors font-light">Submit Review</button>
          </form>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-rose-100 pt-12">
            <h2 className="text-2xl font-extralight text-rose-950 tracking-tight mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => <BoutiqueProductCard key={p.id} product={p} store={store} formatPrice={formatPrice} storeLink={storeLink} />)}
            </div>
          </section>
        )}
      </main>
      <BoutiqueFooter store={store} />
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

  if (!collection) return <div className="min-h-screen flex items-center justify-center bg-white"><p className="text-rose-400 font-light tracking-wider">Collection not found</p></div>

  return (
    <div className="min-h-screen bg-white">
      <BoutiqueNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <nav className="text-sm text-rose-400 mb-6 flex items-center gap-2 font-light">
          <Link href={storeLink("")} className="hover:text-rose-700">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-rose-700">{collection.name}</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extralight text-rose-950 tracking-tight">{collection.name}</h1>
            <p className="text-sm text-rose-500 font-light mt-1">{sorted.length} pieces</p>
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-rose-200 rounded-xl px-4 py-2.5 text-sm text-rose-700 focus:outline-none focus:border-rose-400 font-light">
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-20"><p className="text-rose-400 font-light">No pieces found in this collection.</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sorted.map(p => <BoutiqueProductCard key={p.id} product={p} store={store} formatPrice={formatPrice} storeLink={storeLink} />)}
          </div>
        )}
      </main>
      <BoutiqueFooter store={store} />
    </div>
  )
}

// ─── Cart Page ────────────────────────────────────────────────────────
function CartPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()
  const total = cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)

  return (
    <div className="min-h-screen bg-rose-50/30">
      <BoutiqueNavbar store={store} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extralight text-rose-950 tracking-tight mb-8">Shopping Bag</h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <ShoppingCart className="w-12 h-12 text-rose-200 mx-auto mb-4" />
            <p className="text-rose-400 font-light mb-4">Your bag is empty</p>
            <Link href={storeLink("")} className="inline-flex items-center gap-2 bg-rose-900 text-white px-6 py-3 rounded-xl text-sm tracking-wider uppercase hover:bg-rose-800 transition-colors font-light">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="bg-white rounded-2xl p-4 flex gap-4">
                  <div className="w-20 h-24 bg-rose-50 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} width={80} height={96} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={storeLink(`product/${product.slug}`)} className="text-sm font-light text-rose-950 hover:text-rose-700">{product.name}</Link>
                    <p className="text-sm text-rose-700 mt-1">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-rose-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2 py-1 text-rose-700 hover:bg-rose-50"><Minus className="w-3 h-3" /></button>
                        <span className="px-2 text-xs text-rose-900">{quantity}</span>
                        <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2 py-1 text-rose-700 hover:bg-rose-50"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeFromCart(product.id)} className="text-rose-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-sm text-rose-900 font-light">{formatPrice(product.price * quantity)}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 h-fit">
              <h3 className="text-lg font-light text-rose-950 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-rose-600 font-light"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
                <div className="flex justify-between text-rose-600 font-light"><span>Shipping</span><span>{total >= 3000 ? "Free" : formatPrice(120)}</span></div>
                <div className="border-t border-rose-100 pt-3 flex justify-between text-rose-950 font-medium"><span>Total</span><span>{formatPrice(total + (total >= 3000 ? 0 : 120))}</span></div>
              </div>
              <Link href={storeLink("checkout")} className="block mt-6 bg-rose-900 text-white py-3 rounded-xl text-sm tracking-wider uppercase text-center hover:bg-rose-800 transition-colors font-light">Checkout</Link>
              <button onClick={clearCart} className="w-full mt-2 text-sm text-rose-400 hover:text-rose-600 font-light py-2">Clear Bag</button>
            </div>
          </div>
        )}
      </main>
      <BoutiqueFooter store={store} />
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
  const shipping = total >= 3000 ? 0 : 120

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
          total: total + shipping,
        }),
      })
      if (res.ok) { clearCart(); window.location.href = storeLink("account") }
    } finally { setLoading(false) }
  }

  if (cartItems.length === 0) return <div className="min-h-screen bg-rose-50/30"><BoutiqueNavbar store={store} /><div className="text-center py-20"><p className="text-rose-400 font-light">Your bag is empty</p></div><BoutiqueFooter store={store} /></div>

  return (
    <div className="min-h-screen bg-rose-50/30">
      <BoutiqueNavbar store={store} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extralight text-rose-950 tracking-tight mb-8">Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-light text-rose-950">Contact Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full Name" className="border border-rose-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 font-light" />
                  <input required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" type="email" className="border border-rose-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 font-light" />
                </div>
                <input required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone Number" className="w-full border border-rose-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 font-light" />
              </div>
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-light text-rose-950">Shipping Address</h2>
                <input required value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Street Address" className="w-full border border-rose-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 font-light" />
                <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="City" className="w-full border border-rose-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 font-light" />
              </div>
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-light text-rose-950">Payment</h2>
                {[
                  { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
                  { id: "bkash", label: "bKash", desc: "Mobile banking payment" },
                  { id: "card", label: "Card Payment", desc: "Credit or debit card" },
                ].map(method => (
                  <label key={method.id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === method.id ? "border-rose-400 bg-rose-50" : "border-rose-100 hover:bg-rose-50/50"}`}>
                    <input type="radio" name="payment" value={method.id} checked={form.paymentMethod === method.id} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))} className="accent-rose-700" />
                    <div><p className="text-sm text-rose-900 font-light">{method.label}</p><p className="text-xs text-rose-400 font-light">{method.desc}</p></div>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 h-fit">
              <h3 className="text-lg font-light text-rose-950 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-sm"><span className="text-rose-600 font-light">{product.name} × {quantity}</span><span className="text-rose-900">{formatPrice(product.price * quantity)}</span></div>
                ))}
              </div>
              <div className="border-t border-rose-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-rose-600 font-light"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
                <div className="flex justify-between text-rose-600 font-light"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
                <div className="flex justify-between text-rose-950 font-medium pt-2 border-t border-rose-100"><span>Total</span><span>{formatPrice(total + shipping)}</span></div>
              </div>
              <button type="submit" disabled={loading} className="w-full mt-6 bg-rose-900 text-white py-3 rounded-xl text-sm tracking-wider uppercase hover:bg-rose-800 transition-colors font-light disabled:bg-rose-300">
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </form>
      </main>
      <BoutiqueFooter store={store} />
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Crown className="w-8 h-8 text-rose-700 mx-auto mb-3" />
          <h1 className="text-2xl font-extralight text-rose-950 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-rose-500 font-light mt-1">Sign in to your account</p>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4 font-light">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 font-light" />
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 font-light" />
          <button type="submit" disabled={loading} className="w-full bg-rose-900 text-white py-3 rounded-xl text-sm tracking-wider uppercase hover:bg-rose-800 transition-colors font-light disabled:bg-rose-300">Sign In</button>
        </form>
        <p className="text-center text-sm text-rose-500 font-light mt-6">Don't have an account? <Link href={storeLink("register")} className="text-rose-700 hover:underline">Create one</Link></p>
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Crown className="w-8 h-8 text-rose-700 mx-auto mb-3" />
          <h1 className="text-2xl font-extralight text-rose-950 tracking-tight">Create Account</h1>
          <p className="text-sm text-rose-500 font-light mt-1">Join us for exclusive access</p>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4 font-light">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full Name" className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 font-light" />
          <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 font-light" />
          <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Password" className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 font-light" />
          <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone (optional)" className="w-full border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 font-light" />
          <button type="submit" disabled={loading} className="w-full bg-rose-900 text-white py-3 rounded-xl text-sm tracking-wider uppercase hover:bg-rose-800 transition-colors font-light disabled:bg-rose-300">Create Account</button>
        </form>
        <p className="text-center text-sm text-rose-500 font-light mt-6">Already have an account? <Link href={storeLink("login")} className="text-rose-700 hover:underline">Sign in</Link></p>
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

  if (!customer) return <div className="min-h-screen bg-white flex items-center justify-center"><Link href={storeLink("login")} className="bg-rose-900 text-white px-6 py-3 rounded-xl text-sm tracking-wider uppercase font-light">Sign In</Link></div>

  return (
    <div className="min-h-screen bg-rose-50/30">
      <BoutiqueNavbar store={store} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extralight text-rose-950 tracking-tight">My Account</h1>
            <p className="text-sm text-rose-500 font-light mt-1">Welcome, {customer.name}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-rose-600 hover:text-rose-800 font-light"><LogOut className="w-4 h-4" /> Sign Out</button>
        </div>
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-rose-100">
            <h2 className="text-lg font-light text-rose-950">Order History</h2>
          </div>
          {loadingOrders ? (
            <div className="p-6 text-center"><Loader2 className="w-6 h-6 text-rose-400 animate-spin mx-auto" /></div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center"><p className="text-rose-400 font-light">No orders yet</p></div>
          ) : (
            <div className="divide-y divide-rose-50">
              {orders.map((order: any) => (
                <div key={order.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-rose-900 font-light">#{order.id.slice(-8)}</p>
                    <p className="text-xs text-rose-400 font-light mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-light ${statusColor(order.status)}`}>{order.status}</span>
                  <p className="text-sm text-rose-900 font-light">{formatBDT(order.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BoutiqueFooter store={store} />
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
    <div className="min-h-screen bg-white">
      <BoutiqueNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extralight text-rose-950 tracking-tight">Wishlist</h1>
          {items.length > 0 && <button onClick={clearWishlist} className="text-sm text-rose-400 hover:text-rose-600 font-light">Clear All</button>}
        </div>
        {items.length === 0 ? (
          <div className="text-center py-20"><Heart className="w-12 h-12 text-rose-200 mx-auto mb-4" /><p className="text-rose-400 font-light mb-4">Your wishlist is empty</p><Link href={storeLink("")} className="text-sm text-rose-700 hover:underline font-light">Browse Collections</Link></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map(p => <BoutiqueProductCard key={p.id} product={p} store={store} formatPrice={formatPrice} storeLink={storeLink} />)}
          </div>
        )}
      </main>
      <BoutiqueFooter store={store} />
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
    <div className="min-h-screen bg-white">
      <BoutiqueNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extralight text-rose-950 tracking-tight mb-8">Search</h1>
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search for pieces..." className="w-full border border-rose-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-rose-400 font-light" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 font-light">
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
        {sorted.length === 0 ? (
          <div className="text-center py-20"><p className="text-rose-400 font-light">No pieces found matching &ldquo;{searchQuery}&rdquo;</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sorted.map(p => <BoutiqueProductCard key={p.id} product={p} store={store} formatPrice={formatPrice} storeLink={storeLink} />)}
          </div>
        )}
      </main>
      <BoutiqueFooter store={store} />
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
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 w-10 h-10 bg-rose-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-800 transition-colors z-40">
      <ArrowUp className="w-4 h-4" />
    </button>
  )
}
