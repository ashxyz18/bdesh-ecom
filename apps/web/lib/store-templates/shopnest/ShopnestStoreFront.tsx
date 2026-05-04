"use client"

import React, { useState, useEffect, useRef, Fragment } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ShoppingCart, Heart, Menu, X, ChevronDown, ArrowRight, ArrowUp,
  CreditCard, RefreshCcw, Shield, Truck, Minus, Plus, Trash2, Check,
  Search, Phone, MapPin, Mail, Facebook, Instagram, Twitter, Star,
  SlidersHorizontal, Eye, ChevronRight, LogIn, UserPlus, LogOut,
  ClipboardList, HeartOff, Loader2, Send, Clock, Package, User
} from "lucide-react"
import type { StoreTemplateProps, StoreProduct, StoreProductReview } from "../types"
import { useCart } from "../shared/context/CartContext"
import { useCustomerAuth } from "../shared/context/CustomerAuthContext"
import { useRecentlyViewed } from "../shared/hooks/useRecentlyViewed"
import { useWishlist } from "../shared/hooks/useWishlist"

type Product = StoreTemplateProps["store"]["products"][0]

// ─── Main Component with Cart Provider ───────────────────────────────
export default function ShopnestStoreFront({ store, path = [] }: StoreTemplateProps) {
  return (
    <ShopnestRouter store={store} path={path} />
  )
}

// ─── Internal Router ─────────────────────────────────────────────────
function ShopnestRouter({ store, path }: { store: StoreTemplateProps["store"]; path: string[] }) {
  const [page, ...params] = path

  switch (page) {
    case "product":
      return <ProductPage store={store} slug={params[0]} />
    case "collection":
      return <CollectionPage store={store} slug={params[0]} />
    case "cart":
      return <CartPage store={store} />
    case "checkout":
      return <CheckoutPage store={store} />
    case "login":
      return <CustomerLoginPage store={store} />
    case "register":
      return <CustomerRegisterPage store={store} />
    case "account":
      return <CustomerAccountPage store={store} />
    case "wishlist":
      return <WishlistPage store={store} />
    case "search":
      return <SearchPage store={store} query={params[0]} />
    default:
      return <HomePage store={store} />
  }
}

// ─── Shared Helpers ───────────────────────────────────────────────────
function useStoreHelpers(store: StoreTemplateProps["store"]) {
  const theme = store.theme ?? {}
  const settings = store.settings ?? {}
  const primaryColor = (theme as unknown as Record<string, string>).primaryColor || "#be9f7e"
  const secondaryColor = (theme as unknown as Record<string, string>).secondaryColor || "#1a1a1a"

  const formatPrice = (price: number) => {
    const num = Math.round(Number(price))
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return `৳${formatted}`
  }

  const storeLink = (subpath: string) => {
    const base = `/store?store=${store.subdomain}`
    return subpath ? `${base}&path=${subpath}` : base
  }

  return { theme, settings, primaryColor, secondaryColor, formatPrice, storeLink }
}

// ─── Announcement Bar ────────────────────────────────────────────────
function AnnouncementBar() {
  const messages = ["Free Shipping on Orders Over ৳5,000", "New Collection 2025", "Easy Returns within 7 Days"]
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % messages.length), 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-[#1a1a1a] text-white text-center py-2 text-xs tracking-widest uppercase font-medium overflow-hidden">
      <div className="animate-fade-in" key={current}>{messages[current]}</div>
    </div>
  )
}

// ─── Navbar ──────────────────────────────────────────────────────────
function ShopnestNavbar({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { itemCount } = useCart()
  const { customer, isLoading, logout } = useCustomerAuth()
  const { wishlistCount } = useWishlist(store.id)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <AnnouncementBar />
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"} border-b border-gray-100`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 -ml-2 hover:bg-gray-50 rounded-lg transition-colors">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link href={storeLink("")} className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#be9f7e] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{store.name.charAt(0)}</span>
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block" style={{ fontFamily: "'Playfair Display', serif" }}>{store.name}</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href={storeLink("")} className="text-sm font-medium text-gray-900 hover:text-[#be9f7e] transition-colors relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#be9f7e] group-hover:w-full transition-all duration-300" />
              </Link>
              {store.collections.slice(0, 5).map(col => (
                <Link key={col.id} href={storeLink(`collection/${col.slug}`)} className="text-sm font-medium text-gray-600 hover:text-[#be9f7e] transition-colors relative group">
                  {col.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#be9f7e] group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <Link href={storeLink("search")} className="p-2.5 hover:bg-gray-50 rounded-full transition-colors">
                <Search size={18} className="text-gray-600" />
              </Link>
              <Link href={storeLink("wishlist")} className="relative p-2.5 hover:bg-gray-50 rounded-full transition-colors">
                <Heart size={18} className="text-gray-600" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#be9f7e] text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href={storeLink("cart")} className="relative p-2.5 hover:bg-gray-50 rounded-full transition-colors">
                <ShoppingCart size={18} className="text-gray-600" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-[#be9f7e] text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                    {itemCount}
                  </span>
                )}
              </Link>
              {/* User menu */}
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="p-2.5 hover:bg-gray-50 rounded-full transition-colors">
                  <User size={18} className="text-gray-600" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {customer ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-medium text-sm text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                        <Link href={storeLink("account")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <ClipboardList size={16} /> My Orders
                        </Link>
                        <Link href={storeLink("wishlist")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Heart size={16} /> Wishlist
                        </Link>
                        <button onClick={() => { logout(); setUserMenuOpen(false) }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                          <LogOut size={16} /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href={storeLink("login")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <LogIn size={16} /> Login
                        </Link>
                        <Link href={storeLink("register")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <UserPlus size={16} /> Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{store.name}</span>
                <button onClick={() => setMenuOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-1">
                <Link href={storeLink("")} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 font-medium">Home <ChevronRight size={16} className="text-gray-400" /></Link>
                {store.collections.map(col => (
                  <Link key={col.id} href={storeLink(`collection/${col.slug}`)} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 text-gray-600">{col.name} <ChevronRight size={16} className="text-gray-400" /></Link>
                ))}
                <Link href={storeLink("wishlist")} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 text-gray-600">Wishlist {wishlistCount > 0 && `(${wishlistCount})`} <ChevronRight size={16} className="text-gray-400" /></Link>
                <Link href={storeLink("cart")} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 text-gray-600">Cart ({itemCount}) <ChevronRight size={16} className="text-gray-400" /></Link>
                <div className="border-t border-gray-100 my-2" />
                {customer ? (
                  <>
                    <Link href={storeLink("account")} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 text-gray-600">My Orders <ChevronRight size={16} className="text-gray-400" /></Link>
                    <button onClick={() => { logout(); setMenuOpen(false) }} className="flex items-center gap-2 py-3 px-3 rounded-lg hover:bg-red-50 text-red-600 w-full text-left">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href={storeLink("login")} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 text-gray-600">Login <ChevronRight size={16} className="text-gray-400" /></Link>
                    <Link href={storeLink("register")} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 text-gray-600">Register <ChevronRight size={16} className="text-gray-400" /></Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────
function ShopnestFooter({ store }: { store: StoreTemplateProps["store"] }) {
  const { settings, storeLink } = useStoreHelpers(store)
  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Subscribe to Our Newsletter</h3>
              <p className="text-gray-400 text-sm">Get 10% off your first order and stay updated</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input type="email" placeholder="Enter your email" className="flex-1 md:w-72 px-5 py-3 bg-white/10 border border-white/10 rounded-l-full text-sm focus:outline-none focus:border-[#be9f7e] placeholder-gray-500" />
              <button className="px-6 py-3 bg-[#be9f7e] text-white rounded-r-full text-sm font-medium hover:bg-[#a8896a] transition-colors">Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#be9f7e] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{store.name.charAt(0)}</span>
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{store.name}</span>
            </div>
            {store.description && <p className="text-gray-400 text-sm leading-relaxed mb-4">{store.description}</p>}
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#be9f7e] transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[#be9f7e]">Quick Links</h4>
            <div className="space-y-2.5 text-sm">
              <a href={storeLink("")} className="block text-gray-400 hover:text-white transition-colors">Home</a>
              {store.collections.slice(0, 4).map(col => (
                <a key={col.id} href={storeLink(`collection/${col.slug}`)} className="block text-gray-400 hover:text-white transition-colors">{col.name}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[#be9f7e]">Customer Service</h4>
            <div className="space-y-2.5 text-sm text-gray-400">
              <p className="hover:text-white transition-colors cursor-pointer">Shipping Policy</p>
              <p className="hover:text-white transition-colors cursor-pointer">Return & Exchange</p>
              <p className="hover:text-white transition-colors cursor-pointer">Privacy Policy</p>
              <p className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[#be9f7e]">Contact Us</h4>
            <div className="space-y-3 text-sm text-gray-400">
              {settings?.phone && (
                <div className="flex items-center gap-2"><Phone size={14} className="text-[#be9f7e]" /> {settings.phone}</div>
              )}
              {settings?.email && (
                <div className="flex items-center gap-2"><Mail size={14} className="text-[#be9f7e]" /> {settings.email}</div>
              )}
              {settings?.address && (
                <div className="flex items-start gap-2"><MapPin size={14} className="text-[#be9f7e] mt-0.5" /> {settings.address}</div>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">© {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>bKash</span>
            <span>•</span>
            <span>Nagad</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Product Card ────────────────────────────────────────────────────
function ShopnestProductCard({ product, store, formatPrice }: { product: Product; store: StoreTemplateProps["store"]; formatPrice: (p: number) => string }) {
  const { storeLink } = useStoreHelpers(store)
  const { addToCart } = useCart()
  const [isHovered, setIsHovered] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const imageUrl = product.images?.[0] || "/placeholder.svg"
  const secondImage = product.images?.[1]

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  return (
    <a
      href={storeLink(`product/${product.slug}`)}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] bg-[#f8f6f3] rounded-xl overflow-hidden mb-3">
        {/* Main image */}
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700 ${isHovered && secondImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
        />
        {/* Second image on hover */}
        {secondImage && (
          <img
            src={secondImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          />
        )}

        {/* Sale badge */}
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="absolute top-3 left-3 bg-[#e74c3c] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            -{Math.round((1 - product.price / product.comparePrice) * 100)}%
          </span>
        )}

        {/* Quick actions */}
        <div className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={handleQuickAdd}
            className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 ${
              addedToCart
                ? "bg-green-500 text-white"
                : "bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-[#be9f7e] hover:text-white"
            }`}
          >
            {addedToCart ? "✓ Added" : "Add to Cart"}
          </button>
          <button className="p-2.5 bg-white/95 backdrop-blur-sm rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors">
            <Heart size={16} />
          </button>
        </div>
      </div>

      <div className="px-1">
        <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-[#be9f7e] transition-colors">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
      </div>
    </a>
  )
}

// ─── Home Page ───────────────────────────────────────────────────────
function HomePage({ store }: { store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCollection, setActiveCollection] = useState<string | null>(null)

  const featuredProducts = store.products.filter(p => p.featured)
  const filteredProducts = store.products.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesCollection = !activeCollection || p.collectionIds.includes(activeCollection)
    return matchesSearch && matchesCollection
  })

  return (
    <div className="min-h-screen bg-white">
      <ShopnestNavbar store={store} />

      {/* Hero Section */}
      <section className="relative bg-[#f8f6f3] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-16 md:py-24">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1a1a1a] text-white rounded-full text-xs font-medium mb-6 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 bg-[#be9f7e] rounded-full animate-pulse" />
                New Collection 2025
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a1a] leading-[1.1] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Vintage
                <span className="block text-[#be9f7e]">Glam</span>
              </h1>

              <p className="text-base text-gray-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                {store.description || "Discover our premium collection where craftsmanship meets contemporary design. Each piece is meticulously crafted for the modern individual."}
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
                {[
                  { icon: <Truck size={14} />, text: "Free Shipping" },
                  { icon: <Shield size={14} />, text: "Secure Payment" },
                  { icon: <RefreshCcw size={14} />, text: "Easy Returns" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-[#be9f7e] hover:shadow-sm transition-all duration-300 cursor-default">
                    <span className="text-[#be9f7e]">{f.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{f.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a href="#products" className="inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#be9f7e] transition-colors group">
                  Explore Collection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Stats */}
              <div className="mt-10 flex items-center gap-8 justify-center lg:justify-start">
                {[
                  { value: "500+", label: "Happy Customers" },
                  { value: "4.9", label: "Average Rating" },
                  { value: "24h", label: "Delivery Time" },
                ].map((stat, i) => (
                  <Fragment key={i}>
                    {i > 0 && <div className="w-px h-10 bg-gray-200" />}
                    <div className="group cursor-default">
                      <div className="text-2xl font-bold text-[#1a1a1a] group-hover:text-[#be9f7e] transition-colors">{stat.value}</div>
                      <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 group">
                {store.banner ? (
                  <img src={store.banner} alt={store.name} className="w-full aspect-[3/4] lg:aspect-square object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full aspect-[3/4] lg:aspect-square bg-gradient-to-br from-[#be9f7e] via-[#a8896a] to-[#8b7355] flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                        <span className="text-white font-bold text-3xl" style={{ fontFamily: "'Playfair Display', serif" }}>{store.name.charAt(0)}</span>
                      </div>
                      <h3 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{store.name}</h3>
                      <p className="text-white/60 text-sm">Premium Collection</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 w-36 bg-white rounded-xl shadow-lg p-4 border border-gray-100 hidden lg:block hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-[#be9f7e]/10 rounded-lg flex items-center justify-center">
                    <Star size={18} className="text-[#be9f7e]" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">4.9</div>
                    <div className="text-[10px] text-gray-500">Top Rated</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      {store.collections.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#1a1a1a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Shop by Category</h2>
              <p className="text-gray-500 text-sm">Browse our curated collections</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {store.collections.map(col => (
                <a key={col.id} href={storeLink(`collection/${col.slug}`)} className="group relative aspect-[3/4] rounded-xl overflow-hidden">
                  <img
                    src={col.image || `/api/placeholder/400/500?text=${encodeURIComponent(col.name)}`}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{col.name}</h3>
                    <span className="inline-flex items-center gap-1 text-white/80 text-xs font-medium group-hover:text-[#be9f7e] transition-colors">
                      Shop Now <ArrowRight size={12} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-[#f8f6f3]">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', serif" }}>Featured Products</h2>
                <p className="text-gray-500 text-sm mt-1">Handpicked for you</p>
              </div>
              <a href="#products" className="text-sm font-medium text-[#be9f7e] hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map(product => (
                <ShopnestProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Truck size={22} />, title: "Free Shipping", desc: "On orders over ৳5,000" },
              { icon: <RefreshCcw size={22} />, title: "Easy Returns", desc: "7-day return policy" },
              { icon: <Shield size={22} />, title: "Secure Payment", desc: "100% secure checkout" },
              { icon: <Phone size={22} />, title: "24/7 Support", desc: "Dedicated customer care" },
            ].map((f, i) => (
              <div key={i} className="group p-6 rounded-xl border border-gray-100 hover:border-[#be9f7e] hover:shadow-lg transition-all duration-500 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-[#be9f7e]/10 flex items-center justify-center text-[#be9f7e] mb-4 group-hover:bg-[#be9f7e] group-hover:text-white group-hover:scale-110 transition-all duration-500">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-[#be9f7e] transition-colors">{f.title}</h3>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Products */}
      <section id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Our Products</h2>
            <p className="text-gray-500 text-sm">Discover something you love</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 focus:border-[#be9f7e] focus:ring-2 focus:ring-[#be9f7e]/20 outline-none text-sm"
              />
            </div>
            {store.collections.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCollection(null)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${!activeCollection ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  All
                </button>
                {store.collections.map(col => (
                  <button
                    key={col.id}
                    onClick={() => setActiveCollection(col.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${activeCollection === col.id ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ShopnestProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ShopnestRecentlyViewedSection store={store} />

      <ShopnestFooter store={store} />

      {/* Scroll to top */}
      <ScrollToTop />
    </div>
  )
}

// ─── Product Page ────────────────────────────────────────────────────
function ProductPage({ store, slug }: { store: StoreTemplateProps["store"]; slug?: string }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { addToCart } = useCart()
  const { addProduct } = useRecentlyViewed(store.id)
  const { isInWishlist, toggleWishlist } = useWishlist(store.id)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)

  const product = store.products.find(p => p.slug === slug)
  if (!product) return <div className="min-h-screen flex items-center justify-center"><p>Product not found</p></div>

  useEffect(() => {
    if (product) addProduct(product)
  }, [product, addProduct])

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const relatedProducts = store.products.filter(p => p.id !== product.id && p.collectionIds.some(id => product.collectionIds.includes(id))).slice(0, 4)

  return (
    <div className="min-h-screen bg-white">
      <ShopnestNavbar store={store} />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
          <a href={storeLink("")} className="hover:text-[#be9f7e] transition-colors">Home</a>
          <ChevronRight size={14} />
          {product.collectionIds.length > 0 && (() => {
            const col = store.collections.find(c => product.collectionIds.includes(c.id))
            return col ? (
              <>
                <a href={storeLink(`collection/${col.slug}`)} className="hover:text-[#be9f7e] transition-colors">{col.name}</a>
                <ChevronRight size={14} />
              </>
            ) : null
          })()}
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] bg-[#f8f6f3] rounded-2xl overflow-hidden mb-4">
              <img src={product.images?.[selectedImage] || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? "border-[#be9f7e]" : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:py-4">
            {product.collectionIds.length > 0 && (() => {
              const col = store.collections.find(c => product.collectionIds.includes(c.id))
              return col ? <p className="text-xs text-[#be9f7e] uppercase tracking-widest font-medium mb-3">{col.name}</p> : null
            })()}
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <ShopnestStarRating rating={product.averageRating || 0} size="sm" />
              <span className="text-sm text-gray-500">({product.reviewCount || 0} reviews)</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold text-[#1a1a1a]">{formatPrice(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                  <span className="text-sm font-medium text-[#e74c3c] bg-red-50 px-2.5 py-1 rounded-full">
                    {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-200 rounded-full">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 rounded-l-full transition-colors">
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50 rounded-r-full transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-[#1a1a1a] text-white hover:bg-[#be9f7e]"
                }`}
              >
                {addedToCart ? <><Check size={18} /> Added to Cart</> : <><ShoppingCart size={18} /> Add to Cart — {formatPrice(product.price * quantity)}</>}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 border rounded-full transition-colors ${isInWishlist(product.id) ? "border-red-400 text-red-500 bg-red-50" : "border-gray-200 hover:border-[#e74c3c] hover:text-red-500"}`}
              >
                {isInWishlist(product.id) ? <Heart size={18} className="fill-current" /> : <Heart size={18} />}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              {[
                { icon: <Truck size={20} />, text: "Free Shipping" },
                { icon: <RefreshCcw size={20} />, text: "Easy Returns" },
                { icon: <Shield size={20} />, text: "Secure Payment" },
              ].map((f, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto mb-2 text-[#be9f7e]">{f.icon}</div>
                  <span className="text-xs text-gray-500">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ShopnestProductCard key={p.id} product={p} store={store} formatPrice={formatPrice} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <section className="mt-16 pt-12 border-t">
          <ShopnestProductReviewsSection product={product} storeId={store.id} />
        </section>

        {/* Recently Viewed */}
        <section className="mt-16">
          <ShopnestRecentlyViewedSection store={store} />
        </section>
      </main>

      <ShopnestFooter store={store} />
    </div>
  )
}

// ─── Collection Page ──────────────────────────────────────────────────
function CollectionPage({ store, slug }: { store: StoreTemplateProps["store"]; slug?: string }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const collection = store.collections.find(c => c.slug === slug)
  const products = collection
    ? store.products.filter(p => p.collectionIds.includes(collection.id))
    : store.products

  const filteredProducts = products.filter(p =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">
      <ShopnestNavbar store={store} />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <a href={storeLink("")} className="hover:text-[#be9f7e] transition-colors">Home</a>
          <ChevronRight size={14} />
          <span className="text-gray-700">{collection?.name || "All Products"}</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', serif" }}>{collection?.name || "All Products"}</h1>
            <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} products</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:border-[#be9f7e] focus:ring-2 focus:ring-[#be9f7e]/20 outline-none text-sm w-56"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters (desktop) */}
          <aside className={`w-64 flex-shrink-0 ${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="sticky top-24 space-y-6">
              <div className="p-5 bg-[#f8f6f3] rounded-xl">
                <h3 className="font-semibold text-sm mb-3">Collections</h3>
                <div className="space-y-2">
                  <a href={storeLink("")} className="block text-sm text-gray-600 hover:text-[#be9f7e] transition-colors">All Products</a>
                  {store.collections.map(col => (
                    <a key={col.id} href={storeLink(`collection/${col.slug}`)} className={`block text-sm transition-colors ${col.id === collection?.id ? "text-[#be9f7e] font-medium" : "text-gray-600 hover:text-[#be9f7e]"}`}>{col.name}</a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products in this collection</p>
                <a href={storeLink("")} className="text-sm text-[#be9f7e] hover:underline mt-2 inline-block">Back to shop</a>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ShopnestProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <ShopnestFooter store={store} />
    </div>
  )
}

// ─── Cart Page ────────────────────────────────────────────────────────
function CartPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart()

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <ShopnestNavbar store={store} />

      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <ShoppingCart size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
            <p className="text-gray-400 text-sm mb-6">Looks like you haven't added anything yet</p>
            <a href={storeLink("")} className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#be9f7e] transition-colors">
              Continue Shopping <ArrowRight size={16} />
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 bg-white p-4 rounded-xl">
                  <a href={storeLink(`product/${product.slug}`)} className="w-24 h-28 bg-[#f8f6f3] rounded-lg overflow-hidden flex-shrink-0">
                    <img src={product.images?.[0] || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
                  </a>
                  <div className="flex-1 min-w-0">
                    <a href={storeLink(`product/${product.slug}`)} className="font-medium text-sm hover:text-[#be9f7e] transition-colors">{product.name}</a>
                    <p className="text-sm font-semibold mt-1">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-full">
                        <button onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))} className="p-1.5 hover:bg-gray-50 rounded-l-full">
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm">{quantity}</span>
                        <button onClick={() => updateQuantity(product.id, quantity + 1)} className="p-1.5 hover:bg-gray-50 rounded-r-full">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(product.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatPrice(product.price * quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-xl h-fit">
              <h2 className="font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-500">Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <a href={storeLink("checkout")} className="block mt-6 bg-[#1a1a1a] text-white text-center py-3.5 rounded-full font-medium hover:bg-[#be9f7e] transition-colors">
                Proceed to Checkout
              </a>
              <a href={storeLink("")} className="block mt-3 text-center text-sm text-gray-500 hover:text-[#be9f7e] transition-colors">
                Continue Shopping
              </a>
            </div>
          </div>
        )}
      </main>

      <ShopnestFooter store={store} />
    </div>
  )
}

// ─── Checkout Page ────────────────────────────────────────────────────
function CheckoutPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink, settings } = useStoreHelpers(store)
  const { cartItems, subtotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", city: "", note: "", paymentMethod: "cod"
  })

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cartItems.length === 0) return
    setLoading(true)

    try {
      const res = await fetch(`/api/${store.id}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email,
          shippingAddress: `${form.address}, ${form.city}`,
          paymentMethod: form.paymentMethod,
          items: cartItems.map(({ product, quantity }) => ({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.images?.[0]
          })),
          total: subtotal
        })
      })

      if (res.ok) {
        setOrderPlaced(true)
        clearCart()
      }
    } catch (err) {
      console.error("Order failed:", err)
    } finally {
      setLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#f8f6f3]">
        <ShopnestNavbar store={store} />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Order Placed!</h1>
          <p className="text-gray-500 mb-8">Thank you for your order. We'll contact you shortly with confirmation.</p>
          <a href={storeLink("")} className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#be9f7e] transition-colors">
            Continue Shopping <ArrowRight size={16} />
          </a>
        </div>
        <ShopnestFooter store={store} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <ShopnestNavbar store={store} />

      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Checkout</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <a href={storeLink("")} className="text-sm text-[#be9f7e] hover:underline">Go to shop</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Info */}
                <div className="bg-white p-6 rounded-xl">
                  <h2 className="font-bold mb-4">Delivery Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                      <input type="text" required value={form.name} onChange={e => updateField("name", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#be9f7e] focus:ring-2 focus:ring-[#be9f7e]/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
                      <input type="tel" required value={form.phone} onChange={e => updateField("phone", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#be9f7e] focus:ring-[#be9f7e]/20" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Email</label>
                      <input type="email" value={form.email} onChange={e => updateField("email", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#be9f7e] focus:ring-[#be9f7e]/20" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Address *</label>
                      <input type="text" required value={form.address} onChange={e => updateField("address", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#be9f7e] focus:ring-[#be9f7e]/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">City *</label>
                      <input type="text" required value={form.city} onChange={e => updateField("city", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#be9f7e] focus:ring-[#be9f7e]/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Order Note</label>
                      <input type="text" value={form.note} onChange={e => updateField("note", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#be9f7e] focus:ring-[#be9f7e]/20" />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white p-6 rounded-xl">
                  <h2 className="font-bold mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    {[
                      { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
                      { id: "bkash", label: "bKash", desc: "Mobile banking payment" },
                      { id: "nagad", label: "Nagad", desc: "Mobile financial service" },
                    ].map(method => (
                      <label key={method.id} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${form.paymentMethod === method.id ? "border-[#be9f7e] bg-[#be9f7e]/5" : "hover:bg-gray-50"}`}>
                        <input type="radio" name="payment" value={method.id} checked={form.paymentMethod === method.id} onChange={e => updateField("paymentMethod", e.target.value)} className="accent-[#be9f7e]" />
                        <div>
                          <p className="font-medium text-sm">{method.label}</p>
                          <p className="text-xs text-gray-400">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white p-6 rounded-xl h-fit">
                <h2 className="font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate mr-2">{product.name} × {quantity}</span>
                      <span className="font-medium flex-shrink-0">{formatPrice(product.price * quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <button type="submit" disabled={loading} className="w-full mt-6 bg-[#1a1a1a] text-white py-3.5 rounded-full font-medium hover:bg-[#be9f7e] disabled:bg-gray-300 transition-colors">
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      <ShopnestFooter store={store} />
    </div>
  )
}

// ─── Scroll to Top Button ────────────────────────────────────────────
function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#1a1a1a] text-white rounded-full shadow-lg hover:bg-[#be9f7e] transition-colors flex items-center justify-center"
    >
      <ArrowUp size={20} />
    </button>
  )
}

// ─── Star Rating ─────────────────────────────────────────────────────
function ShopnestStarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "size-6" : size === "md" ? "size-5" : "size-4"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`${sizeClass} ${s <= Math.round(rating) ? "fill-[#be9f7e] text-[#be9f7e]" : "text-gray-200 fill-gray-200"}`} />
      ))}
    </div>
  )
}

// ─── Recently Viewed Section ──────────────────────────────────────────
function ShopnestRecentlyViewedSection({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const { getRecentlyViewed } = useRecentlyViewed(store.id)
  const items = getRecentlyViewed(store.products)

  if (items.length === 0) return null

  return (
    <section className="py-12 border-t">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Recently Viewed</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {items.map(product => (
            <Link key={product.id} href={storeLink(`product/${product.slug}`)} className="flex-shrink-0 w-44 group">
              <div className="aspect-[3/4] bg-[#f8f6f3] rounded-lg overflow-hidden mb-2">
                <img src={product.images?.[0] || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-[#be9f7e] transition-colors">{product.name}</h3>
              <p className="text-sm font-semibold text-[#1a1a1a] mt-0.5">{formatPrice(product.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Product Reviews Section ─────────────────────────────────────────
function ShopnestProductReviewsSection({ product, storeId }: { product: Product; storeId: string }) {
  const { customer } = useCustomerAuth()
  const [reviews, setReviews] = useState<StoreProductReview[]>(product.reviews || [])
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/storefront/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, storeId, rating, title, comment, userId: customer.id })
      })
      if (res.ok) {
        const newReview = await res.json()
        setReviews(prev => [newReview, ...prev])
        setTitle("")
        setComment("")
        setRating(5)
      }
    } catch (err) {
      console.error("Review failed:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Customer Reviews</h2>

      {customer && (
        <form onSubmit={handleSubmit} className="bg-[#f8f6f3] rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-[#1a1a1a] mb-4">Write a Review</h3>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600 mr-2">Rating:</span>
            {[5, 4, 3, 2, 1].map(star => (
              <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                <Star className={`size-5 ${star <= rating ? "fill-[#be9f7e] text-[#be9f7e]" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
          <input type="text" placeholder="Review title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#be9f7e] focus:ring-2 focus:ring-[#be9f7e]/20 outline-none mb-3" />
          <textarea placeholder="Share your experience..." value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#be9f7e] focus:ring-2 focus:ring-[#be9f7e]/20 outline-none mb-3 resize-none" />
          <button type="submit" disabled={submitting || !comment} className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#be9f7e] disabled:bg-gray-300 transition-colors flex items-center gap-2">
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit Review</>}
          </button>
        </form>
      )}

      {!customer && (
        <div className="bg-[#f8f6f3] rounded-xl p-6 mb-8 text-center">
          <p className="text-gray-600 mb-3">Please log in to write a review</p>
          <Link href={`/store?path=login`} className="text-[#be9f7e] font-medium hover:underline">Login →</Link>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border border-gray-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <ShopnestStarRating rating={review.rating} size="sm" />
                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              {review.title && <h4 className="font-semibold text-sm text-[#1a1a1a] mb-1">{review.title}</h4>}
              <p className="text-sm text-gray-600">{review.comment}</p>
              <p className="text-xs text-gray-400 mt-2">By {review.userName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Customer Login Page ──────────────────────────────────────────────
function CustomerLoginPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { login, isLoading } = useCustomerAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(email, password)
      window.location.href = storeLink("")
    } catch (err: any) {
      setError(err.message || "Login failed")
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <ShopnestNavbar store={store} />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Welcome Back</h1>
          <p className="text-gray-500 text-center text-sm mb-6">Sign in to your account</p>
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#be9f7e] focus:ring-2 focus:ring-[#be9f7e]/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#be9f7e] focus:ring-2 focus:ring-[#be9f7e]/20 outline-none" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-[#1a1a1a] text-white py-3 rounded-full font-medium hover:bg-[#be9f7e] disabled:bg-gray-300 transition-colors">
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account? <Link href={storeLink("register")} className="text-[#be9f7e] font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
      <ShopnestFooter store={store} />
    </div>
  )
}

// ─── Customer Register Page ──────────────────────────────────────────
function CustomerRegisterPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { register, isLoading } = useCustomerAuth()
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await register(form)
      window.location.href = storeLink("")
    } catch (err: any) {
      setError(err.message || "Registration failed")
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <ShopnestNavbar store={store} />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Create Account</h1>
          <p className="text-gray-500 text-center text-sm mb-6">Join us for an exclusive experience</p>
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#be9f7e] focus:ring-2 focus:ring-[#be9f7e]/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#be9f7e] focus:ring-2 focus:ring-[#be9f7e]/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#be9f7e] focus:ring-2 focus:ring-[#be9f7e]/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#be9f7e] focus:ring-2 focus:ring-[#be9f7e]/20 outline-none" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-[#1a1a1a] text-white py-3 rounded-full font-medium hover:bg-[#be9f7e] disabled:bg-gray-300 transition-colors">
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link href={storeLink("login")} className="text-[#be9f7e] font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
      <ShopnestFooter store={store} />
    </div>
  )
}

// ─── Customer Account Page ────────────────────────────────────────────
function CustomerAccountPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
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

  const statusColor = (s: string) => {
    switch (s) {
      case "DELIVERED": return "bg-green-100 text-green-700"
      case "CANCELLED": return "bg-red-100 text-red-700"
      case "CONFIRMED": return "bg-blue-100 text-blue-700"
      case "PROCESSING": return "bg-yellow-100 text-yellow-700"
      case "SHIPPED": return "bg-purple-100 text-purple-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin size-8 text-[#be9f7e]" /></div>
  if (!customer) return (window.location.href = storeLink("login"), <></>)

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <ShopnestNavbar store={store} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', serif" }}>My Account</h1>
              <p className="text-gray-500 text-sm mt-1">{customer.name} • {customer.email}</p>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Order History</h2>
          {loadingOrders ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin size-6 text-[#be9f7e]" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500">No orders yet</p>
              <Link href={storeLink("")} className="text-[#be9f7e] font-medium hover:underline text-sm mt-2 inline-block">Start Shopping →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <div key={order.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">#{order.id.slice(-8)}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(order.status)}`}>{order.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items • ৳{order.total}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ShopnestFooter store={store} />
    </div>
  )
}

// ─── Wishlist Page ────────────────────────────────────────────────────
function WishlistPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const { getWishlistItems, toggleWishlist, isInWishlist } = useWishlist(store.id)
  const items = getWishlistItems(store.products)

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <ShopnestNavbar store={store} />
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Wishlist</h1>
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <HeartOff size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 text-lg mb-2">Your wishlist is empty</p>
            <p className="text-gray-400 text-sm mb-6">Save items you love for later</p>
            <Link href={storeLink("")} className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#be9f7e] transition-colors">
              Browse Products <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map(product => (
              <div key={product.id} className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <Link href={storeLink(`product/${product.slug}`)} className="block">
                  <div className="relative aspect-[3/4] bg-[#f8f6f3]">
                    <img src={product.images?.[0] || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm font-semibold text-[#1a1a1a] mt-1">{formatPrice(product.price)}</p>
                  <button onClick={() => toggleWishlist(product)} className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1">
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ShopnestFooter store={store} />
    </div>
  )
}

// ─── Search Page ─────────────────────────────────────────────────────
function SearchPage({ store, query }: { store: StoreTemplateProps["store"]; query?: string }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const [searchQuery, setSearchQuery] = useState(query || "")
  const [sortBy, setSortBy] = useState("newest")

  const filteredProducts = store.products.filter(p =>
    !searchQuery ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc": return a.price - b.price
      case "price-desc": return b.price - a.price
      case "name": return a.name.localeCompare(b.name)
      default: return 0
    }
  })

  return (
    <div className="min-h-screen bg-white">
      <ShopnestNavbar store={store} />
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Search Products</h1>
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-[#be9f7e] focus:ring-2 focus:ring-[#be9f7e]/20 outline-none text-sm" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#be9f7e]">
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map(product => (
              <ShopnestProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} />
            ))}
          </div>
        )}
      </div>
      <ShopnestFooter store={store} />
    </div>
  )
}
