"use client"

import React, { useState, useEffect, useRef, Fragment } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, ChevronRight,
  ArrowRight, Shield, Truck, RotateCcw, Star, Eye, Minus, Plus, Trash2,
  Package, CreditCard, Headphones, Gift, Sparkles, Check, MapPin, Phone, Mail,
  Facebook, Instagram, Twitter, ArrowUp, Zap, ImageIcon, LogIn, UserPlus,
  LogOut, ClipboardList, HeartOff, Loader2, Send, Clock
} from "lucide-react"
import { CartProvider, useCart } from "../shared/context/CartContext"
import { useCustomerAuth } from "../shared/context/CustomerAuthContext"
import { useRecentlyViewed } from "../shared/hooks/useRecentlyViewed"
import { useWishlist } from "../shared/hooks/useWishlist"
import type { StoreTemplateProps, StoreProductReview } from "../types"

type Product = StoreTemplateProps["store"]["products"][0]

// ─── Main Component ────────────────────────────────────────────────
export default function RoseoStoreFront({ store, path = [] }: StoreTemplateProps) {
  return <RoseoRouter store={store} path={path} />
}

function RoseoRouter({ store, path }: { store: StoreTemplateProps["store"]; path: string[] }) {
  const page = path[0] || ""
  switch (page) {
    case "product":
      return <ProductPage store={store} slug={path[1]} />
    case "collection":
      return <CollectionPage store={store} slug={path[1]} />
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
      return <SearchPage store={store} query={path[1]} />
    default:
      return <HomePage store={store} />
  }
}

// ─── Helpers ───────────────────────────────────────────────────────
function useStoreHelpers(store: StoreTemplateProps["store"]) {
  const theme = store.theme ?? {}
  const settings = store.settings ?? {}
  const primaryColor = (theme as unknown as Record<string, string>).primaryColor || "#1a1a1a"
  const secondaryColor = (theme as unknown as Record<string, string>).secondaryColor || "#D4A574"

  const formatPrice = (price: number) => {
    const num = Math.round(Number(price))
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return `৳${formatted}`
  }

  const storeLink = (subpath: string) => {
    const base = `/store?store=${store.subdomain}`
    return subpath ? `${base}&path=${subpath}` : base
  }

  return { primaryColor, secondaryColor, formatPrice, storeLink }
}

// ─── Announcement Bar ──────────────────────────────────────────────
function AnnouncementBar({ store }: { store: StoreTemplateProps["store"] }) {
  const messages = [
    "🎉 Free Shipping on Orders Over ৳5,000",
    "⭐ New Collection Available Now",
    "🚚 Fast Delivery Across Bangladesh",
  ]
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % messages.length), 4000)
    return () => clearInterval(timer)
  }, [messages.length])

  return (
    <div className="bg-[#1a1a1a] text-white py-2 text-center text-xs tracking-wide overflow-hidden">
      <div className="animate-fade-in" key={current}>
        {messages[current]}
      </div>
    </div>
  )
}

// ─── Navbar ─────────────────────────────────────────────────────────
function RoseoNavbar({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { cartItems } = useCart()
  const { customer } = useCustomerAuth()
  const { wishlistCount } = useWishlist(store.id)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null)
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    setOpenDropdown(label)
  }

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150)
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#1a1a1a]/95 backdrop-blur-md shadow-lg" : "bg-[#1a1a1a]"} border-b border-[#2a2a2a]`}>
      <AnnouncementBar store={store} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
            <Link href={storeLink("")} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#D4A574] rounded-lg flex items-center justify-center">
                <span className="text-[#1a1a1a] font-bold text-sm">{store.name.charAt(0)}</span>
              </div>
              <span className="font-bold text-xl text-white tracking-tight">{store.name}</span>
            </Link>
          </div>

          {/* Desktop Nav with Dropdowns */}
          <div className="hidden lg:flex items-center gap-1">
            {store.collections.slice(0, 5).map((col) => (
              <div
                key={col.id}
                className="relative"
                onMouseEnter={() => handleDropdownEnter(col.id)}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  href={storeLink(`collection/${col.slug}`)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    openDropdown === col.id ? "bg-[#2a2a2a] text-white" : "text-gray-300 hover:text-white hover:bg-[#2a2a2a]/50"
                  }`}
                >
                  {col.name}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown === col.id ? "rotate-180" : ""}`} />
                </Link>
                {openDropdown === col.id && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <Link
                      href={storeLink(`collection/${col.slug}`)}
                      className="block px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      All {col.name}
                    </Link>
                    {store.products.filter(p => p.collectionIds.includes(col.id)).slice(0, 5).map((p) => (
                      <Link
                        key={p.id}
                        href={storeLink(`product/${p.slug}`)}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link href={storeLink("wishlist")} className="relative p-2 rounded-lg hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition-colors">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link href={storeLink("cart")} className="relative p-2 rounded-lg hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#D4A574] text-[#1a1a1a] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <div className="relative ml-1">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="p-2 rounded-lg hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition-colors">
                <User className="w-5 h-5" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {customer ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                      <Link href={storeLink("account")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="w-4 h-4" /> My Account
                      </Link>
                      <Link href={storeLink("wishlist")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Heart className="w-4 h-4" /> Wishlist
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href={storeLink("login")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <LogIn className="w-4 h-4" /> Sign In
                      </Link>
                      <Link href={storeLink("register")} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <UserPlus className="w-4 h-4" /> Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#1a1a1a] border-b border-[#2a2a2a] p-4 z-50">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#D4A574] transition-colors"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#2a2a2a] bg-[#1a1a1a]">
          <div className="p-4 space-y-1">
            <Link href={storeLink("")} className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>Home</Link>
            {store.collections.map((col) => (
              <Link
                key={col.id}
                href={storeLink(`collection/${col.slug}`)}
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {col.name}
              </Link>
            ))}
            <div className="border-t border-[#2a2a2a] pt-2 mt-2">
              <Link href={storeLink("cart")} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>
                <ShoppingCart className="w-4 h-4" /> Cart {totalItems > 0 && `(${totalItems})`}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Hero Section ──────────────────────────────────────────────────
function HeroSection({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const [isVisible, setIsVisible] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x, y })
  }

  const featuredProduct = store.products[0]
  const features = [
    { icon: <Shield className="w-4 h-4" />, text: "2-Year Warranty" },
    { icon: <Truck className="w-4 h-4" />, text: "Free Shipping" },
    { icon: <RotateCcw className="w-4 h-4" />, text: "30-Day Returns" },
  ]

  return (
    <section ref={heroRef} onMouseMove={handleMouseMove} className="relative overflow-hidden bg-neutral-50">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 bg-[#D4A574]/20 rounded-full blur-3xl"
          style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`, transition: "transform 0.3s ease-out" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#D4A574]/10 rounded-full blur-3xl"
          style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`, transition: "transform 0.3s ease-out" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 md:py-24">
          {/* Left Content */}
          <div className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] text-white rounded-full text-xs font-medium mb-6 tracking-wider uppercase transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <span className="w-1.5 h-1.5 bg-[#D4A574] rounded-full animate-pulse" />
              New Collection 2025
            </div>

            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a1a] leading-[1.1] mb-6 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              Crafted for
              <span className="block text-[#D4A574]">Timeless Elegance</span>
            </h1>

            <p className={`text-base text-gray-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              Discover our premium collection where craftsmanship meets contemporary design. Each piece is meticulously crafted using sustainable materials.
            </p>

            {/* Feature pills */}
            <div className={`flex flex-wrap gap-3 mb-10 justify-center lg:justify-start transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-[#D4A574] hover:shadow-sm hover:bg-[#D4A574]/5 transition-all duration-300 cursor-default group/feature">
                  <div className="text-[#1a1a1a] group-hover/feature:scale-110 transition-transform duration-200">{feature.icon}</div>
                  <span className="text-xs font-medium text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className={`flex flex-col sm:flex-row gap-3 justify-center lg:justify-start transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <Link
                href={storeLink("collection/all")}
                className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1a1a1a] text-white rounded-lg font-semibold hover:bg-[#2a2a2a] hover:shadow-xl transition-all duration-300"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>

            {/* Stats */}
            <div className={`mt-8 flex items-center gap-8 justify-center lg:justify-start transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              {[
                { value: "500+", label: "Happy Customers" },
                { value: "4.9", label: "Average Rating" },
                { value: "24h", label: "Delivery Time" },
              ].map((stat, i) => (
                <Fragment key={i}>
                  {i > 0 && <div className="w-px h-10 bg-gray-200" />}
                  <div className="group cursor-default">
                    <div className="text-2xl font-bold text-[#1a1a1a] group-hover:text-[#D4A574] transition-colors duration-300">{stat.value}</div>
                    <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>

          {/* Right - Hero Image */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <div
              className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 group"
              style={{ transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -8}px)`, transition: "transform 0.3s ease-out" }}
            >
              {store.banner ? (
                <Image
                  src={store.banner}
                  alt={store.name}
                  width={700}
                  height={700}
                  className="w-full h-auto aspect-square object-cover transform group-hover:scale-105 transition-transform duration-700"
                  priority
                />
              ) : featuredProduct?.images?.[0] ? (
                <Image
                  src={featuredProduct.images[0]}
                  alt={featuredProduct.name}
                  width={700}
                  height={700}
                  className="w-full h-auto aspect-square object-cover transform group-hover:scale-105 transition-transform duration-700"
                  priority
                />
              ) : (
                <div className="aspect-square bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                      <ImageIcon className="w-10 h-10 text-white/60" />
                    </div>
                    <h3 className="text-white text-2xl font-bold mb-2">{store.name}</h3>
                    <p className="text-white/60 text-sm">Premium Collection</p>
                  </div>
                </div>
              )}

              {/* Price badge */}
              {featuredProduct && (
                <div className="absolute top-6 right-6 bg-[#1a1a1a] text-white px-4 py-2 rounded-lg shadow-lg transform group-hover:scale-105 transition-all duration-300">
                  <div className="font-bold text-lg">{formatPrice(featuredProduct.price)}</div>
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">Limited Offer</div>
                </div>
              )}

              {/* Stock badge */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-gray-700">In Stock</span>
              </div>
            </div>

            {/* Floating card - bottom left */}
            {store.products[1] && (
              <div className="absolute -bottom-4 -left-4 w-32 bg-white rounded-xl shadow-lg p-3 border border-gray-100 hidden lg:block hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-default animate-bounce" style={{ animationDuration: "3s" }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#D4A574]/10 rounded-lg flex items-center justify-center">
                    <span className="text-[#D4A574] font-bold text-sm">{store.products[1].name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-xs line-clamp-1">{store.products[1].name}</div>
                    <div className="text-[10px] text-gray-500 font-medium">From {formatPrice(store.products[1].price)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Floating card - top right */}
            <div className="absolute -top-4 -right-4 w-36 bg-white rounded-xl shadow-lg p-4 border border-gray-100 hidden lg:block hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-default animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-[#1a1a1a] rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-sm">4.9</span>
                </div>
                <div className="font-bold text-gray-900 text-sm">Top Rated</div>
                <div className="text-[10px] text-gray-500 font-medium">Customer Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Product Card ───────────────────────────────────────────────────
function RoseoProductCard({ product, store, formatPrice, storeLink }: {
  product: Product; store: StoreTemplateProps["store"]; formatPrice: (p: number) => string; storeLink: (s: string) => string
}) {
  const { addToCart } = useCart()
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const hasSecondImage = product.images && product.images.length > 1

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <Link
      href={storeLink(`product/${product.slug}`)}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:border-gray-300 block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.images?.[0] ? (
          <>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transform transition-all duration-700 ${isHovered && hasSecondImage ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
            />
            {hasSecondImage && (
              <Image
                src={product.images[1]}
                alt={`${product.name} alternate`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`absolute inset-0 object-cover transform transition-all duration-700 ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-gray-500 font-bold text-xl">{product.name.charAt(0)}</span>
            </div>
          </div>
        )}

        {/* Quick View Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center pb-6 transition-all duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <span className="bg-white text-gray-900 px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
            <Eye className="w-4 h-4" /> Quick View
          </span>
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsWishlisted(!isWishlisted) }}
          className={`absolute top-3 right-3 p-2 rounded-lg transition-all duration-300 transform ${isWishlisted ? "bg-white text-red-500 shadow-md scale-100" : isHovered ? "bg-white/90 text-gray-500 hover:text-red-500 shadow-sm scale-100" : "bg-white/70 text-gray-400 scale-90 -translate-y-1"}`}
        >
          <Heart className={`w-4 h-4 transition-transform duration-300 ${isWishlisted ? "fill-red-500 scale-110" : ""}`} />
        </button>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute bottom-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
            -{discount}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#D4A574] transition-colors duration-300 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium text-gray-700">4.8</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-3 line-clamp-1">{product.description || "Premium Quality"}</p>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 ${
              addedToCart
                ? "bg-green-500 text-white scale-95"
                : "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] active:scale-95"
            }`}
          >
            {addedToCart ? (
              <><Check className="w-3.5 h-3.5" /> Added!</>
            ) : (
              <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
            )}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(e) }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-[#D4A574] text-white hover:bg-[#c49060] transition-all duration-300 active:scale-95"
          >
            Buy Now <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </Link>
  )
}

// ─── Features Section ──────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    { icon: <Truck className="w-5 h-5" />, title: "Free Express Delivery", description: "Free shipping on orders over ৳5,000. Delivery within 2-3 business days." },
    { icon: <CreditCard className="w-5 h-5" />, title: "Flexible Payment", description: "Multiple payment options including bKash, Nagad, and COD." },
    { icon: <RotateCcw className="w-5 h-5" />, title: "Easy Returns", description: "7-day return policy. Easy returns and exchanges for any reason." },
    { icon: <Shield className="w-5 h-5" />, title: "Quality Guarantee", description: "All products come with a quality guarantee against defects." },
    { icon: <Headphones className="w-5 h-5" />, title: "24/7 Support", description: "Our customer service team is available round the clock to assist you." },
    { icon: <Gift className="w-5 h-5" />, title: "Loyalty Rewards", description: "Earn points on every purchase. Redeem for discounts and exclusive offers." },
  ]

  const stats = [
    { value: "10K+", label: "Happy Customers" },
    { value: "4.9", label: "Average Rating" },
    { value: "50+", label: "Cities Served" },
    { value: "24h", label: "Support Response" },
  ]

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A574]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4A574]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#D4A574]/10 text-[#1a1a1a] rounded-full text-xs font-semibold tracking-widest uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Premium Benefits
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-4">
            Why Choose <span className="text-[#D4A574]">Us</span>
          </h2>
          <p className="text-gray-500">
            We're committed to providing the best shopping experience with premium quality,
            exceptional service, and customer-centric policies.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 rounded-xl overflow-hidden mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-8 text-center group cursor-default transition-all duration-300 hover:bg-[#D4A574]/5">
              <div className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-1 group-hover:text-[#D4A574] transition-colors duration-300">{stat.value}</div>
              <div className="text-sm text-gray-500 group-hover:text-[#1a1a1a] transition-colors duration-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group p-8 rounded-xl border border-gray-200 hover:border-[#1a1a1a] hover:shadow-xl transition-all duration-500 cursor-default">
              <div className="w-12 h-12 rounded-xl bg-[#D4A574]/10 flex items-center justify-center text-[#1a1a1a] mb-6 group-hover:bg-[#1a1a1a] group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#1a1a1a] transition-colors duration-300">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#1a1a1a] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Learn more <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 rounded-2xl bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-xl" />
          </div>
          <div className="relative">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              Join Our Premium Membership
            </h3>
            <p className="text-gray-300 mb-10 max-w-xl mx-auto">
              Get exclusive access to early sales, member-only discounts, free shipping on all orders,
              and personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <span className="px-8 py-4 bg-white text-[#1a1a1a] rounded-lg font-semibold hover:bg-[#D4A574] hover:text-white transition-all duration-300 cursor-pointer flex items-center gap-2">
                Sign Up Free <ArrowRight className="w-4 h-4" />
              </span>
              <span className="px-8 py-4 border border-gray-600 text-white rounded-lg font-semibold hover:border-white hover:bg-white/10 transition-all duration-300 cursor-pointer">
                Learn More
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ────────────────────────────────────────────────────────
function RoseoFooter({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) { setSubscribed(true); setEmail("") }
  }

  return (
    <footer className="bg-[#111] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#D4A574] rounded-lg flex items-center justify-center">
                <span className="text-[#1a1a1a] font-bold text-sm">{store.name.charAt(0)}</span>
              </div>
              <span className="font-bold text-xl">{store.name}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">{store.description || "Premium quality products delivered to your doorstep."}</p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-gray-400 hover:bg-[#D4A574] hover:text-[#1a1a1a] transition-all duration-300">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {["Home", "All Products", "New Arrivals", "Best Sellers", "Sale"].map((link) => (
                <li key={link}>
                  <Link href={storeLink("")} className="text-gray-400 text-sm hover:text-[#D4A574] transition-colors duration-200">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Collections</h4>
            <ul className="space-y-3">
              {store.collections.slice(0, 5).map((col) => (
                <li key={col.id}>
                  <Link href={storeLink(`collection/${col.slug}`)} className="text-gray-400 text-sm hover:text-[#D4A574] transition-colors duration-200">{col.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4">Subscribe for exclusive offers and updates.</p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-[#D4A574] text-sm">
                <Check className="w-4 h-4" /> Subscribed successfully!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A574] transition-colors"
                />
                <button type="submit" className="px-4 py-2.5 bg-[#D4A574] text-[#1a1a1a] rounded-lg font-medium text-sm hover:bg-[#c49060] transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4" /> +880 1XXX-XXXXXX
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4" /> support@{store.subdomain}.com
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" /> Dhaka, Bangladesh
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#2a2a2a] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="hover:text-[#D4A574] cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-[#D4A574] cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-[#D4A574] cursor-pointer transition-colors">Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Home Page ─────────────────────────────────────────────────────
function HomePage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = store.products.filter((p) => {
    const matchesCategory = selectedCategory === "all" || p.collectionIds.includes(selectedCategory)
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredProducts = store.products.slice(0, 4)

  return (
    <div className="min-h-screen bg-white">
      <RoseoNavbar store={store} />
      <HeroSection store={store} />

      {/* Top Categories */}
      {store.collections.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">Shop by Category</h2>
              <p className="text-gray-500">Browse our curated collections</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {store.collections.slice(0, 8).map((col) => (
                <Link
                  key={col.id}
                  href={storeLink(`collection/${col.slug}`)}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] p-6 text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="w-16 h-16 mx-auto bg-[#D4A574]/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#D4A574]/30 group-hover:scale-110 transition-all duration-300">
                    <Package className="w-7 h-7 text-[#D4A574]" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">{col.name}</h3>
                  <p className="text-gray-400 text-sm">{store.products.filter(p => p.collectionIds.includes(col.id)).length} Products</p>
                  <div className="mt-3 flex items-center justify-center gap-1 text-[#D4A574] text-xs font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Browse <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-[#1a1a1a]">Featured Products</h2>
                <p className="text-gray-500 mt-1">Handpicked for you</p>
              </div>
              <Link href={storeLink("collection/all")} className="flex items-center gap-2 text-sm font-medium text-[#1a1a1a] hover:text-[#D4A574] transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <RoseoProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} storeLink={storeLink} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <FeaturesSection />

      {/* All Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">All Products</h2>
            <p className="text-gray-500">Explore our complete collection</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D4A574] transition-colors"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${selectedCategory === "all" ? "bg-[#1a1a1a] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#D4A574]"}`}
              >
                All
              </button>
              {store.collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setSelectedCategory(col.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${selectedCategory === col.id ? "bg-[#1a1a1a] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#D4A574]"}`}
                >
                  {col.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <RoseoProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} storeLink={storeLink} />
              ))}
            </div>
          )}
        </div>
      </section>

      <RecentlyViewedSection store={store} />

      <RoseoFooter store={store} />

      {/* Scroll to top */}
      <ScrollToTop />
    </div>
  )
}

// ─── Product Page ──────────────────────────────────────────────────
function ProductPage({ store, slug }: { store: StoreTemplateProps["store"]; slug?: string }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const { addToCart } = useCart()
  const { addProduct: trackRecentlyViewed } = useRecentlyViewed(store.id)
  const { isInWishlist, toggleWishlist } = useWishlist(store.id)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)

  const product = store.products.find((p) => p.slug === slug)

  useEffect(() => {
    if (product) trackRecentlyViewed(product)
  }, [product, trackRecentlyViewed])

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <RoseoNavbar store={store} />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href={storeLink("")} className="text-[#D4A574] hover:underline">Return to store</Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const relatedProducts = store.products.filter((p) => p.id !== product.id && p.collectionIds.some((c) => product.collectionIds.includes(c))).slice(0, 4)

  return (
    <div className="min-h-screen bg-white">
      <RoseoNavbar store={store} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
          <Link href={storeLink("")} className="hover:text-[#D4A574] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          {product.collectionIds.length > 0 && (() => {
            const col = store.collections.find((c) => product.collectionIds.includes(c.id))
            return col ? (
              <>
                <Link href={storeLink(`collection/${col.slug}`)} className="hover:text-[#D4A574] transition-colors">{col.name}</Link>
                <ChevronRight className="w-3 h-3" />
              </>
            ) : null
          })()}
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
              {product.images?.[selectedImage] ? (
                <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImage === i ? "border-[#D4A574] shadow-md" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= 4 ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">(4.8) · 124 reviews</span>
            </div>

            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-[#1a1a1a]">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-md">
                    -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">{product.description || "Premium quality product crafted with care."}</p>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold transition-all duration-300 ${
                  addedToCart ? "bg-green-500 text-white" : "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] hover:shadow-xl"
                }`}
              >
                {addedToCart ? <><Check className="w-5 h-5" /> Added to Cart!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-lg border-2 transition-all duration-300 ${
                  isInWishlist(product.id) ? "border-red-200 bg-red-50 text-red-500" : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500"
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
              </button>
            </div>

            <Link
              href={storeLink("checkout")}
              onClick={() => { if (!addedToCart) addToCart(product, quantity) }}
              className="block w-full text-center py-3.5 bg-[#D4A574] text-white rounded-lg font-semibold hover:bg-[#c49060] transition-all duration-300"
            >
              Buy Now
            </Link>

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { icon: <Truck className="w-5 h-5" />, title: "Free Shipping", desc: "Orders over ৳5,000" },
                { icon: <RotateCcw className="w-5 h-5" />, title: "Easy Returns", desc: "7-day return policy" },
                { icon: <Shield className="w-5 h-5" />, title: "Quality Guarantee", desc: "100% authentic" },
                { icon: <Zap className="w-5 h-5" />, title: "Fast Delivery", desc: "2-3 business days" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="text-[#D4A574]">{f.icon}</div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{f.title}</div>
                    <div className="text-xs text-gray-500">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <ProductReviewsSection product={product} storeId={store.id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <RoseoProductCard key={p.id} product={p} store={store} formatPrice={formatPrice} storeLink={storeLink} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        <RecentlyViewedSection store={store} />
      </main>

      <RoseoFooter store={store} />
    </div>
  )
}

// ─── Collection Page ───────────────────────────────────────────────
function CollectionPage({ store, slug }: { store: StoreTemplateProps["store"]; slug?: string }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const [sortBy, setSortBy] = useState("newest")

  const collection = slug && slug !== "all"
    ? store.collections.find((c) => c.slug === slug)
    : null

  const products = collection
    ? store.products.filter((p) => p.collectionIds.includes(collection.id))
    : store.products

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-asc": return a.price - b.price
      case "price-desc": return b.price - a.price
      case "name": return a.name.localeCompare(b.name)
      default: return 0
    }
  })

  return (
    <div className="min-h-screen bg-white">
      <RoseoNavbar store={store} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href={storeLink("")} className="hover:text-[#D4A574] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900">{collection?.name || "All Products"}</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a]">{collection?.name || "All Products"}</h1>
            <p className="text-gray-500 mt-1">{sortedProducts.length} products</p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D4A574]"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">This collection is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <RoseoProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} storeLink={storeLink} />
            ))}
          </div>
        )}
      </main>

      <RoseoFooter store={store} />
    </div>
  )
}

// ─── Cart Page ─────────────────────────────────────────────────────
function CartPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const { cartItems, removeFromCart, updateQuantity } = useCart()
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <RoseoNavbar store={store} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some products to get started</p>
            <Link href={storeLink("")} className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors">
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-4 p-4 bg-white rounded-xl border hover:shadow-sm transition-shadow">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{formatPrice(product.price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-md">
                      <button onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))} className="p-1.5 hover:bg-gray-50 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-sm font-medium">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="p-1.5 hover:bg-gray-50 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(product.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{formatPrice(product.price * quantity)}</span>
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="bg-white rounded-xl border p-6 mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-green-600">{subtotal >= 5000 ? "Free" : formatPrice(120)}</span>
              </div>
              <div className="border-t my-4" />
              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold text-[#1a1a1a]">Total</span>
                <span className="text-lg font-bold text-[#1a1a1a]">{formatPrice(subtotal + (subtotal >= 5000 ? 0 : 120))}</span>
              </div>
              <Link
                href={storeLink("checkout")}
                className="block w-full text-center py-3.5 bg-[#1a1a1a] text-white rounded-lg font-semibold hover:bg-[#2a2a2a] transition-colors"
              >
                Proceed to Checkout
              </Link>
              <Link href={storeLink("")} className="block text-center mt-3 text-sm text-gray-500 hover:text-[#D4A574] transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>

      <RoseoFooter store={store} />
    </div>
  )
}

// ─── Checkout Page ─────────────────────────────────────────────────
function CheckoutPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const { cartItems, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [form, setForm] = useState({
    name: "", phone: "", address: "", city: "", note: "", paymentMethod: "cod"
  })

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shipping = subtotal >= 5000 ? 0 : 120
  const total = subtotal + shipping

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/storefront/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store.id,
          customerName: form.name,
          customerPhone: form.phone,
          customerAddress: `${form.address}, ${form.city}`,
          paymentMethod: form.paymentMethod,
          total,
          items: cartItems.map(({ product, quantity }) => ({
            productId: product.id, name: product.name, price: product.price, quantity
          })),
        }),
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
      <div className="min-h-screen bg-gray-50">
        <RoseoNavbar store={store} />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-4">Order Placed!</h1>
          <p className="text-gray-500 mb-8">Thank you for your order. We'll contact you shortly to confirm.</p>
          <Link href={storeLink("")} className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RoseoNavbar store={store} />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <Link href={storeLink("")} className="text-[#D4A574] hover:underline">Go shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RoseoNavbar store={store} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#1a1a1a]">Delivery Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" required value={form.name} onChange={(e) => updateField("name", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D4A574] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input type="tel" required value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D4A574] transition-colors" placeholder="01XXXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea required value={form.address} onChange={(e) => updateField("address", e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D4A574] transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input type="text" required value={form.city} onChange={(e) => updateField("city", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D4A574] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Note</label>
                <textarea value={form.note} onChange={(e) => updateField("note", e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D4A574] transition-colors resize-none" placeholder="Any special instructions..." />
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#1a1a1a]">Payment Method</h2>
              {[
                { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive", icon: <Package className="w-5 h-5" /> },
                { id: "bkash", label: "bKash", desc: "Mobile banking payment", icon: <Phone className="w-5 h-5" /> },
                { id: "nagad", label: "Nagad", desc: "Mobile financial service", icon: <CreditCard className="w-5 h-5" /> },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${form.paymentMethod === method.id ? "border-[#D4A574] bg-[#D4A574]/5" : "hover:bg-gray-50"}`}
                >
                  <input type="radio" name="payment" value={method.id} checked={form.paymentMethod === method.id} onChange={(e) => updateField("paymentMethod", e.target.value)} className="accent-[#D4A574]" />
                  <div className="text-[#D4A574]">{method.icon}</div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{method.label}</div>
                    <div className="text-xs text-gray-500">{method.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1 flex-1 mr-2">{product.name} × {quantity}</span>
                    <span className="font-medium text-gray-900">{formatPrice(product.price * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-green-600">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-[#1a1a1a]">Total</span>
                  <span className="font-bold text-[#1a1a1a] text-lg">{formatPrice(total)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 bg-[#1a1a1a] text-white rounded-lg font-semibold hover:bg-[#2a2a2a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </form>
      </main>

      <RoseoFooter store={store} />
    </div>
  )
}

// ─── Scroll to Top ─────────────────────────────────────────────────
// ─── Star Rating Component ─────────────────────────────────────────
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${sizeClass} ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
      ))}
    </div>
  )
}

// ─── Recently Viewed Section ───────────────────────────────────────
function RecentlyViewedSection({ store }: { store: StoreTemplateProps["store"] }) {
  const { getRecentlyViewed } = useRecentlyViewed(store.id)
  const items = getRecentlyViewed(store.products)
  const { formatPrice, storeLink } = useStoreHelpers(store)

  if (items.length === 0) return null

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {items.map(product => (
            <Link key={product.id} href={storeLink(`product/${product.slug}`)} className="flex-shrink-0 w-44 group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                <Image src={product.images?.[0] || "/placeholder.svg"} alt={product.name} width={176} height={176} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
              <p className="text-sm font-bold text-[#D4A574]">{formatPrice(product.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Product Reviews Section ───────────────────────────────────────
function ProductReviewsSection({ product, storeId }: { product: Product; storeId: string }) {
  const { customer } = useCustomerAuth()
  const [reviews, setReviews] = useState<StoreProductReview[]>(product.reviews || [])
  const [showForm, setShowForm] = useState(false)
  const [formRating, setFormRating] = useState(5)
  const [formTitle, setFormTitle] = useState("")
  const [formComment, setFormComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  const averageRating = reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer || !formComment.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/storefront/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          storeId,
          rating: formRating,
          title: formTitle,
          comment: formComment,
          userId: customer.id,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setReviews(prev => [data.review, ...prev])
        setShowForm(false)
        setFormTitle("")
        setFormComment("")
        setFormRating(5)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Customer Reviews</h3>
        {customer && (
          <button onClick={() => setShowForm(!showForm)} className="text-sm text-[#D4A574] hover:underline font-medium">
            Write a Review
          </button>
        )}
      </div>

      {/* Rating Summary */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{averageRating}</div>
          <StarRating rating={averageRating} size="md" />
          <div className="text-xs text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => Math.round(r.rating) === star).length
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3">{star}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-gray-500">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-xl space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} type="button" onClick={() => setFormRating(i)} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)}>
                  <Star className={`w-7 h-7 cursor-pointer transition-colors ${i <= (hoverRating || formRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Title (optional)</label>
            <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D4A574] focus:border-[#D4A574] outline-none" placeholder="Summarize your review" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Review *</label>
            <textarea value={formComment} onChange={e => setFormComment(e.target.value)} required rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D4A574] focus:border-[#D4A574] outline-none resize-none" placeholder="Share your experience with this product" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#1a1a1a] text-white text-sm rounded-lg hover:bg-[#D4A574] transition-colors disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
          </div>
        </form>
      )}

      {/* Review List */}
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={review.rating} />
                {review.title && <span className="text-sm font-semibold text-gray-900">{review.title}</span>}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span>{review.userName}</span>
                <span>•</span>
                <span>{new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
              {review.comment && <p className="text-sm text-gray-700">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {!customer && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-sm text-gray-600">
            <Link href={`?store=${storeId}&path=login`} className="text-[#D4A574] hover:underline font-medium">Sign in</Link> to write a review
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Customer Login Page ────────────────────────────────────────────
function CustomerLoginPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { login, isLoading } = useCustomerAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { storeLink } = useStoreHelpers(store)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(email, password)
      window.location.href = storeLink("account")
    } catch {
      setError("Invalid email or password")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <RoseoNavbar store={store} />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-[#D4A574]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A574] focus:border-[#D4A574] outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A574] focus:border-[#D4A574] outline-none" placeholder="Enter your password" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#1a1a1a] text-white rounded-lg font-medium hover:bg-[#D4A574] transition-colors disabled:opacity-50">
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link href={storeLink("register")} className="text-[#D4A574] hover:underline font-medium">Create one</Link>
        </p>
      </div>
      <RoseoFooter store={store} />
    </div>
  )
}

// ─── Customer Register Page ─────────────────────────────────────────
function CustomerRegisterPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { register, isLoading } = useCustomerAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { storeLink } = useStoreHelpers(store)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await register({ name, email, password, phone })
      window.location.href = storeLink("account")
    } catch {
      setError("Registration failed. Email may already be in use.")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <RoseoNavbar store={store} />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-[#D4A574]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Join us for a better shopping experience</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A574] focus:border-[#D4A574] outline-none" placeholder="Your full name" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A574] focus:border-[#D4A574] outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Phone (optional)</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A574] focus:border-[#D4A574] outline-none" placeholder="+880 1XXX-XXXXXX" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A574] focus:border-[#D4A574] outline-none" placeholder="At least 6 characters" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#1a1a1a] text-white rounded-lg font-medium hover:bg-[#D4A574] transition-colors disabled:opacity-50">
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href={storeLink("login")} className="text-[#D4A574] hover:underline font-medium">Sign in</Link>
        </p>
      </div>
      <RoseoFooter store={store} />
    </div>
  )
}

// ─── Customer Account Page ──────────────────────────────────────────
function CustomerAccountPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { customer, isLoading, logout } = useCustomerAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const { storeLink, formatPrice } = useStoreHelpers(store)

  useEffect(() => {
    if (!customer) return
    fetch(`/api/${store.id}/orders`)
      .then(r => r.json())
      .then(data => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoadingOrders(false))
  }, [customer, store.id])

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>

  if (!customer) {
    return (
      <div className="min-h-screen bg-white">
        <RoseoNavbar store={store} />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Please sign in</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to view your account.</p>
          <Link href={storeLink("login")} className="inline-block px-6 py-3 bg-[#1a1a1a] text-white rounded-lg font-medium hover:bg-[#D4A574] transition-colors">Sign In</Link>
        </div>
        <RoseoFooter store={store} />
      </div>
    )
  }

  const statusColor = (s: string) => {
    const map: Record<string, string> = { PENDING: "bg-yellow-100 text-yellow-700", CONFIRMED: "bg-blue-100 text-blue-700", PROCESSING: "bg-purple-100 text-purple-700", SHIPPED: "bg-indigo-100 text-indigo-700", DELIVERED: "bg-green-100 text-green-700", CANCELLED: "bg-red-100 text-red-700" }
    return map[s] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="min-h-screen bg-white">
      <RoseoNavbar store={store} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-500">{customer.email}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#1a1a1a] rounded-full flex items-center justify-center text-[#D4A574] text-xl font-bold">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{customer.name}</h3>
              <p className="text-sm text-gray-500">{customer.email}</p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><ClipboardList className="w-5 h-5" /> Order History</h2>
        {loadingOrders ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders yet</p>
            <Link href={storeLink("")} className="text-sm text-[#D4A574] hover:underline mt-2 inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <div key={order.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">#{order.orderNumber || order.id.slice(-8)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(order.status)}`}>{order.status}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</span>
                  <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <RoseoFooter store={store} />
    </div>
  )
}

// ─── Wishlist Page ──────────────────────────────────────────────────
function WishlistPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { getWishlistItems, toggleWishlist, wishlistCount } = useWishlist(store.id)
  const items = getWishlistItems(store.products)
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { cartItems, addToCart } = useCart()

  return (
    <div className="min-h-screen bg-white">
      <RoseoNavbar store={store} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
          <span className="text-sm text-gray-500">({wishlistCount} items)</span>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <HeartOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save items you love for later</p>
            <Link href={storeLink("")} className="inline-block px-6 py-3 bg-[#1a1a1a] text-white rounded-lg font-medium hover:bg-[#D4A574] transition-colors">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(product => (
              <div key={product.id} className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={storeLink(`product/${product.slug}`)} className="block">
                  <div className="relative aspect-square bg-gray-100">
                    <Image src={product.images?.[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm font-bold text-[#D4A574] mt-1">{formatPrice(product.price)}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => addToCart(product)} className="flex-1 py-2 text-xs bg-[#1a1a1a] text-white rounded-lg hover:bg-[#D4A574] transition-colors">Add to Cart</button>
                    <button onClick={() => toggleWishlist(product)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <RoseoFooter store={store} />
    </div>
  )
}

// ─── Search Page ───────────────────────────────────────────────────
function SearchPage({ store, query }: { store: StoreTemplateProps["store"]; query?: string }) {
  const [searchQuery, setSearchQuery] = useState(query || "")
  const [sortBy, setSortBy] = useState("newest")
  const { formatPrice, storeLink } = useStoreHelpers(store)

  const filteredProducts = store.products.filter(p => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return p.name.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q) ?? false)
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price
      case "price-high": return b.price - a.price
      case "name": return a.name.localeCompare(b.name)
      default: return 0
    }
  })

  return (
    <div className="min-h-screen bg-white">
      <RoseoNavbar store={store} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Products</h1>
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4A574] focus:border-[#D4A574] outline-none" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A574] outline-none">
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No products found</h2>
            <p className="text-gray-500">Try a different search term</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedProducts.map(product => (
                <RoseoProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} storeLink={storeLink} />
              ))}
            </div>
          </>
        )}
      </div>
      <RoseoFooter store={store} />
    </div>
  )
}

// ─── Scroll To Top ─────────────────────────────────────────────────
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
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#1a1a1a] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#D4A574] transition-all duration-300 animate-fade-in"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}
