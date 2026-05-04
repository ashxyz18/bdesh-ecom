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
  MessageCircle, Cpu, Zap, Monitor, Headphones, Gamepad2, Smartphone,
  Timer, BarChart3, Award, Tag
} from "lucide-react"
import type { StoreTemplateProps, StoreProduct, StoreProductReview } from "../types"
import { useCart } from "../shared/context/CartContext"
import { useCustomerAuth } from "../shared/context/CustomerAuthContext"
import { useRecentlyViewed } from "../shared/hooks/useRecentlyViewed"
import { useWishlist } from "../shared/hooks/useWishlist"

type Product = StoreTemplateProps["store"]["products"][0]

// ─── Main Component ───────────────────────────────────────────────────
export default function ElectroStoreFront({ store, path = [] }: StoreTemplateProps) {
  return <ElectroRouter store={store} path={path} />
}

// ─── Internal Router ─────────────────────────────────────────────────
function ElectroRouter({ store, path }: { store: StoreTemplateProps["store"]; path: string[] }) {
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
  const messages = ["⚡ Flash Sale — Up to 40% Off on Selected Items", "🚚 Free Delivery on Orders Over ৳5,000", "🔧 1-Year Warranty on All Electronics"]
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % messages.length), 4000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="bg-cyan-500 text-black text-center py-1.5 text-xs tracking-wider uppercase font-bold overflow-hidden">
      <div className="animate-fade-in" key={current}>{messages[current]}</div>
    </div>
  )
}

// ─── Category Icons ──────────────────────────────────────────────────
const categoryIcons = [
  { name: "Phones", icon: Smartphone, slug: "phones-watches" },
  { name: "Laptops", icon: Monitor, slug: "laptops" },
  { name: "Audio", icon: Headphones, slug: "audio" },
  { name: "Gaming", icon: Gamepad2, slug: "gaming-accessories" },
  { name: "Watches", icon: Clock, slug: "phones-watches" },
  { name: "Accessories", icon: Cpu, slug: "gaming-accessories" },
]

// ─── Navbar ──────────────────────────────────────────────────────────
function ElectroNavbar({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { itemCount } = useCart()
  const { customer, isLoading, logout } = useCustomerAuth()
  const { wishlistCount } = useWishlist(store.id)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-gray-950/95 backdrop-blur-md shadow-lg shadow-black/20" : "bg-gray-950"} border-b border-gray-800`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={storeLink("")} className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">{store.name}</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              <Link href={storeLink("")} className="text-sm font-medium text-gray-300 hover:text-cyan-400 transition-colors">Home</Link>
              {store.collections.slice(0, 5).map(col => (
                <Link key={col.id} href={storeLink(`collection/${col.slug}`)} className="text-sm font-medium text-gray-300 hover:text-cyan-400 transition-colors">{col.name}</Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link href={storeLink("search")} className="p-2.5 hover:bg-gray-800 rounded-full transition-colors">
                <Search className="w-5 h-5 text-gray-400" />
              </Link>
              <Link href={storeLink("wishlist")} className="relative p-2.5 hover:bg-gray-800 rounded-full transition-colors">
                <Heart className="w-5 h-5 text-gray-400" />
                {wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cyan-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">{wishlistCount}</span>}
              </Link>
              <Link href={storeLink("cart")} className="relative p-2.5 hover:bg-gray-800 rounded-full transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-400" />
                {itemCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cyan-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">{itemCount}</span>}
              </Link>
              {customer ? (
                <Link href={storeLink("account")} className="p-2.5 hover:bg-gray-800 rounded-full transition-colors">
                  <User className="w-5 h-5 text-gray-400" />
                </Link>
              ) : (
                <Link href={storeLink("login")} className="p-2.5 hover:bg-gray-800 rounded-full transition-colors">
                  <LogIn className="w-5 h-5 text-gray-400" />
                </Link>
              )}
              <button onClick={() => setMenuOpen(true)} className="lg:hidden p-2.5 hover:bg-gray-800 rounded-full transition-colors">
                <Menu className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gray-950 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <span className="font-bold text-lg text-white">Menu</span>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400"><X size={20} /></button>
            </div>
            <nav className="p-4 space-y-1">
              <Link href={storeLink("")} onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-cyan-400">Home</Link>
              {store.collections.map(col => (
                <Link key={col.id} href={storeLink(`collection/${col.slug}`)} onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-cyan-400">{col.name}</Link>
              ))}
              <div className="border-t border-gray-800 my-3" />
              {customer ? (
                <>
                  <Link href={storeLink("account")} onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800">My Account</Link>
                  <button onClick={() => { logout(); setMenuOpen(false) }} className="block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-gray-800">Logout</button>
                </>
              ) : (
                <>
                  <Link href={storeLink("login")} onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800">Login</Link>
                  <Link href={storeLink("register")} onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800">Register</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Spec Badge ───────────────────────────────────────────────────────
function SpecBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800/50 rounded px-2 py-1 text-center">
      <p className="text-[9px] text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-xs font-semibold text-cyan-400">{value}</p>
    </div>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────
function ElectroProductCard({ product, store }: { product: Product; store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist(store.id)
  const wishlisted = isInWishlist(product.id)
  const attrs = product.attributes || {}
  const specEntries = Object.entries(attrs).slice(0, 3)
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100) : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  return (
    <Link href={storeLink(`product/${product.slug}`)} className="group block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5">
      <div className="relative aspect-square bg-gray-800 overflow-hidden">
        {product.images[0] && product.images[0] !== "/placeholder.svg" ? (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="280px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Cpu className="w-12 h-12 text-gray-700" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-cyan-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-md">-{discountPct}%</span>
        )}
        {product.featured && !hasDiscount && (
          <span className="absolute top-2 left-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-md">HOT</span>
        )}
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product) }} className="absolute top-2 right-2 w-8 h-8 bg-gray-900/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
          <Heart className={`w-4 h-4 ${wishlisted ? "text-cyan-400 fill-cyan-400" : "text-gray-400"}`} />
        </button>
        <button onClick={handleAddToCart} className="absolute bottom-2 right-2 w-8 h-8 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors line-clamp-2 mb-2">{product.name}</h3>
        {specEntries.length > 0 && (
          <div className="grid grid-cols-3 gap-1 mb-2">
            {specEntries.map(([key, val]) => (
              <SpecBadge key={key} label={key} value={String(val)} />
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-cyan-400">{formatPrice(product.price)}</span>
          {hasDiscount && <span className="text-xs text-gray-500 line-through">{formatPrice(product.comparePrice!)}</span>}
        </div>
      </div>
    </Link>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────
function ElectroFooter({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-black" /></div>
              <span className="text-white font-bold text-lg">{store.name}</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">Your one-stop destination for cutting-edge tech and gadgets.</p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <button key={i} className="w-9 h-9 bg-gray-800 hover:bg-cyan-500/20 rounded-lg flex items-center justify-center transition-colors"><Icon className="w-4 h-4 text-gray-400 hover:text-cyan-400" /></button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Shop</h4>
            <div className="space-y-2">
              {store.collections.slice(0, 5).map(col => (
                <Link key={col.id} href={storeLink(`collection/${col.slug}`)} className="block text-sm text-gray-400 hover:text-cyan-400 transition-colors">{col.name}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Contact Us</p><p>FAQ</p><p>Shipping Policy</p><p>Return Policy</p><p>Warranty</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Newsletter</h4>
            {subscribed ? (
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-sm text-cyan-400">✓ Subscribed!</div>
            ) : (
              <div className="flex gap-2">
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-cyan-500 outline-none" />
                <button onClick={() => { if (email) setSubscribed(true) }} className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-3 py-2 rounded-lg text-sm transition-colors"><Send className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure Payments</span>
            <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Fast Delivery</span>
            <span className="flex items-center gap-1"><RefreshCcw className="w-3 h-3" /> Easy Returns</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Home Page ───────────────────────────────────────────────────────
function HomePage({ store }: { store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { addToCart } = useCart()
  const featuredProducts = store.products.filter(p => p.featured).slice(0, 8)
  const allProducts = store.products.slice(0, 12)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AnnouncementBar />
      <ElectroNavbar store={store} />

      {/* Hero — Featured Deals */}
      <section className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-6">
                <Timer className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-cyan-400">Flash Sale — Ends Tonight</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Next-Gen <span className="text-cyan-400">Tech</span><br />at Best Prices
              </h1>
              <p className="text-gray-400 mb-8 text-lg">Discover the latest smartphones, laptops, and gadgets with exclusive deals and 1-year warranty.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={storeLink("search")} className="inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3.5 rounded-xl transition-colors">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href={storeLink("search")} className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3.5 rounded-xl border border-gray-700 transition-colors">
                  View All Deals
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {featuredProducts.slice(0, 4).map(product => {
                const hasDiscount = product.comparePrice && product.comparePrice > product.price
                return (
                  <Link key={product.id} href={storeLink(`product/${product.slug}`)} className="bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-cyan-500/30 transition-all group">
                    <div className="aspect-square bg-gray-800 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                      {product.images[0] && product.images[0] !== "/placeholder.svg" ? (
                        <Image src={product.images[0]} alt={product.name} width={120} height={120} className="object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <Cpu className="w-8 h-8 text-gray-700" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-300 line-clamp-1">{product.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-sm font-bold text-cyan-400">{formatPrice(product.price)}</span>
                      {hasDiscount && <span className="text-[10px] text-gray-500 line-through">{formatPrice(product.comparePrice!)}</span>}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Category Bar */}
      <section className="bg-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {categoryIcons.map(cat => (
              <Link key={cat.name} href={storeLink(`collection/${cat.slug}`)} className="flex flex-col items-center gap-1.5 min-w-[64px] group">
                <div className="w-12 h-12 bg-gray-800 group-hover:bg-cyan-500/10 rounded-xl flex items-center justify-center transition-colors">
                  <cat.icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <span className="text-[11px] font-medium text-gray-400 group-hover:text-cyan-400 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Featured Products</h2>
              <p className="text-sm text-gray-500 mt-0.5">Handpicked deals with best value</p>
            </div>
            <Link href={storeLink("search")} className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map(product => (
              <ElectroProductCard key={product.id} product={product} store={store} />
            ))}
          </div>
        </section>
      )}

      {/* Features Bar */}
      <section className="bg-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Free Delivery", desc: "On orders over ৳5,000" },
              { icon: Shield, title: "1-Year Warranty", desc: "On all electronics" },
              { icon: RefreshCcw, title: "Easy Returns", desc: "7-day return policy" },
              { icon: CreditCard, title: "Secure Payment", desc: "SSL encrypted checkout" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Products */}
      {allProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">All Products</h2>
            <Link href={storeLink("search")} className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allProducts.map(product => (
              <ElectroProductCard key={product.id} product={product} store={store} />
            ))}
          </div>
        </section>
      )}

      <ElectroFooter store={store} />
      <ScrollToTop />
    </div>
  )
}

// ─── Product Page ─────────────────────────────────────────────────────
function ProductPage({ store, slug }: { store: StoreTemplateProps["store"]; slug?: string }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { addToCart } = useCart()
  const { addProduct } = useRecentlyViewed(store.id)
  const product = store.products.find(p => p.slug === slug)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => { if (product) addProduct(product) }, [product, addProduct])

  if (!product) return <NotFound store={store} message="Product not found" />

  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100) : 0
  const attrs = product.attributes || {}
  const specEntries = Object.entries(attrs)
  const relatedProducts = store.products.filter(p => p.id !== product.id && p.collectionIds.some(c => product.collectionIds.includes(c))).slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AnnouncementBar />
      <ElectroNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href={storeLink("")} className="hover:text-cyan-400">Home</Link>
          <ChevronRight className="w-3 h-3" />
          {product.collectionIds.length > 0 && (() => {
            const col = store.collections.find(c => product.collectionIds.includes(c.id))
            return col ? <><Link href={storeLink(`collection/${col.slug}`)} className="hover:text-cyan-400">{col.name}</Link><ChevronRight className="w-3 h-3" /></> : null
          })()}
          <span className="text-gray-300">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-3">
            <div className="aspect-square bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex items-center justify-center">
              {product.images[selectedImage] && product.images[selectedImage] !== "/placeholder.svg" ? (
                <Image src={product.images[selectedImage]} alt={product.name} width={500} height={500} className="object-cover" />
              ) : (
                <Cpu className="w-24 h-24 text-gray-700" />
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-lg border-2 overflow-hidden ${selectedImage === i ? "border-cyan-500" : "border-gray-800"}`}>
                    {img && img !== "/placeholder.svg" ? <Image src={img} alt="" width={64} height={64} className="object-cover" /> : <div className="w-full h-full bg-gray-800" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {hasDiscount && <span className="inline-block bg-cyan-500/10 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full mb-3">Save {discountPct}%</span>}
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-cyan-400">{formatPrice(product.price)}</span>
              {hasDiscount && <span className="text-lg text-gray-500 line-through">{formatPrice(product.comparePrice!)}</span>}
            </div>
            <p className="text-gray-400 mb-6">{product.description}</p>

            {/* Specs Table */}
            {specEntries.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" /> Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {specEntries.map(([key, val]) => (
                    <div key={key} className="flex justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-500">{key}</span>
                      <span className="text-xs font-medium text-cyan-400">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-gray-700 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-gray-400 hover:text-white"><Minus className="w-4 h-4" /></button>
                <span className="px-4 py-2 text-white font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-gray-400 hover:text-white"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={() => addToCart(product, quantity)} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center"><Truck className="w-5 h-5 text-cyan-400 mx-auto mb-1" /><p className="text-[10px] text-gray-400">Free Delivery</p></div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center"><Shield className="w-5 h-5 text-cyan-400 mx-auto mb-1" /><p className="text-[10px] text-gray-400">1-Year Warranty</p></div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center"><RefreshCcw className="w-5 h-5 text-cyan-400 mx-auto mb-1" /><p className="text-[10px] text-gray-400">7-Day Returns</p></div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="border-t border-gray-800 pt-8">
            <h2 className="text-xl font-bold text-white mb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(p => <ElectroProductCard key={p.id} product={p} store={store} />)}
            </div>
          </section>
        )}
      </main>
      <ElectroFooter store={store} />
      <ScrollToTop />
    </div>
  )
}

// ─── Collection Page ──────────────────────────────────────────────────
function CollectionPage({ store, slug }: { store: StoreTemplateProps["store"]; slug?: string }) {
  const { storeLink } = useStoreHelpers(store)
  const collection = store.collections.find(c => c.slug === slug)
  const products = collection ? store.products.filter(p => p.collectionIds.includes(collection.id)) : store.products
  const [sortBy, setSortBy] = useState("newest")

  const sorted = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price
      case "price-high": return b.price - a.price
      case "name": return a.name.localeCompare(b.name)
      default: return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AnnouncementBar />
      <ElectroNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href={storeLink("")} className="hover:text-cyan-400">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-300">{collection?.name || "All Products"}</span>
        </nav>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">{collection?.name || "All Products"}</h1>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none">
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
        {sorted.length === 0 ? (
          <div className="text-center py-16"><Cpu className="w-12 h-12 text-gray-700 mx-auto mb-3" /><p className="text-gray-500">No products found</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorted.map(p => <ElectroProductCard key={p.id} product={p} store={store} />)}
          </div>
        )}
      </main>
      <ElectroFooter store={store} />
      <ScrollToTop />
    </div>
  )
}

// ─── Cart Page ────────────────────────────────────────────────────────
function CartPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { cartItems, updateQuantity, removeFromCart, itemCount } = useCart()
  const total = cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AnnouncementBar />
      <ElectroNavbar store={store} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Shopping Cart ({itemCount})</h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-16"><ShoppingCart className="w-12 h-12 text-gray-700 mx-auto mb-3" /><p className="text-gray-500 mb-4">Your cart is empty</p><Link href={storeLink("")} className="text-cyan-400 hover:text-cyan-300 font-medium">Continue Shopping</Link></div>
        ) : (
          <div className="space-y-3 mb-6">
            {cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                  {product.images[0] && product.images[0] !== "/placeholder.svg" ? <Image src={product.images[0]} alt={product.name} width={64} height={64} className="object-cover rounded-lg" /> : <Cpu className="w-6 h-6 text-gray-700" />}
                </div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{product.name}</p><p className="text-sm text-cyan-400">{formatPrice(product.price)}</p></div>
                <div className="flex items-center border border-gray-700 rounded-lg">
                  <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2 py-1 text-gray-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                  <span className="px-3 text-sm text-white">{quantity}</span>
                  <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2 py-1 text-gray-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                </div>
                <p className="text-sm font-semibold text-white w-24 text-right">{formatPrice(product.price * quantity)}</p>
                <button onClick={() => removeFromCart(product.id)} className="p-1.5 text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
        {cartItems.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between mb-4"><span className="text-gray-400">Subtotal</span><span className="text-xl font-bold text-cyan-400">{formatPrice(total)}</span></div>
            <Link href={storeLink("checkout")} className="block w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl text-center transition-colors">Proceed to Checkout</Link>
          </div>
        )}
      </main>
      <ElectroFooter store={store} />
    </div>
  )
}

// ─── Checkout Page ─────────────────────────────────────────────────────
function CheckoutPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { cartItems, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const total = cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setSuccess(true)
    clearCart()
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center"><div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-cyan-400" /></div><h2 className="text-2xl font-bold mb-2">Order Placed!</h2><p className="text-gray-400 mb-6">Thank you for your purchase.</p><Link href={storeLink("")} className="text-cyan-400 hover:text-cyan-300 font-medium">Continue Shopping</Link></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AnnouncementBar /><ElectroNavbar store={store} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Delivery Info</h2>
            <input required placeholder="Full Name" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 outline-none" />
            <input required placeholder="Phone Number" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 outline-none" />
            <input required placeholder="Address" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 outline-none" />
            <textarea placeholder="Notes (optional)" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 outline-none h-20" />
            <h2 className="font-semibold text-lg mt-4">Payment Method</h2>
            <div className="space-y-2">
              {["Cash on Delivery", "bKash", "Nagad"].map(m => (
                <label key={m} className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-lg p-3 cursor-pointer hover:border-cyan-500/30">
                  <input type="radio" name="payment" defaultChecked={m === "Cash on Delivery"} className="accent-cyan-500" /><span className="text-sm text-white">{m}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              {cartItems.map(({ product, quantity }) => <div key={product.id} className="flex justify-between text-sm mb-2"><span className="text-gray-400">{product.name} × {quantity}</span><span className="text-white">{formatPrice(product.price * quantity)}</span></div>)}
              <div className="border-t border-gray-800 mt-4 pt-4 flex justify-between"><span className="text-gray-400">Total</span><span className="text-xl font-bold text-cyan-400">{formatPrice(total)}</span></div>
              <button type="submit" disabled={loading || cartItems.length === 0} className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 text-black font-bold py-3 rounded-xl transition-colors">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Place Order"}
              </button>
            </div>
          </div>
        </form>
      </main>
      <ElectroFooter store={store} />
    </div>
  )
}

// ─── Auth Pages ───────────────────────────────────────────────────────
function CustomerLoginPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { login, isLoading } = useCustomerAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try { await login(email, password) } catch { setError("Invalid credentials") }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4"><Zap className="w-6 h-6 text-black" /></div><h1 className="text-2xl font-bold">Sign In</h1><p className="text-gray-400 text-sm mt-1">to {store.name}</p></div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 outline-none" />
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 outline-none" />
          <button type="submit" disabled={isLoading} className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 text-black font-bold py-2.5 rounded-lg transition-colors">{isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Sign In"}</button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-4">Don't have an account? <Link href={storeLink("register")} className="text-cyan-400 hover:text-cyan-300">Register</Link></p>
      </div>
    </div>
  )
}

function CustomerRegisterPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { register, isLoading } = useCustomerAuth()
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try { await register(form) } catch { setError("Registration failed") }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4"><Zap className="w-6 h-6 text-black" /></div><h1 className="text-2xl font-bold">Create Account</h1></div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 outline-none" />
          <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 outline-none" />
          <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 outline-none" />
          <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 outline-none" />
          <button type="submit" disabled={isLoading} className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 text-black font-bold py-2.5 rounded-lg transition-colors">{isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Account"}</button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-4">Already have an account? <Link href={storeLink("login")} className="text-cyan-400 hover:text-cyan-300">Sign In</Link></p>
      </div>
    </div>
  )
}

// ─── Account Page ─────────────────────────────────────────────────────
function CustomerAccountPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { customer, isLoading, logout } = useCustomerAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try { const res = await fetch(`/api/${store.id}/orders`); if (res.ok) { const data = await res.json(); setOrders(data.orders || []) } } catch {} finally { setLoadingOrders(false) }
    }
    fetchOrders()
  }, [store.id])

  if (isLoading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
  if (!customer) return <CustomerLoginPage store={store} />

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AnnouncementBar /><ElectroNavbar store={store} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Account</h1>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <p className="text-lg font-semibold">{customer.name}</p>
          <p className="text-sm text-gray-400">{customer.email}</p>
          <button onClick={logout} className="mt-3 text-sm text-red-400 hover:text-red-300">Logout</button>
        </div>
        <h2 className="text-lg font-semibold mb-4">Order History</h2>
        {loadingOrders ? <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /> : orders.length === 0 ? <p className="text-gray-500">No orders yet</p> : (
          <div className="space-y-3">{orders.map((order: any) => <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4"><div className="flex justify-between mb-2"><span className="text-sm text-gray-400">#{order.id.slice(-6)}</span><span className="text-sm text-cyan-400">{order.status}</span></div><p className="text-sm text-white">{formatPrice(order.total)}</p></div>)}</div>
        )}
      </main>
      <ElectroFooter store={store} />
    </div>
  )
}

// ─── Wishlist Page ────────────────────────────────────────────────────
function WishlistPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { getWishlistItems, clearWishlist } = useWishlist(store.id)
  const items = getWishlistItems(store.products)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AnnouncementBar /><ElectroNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Wishlist ({items.length})</h1>
          {items.length > 0 && <button onClick={clearWishlist} className="text-sm text-gray-400 hover:text-red-400">Clear All</button>}
        </div>
        {items.length === 0 ? (
          <div className="text-center py-16"><Heart className="w-12 h-12 text-gray-700 mx-auto mb-3" /><p className="text-gray-500 mb-4">Your wishlist is empty</p><Link href={storeLink("")} className="text-cyan-400 hover:text-cyan-300 font-medium">Browse Products</Link></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{items.map(p => <ElectroProductCard key={p.id} product={p} store={store} />)}</div>
        )}
      </main>
      <ElectroFooter store={store} />
    </div>
  )
}

// ─── Search Page ───────────────────────────────────────────────────────
function SearchPage({ store, query }: { store: StoreTemplateProps["store"]; query?: string }) {
  const { storeLink } = useStoreHelpers(store)
  const [searchQuery, setSearchQuery] = useState(query || "")
  const [sortBy, setSortBy] = useState("newest")

  const filtered = store.products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()))
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price
      case "price-high": return b.price - a.price
      case "name": return a.name.localeCompare(b.name)
      default: return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AnnouncementBar /><ElectroNavbar store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 outline-none" /></div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-cyan-500 outline-none">
            <option value="newest">Newest</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="name">Name A-Z</option>
          </select>
        </div>
        {sorted.length === 0 ? <div className="text-center py-16"><p className="text-gray-500">No products found for "{searchQuery}"</p></div> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{sorted.map(p => <ElectroProductCard key={p.id} product={p} store={store} />)}</div>
        )}
      </main>
      <ElectroFooter store={store} />
    </div>
  )
}

// ─── Not Found ────────────────────────────────────────────────────────
function NotFound({ store, message }: { store: StoreTemplateProps["store"]; message: string }) {
  const { storeLink } = useStoreHelpers(store)
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center"><p className="text-gray-400 mb-4">{message}</p><Link href={storeLink("")} className="text-cyan-400 hover:text-cyan-300 font-medium">Go Home</Link></div>
    </div>
  )
}

// ─── Scroll To Top ────────────────────────────────────────────────────
function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])
  if (!visible) return null
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20 transition-colors">
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}

// Helper for AccountPage
function formatPrice(price: number) {
  const num = Math.round(Number(price))
  return `৳${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
}
