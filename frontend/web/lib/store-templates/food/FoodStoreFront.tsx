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
  MessageCircle, Utensils, Flame, Award
} from "lucide-react"
import type { StoreTemplateProps, StoreProduct, StoreProductReview } from "../types"
import { useCart } from "../shared/context/CartContext"
import { useCustomerAuth } from "../shared/context/CustomerAuthContext"
import { useRecentlyViewed } from "../shared/hooks/useRecentlyViewed"
import { useWishlist } from "../shared/hooks/useWishlist"

type Product = StoreTemplateProps["store"]["products"][0]

// ─── Main Component ───────────────────────────────────────────────────
export default function FoodStoreFront({ store, path = [] }: StoreTemplateProps) {
  return (
    <FoodRouter store={store} path={path} />
  )
}

// ─── Internal Router ─────────────────────────────────────────────────
function FoodRouter({ store, path }: { store: StoreTemplateProps["store"]; path: string[] }) {
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
  const messages = ["🔥 Free Delivery on Orders Over ৳1,000", "⏰ Order Before 8PM for Same-Day Delivery", "🎉 20% Off First Order - Use Code WELCOME"]
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % messages.length), 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-orange-600 text-white text-center py-2 text-xs tracking-wider uppercase font-medium overflow-hidden">
      <div className="animate-fade-in" key={current}>{messages[current]}</div>
    </div>
  )
}

// ─── Navbar ──────────────────────────────────────────────────────────
function FoodNavbar({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { itemCount } = useCart()
  const { customer, isLoading, logout } = useCustomerAuth()
  const { wishlistCount } = useWishlist(store.id)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
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
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 -ml-2 hover:bg-gray-50 rounded-lg transition-colors">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link href={storeLink("")} className="flex items-center gap-2.5">
              {store.logo ? (
                <Image src={store.logo} alt={store.name} width={36} height={36} className="rounded-lg" />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{store.name.charAt(0)}</span>
                </div>
              )}
              <span className="font-bold text-xl tracking-tight hidden sm:block">{store.name}</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href={storeLink("")} className="text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors">Home</Link>
              <Link href="#menu" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">Menu</Link>
              <Link href={storeLink("search")} className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">Search</Link>
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <Link href={storeLink("search")} className="p-2.5 hover:bg-gray-50 rounded-full transition-colors">
                <Search size={18} className="text-gray-600" />
              </Link>
              <Link href={storeLink("wishlist")} className="relative p-2.5 hover:bg-gray-50 rounded-full transition-colors">
                <Heart size={18} className="text-gray-600" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href={storeLink("cart")} className="relative p-2.5 hover:bg-gray-50 rounded-full transition-colors">
                <ShoppingCart size={18} className="text-gray-600" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
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
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-lg">{store.name}</span>
                <button onClick={() => setMenuOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-1">
                <Link href={storeLink("")} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 font-medium">Home <ChevronRight size={16} className="text-gray-400" /></Link>
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
function FoodFooter({ store }: { store: StoreTemplateProps["store"] }) {
  const { settings, storeLink } = useStoreHelpers(store)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribed(true)
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Get 10% Off Your First Order</h3>
              <p className="text-gray-400 text-sm">Subscribe for deals and new menu items</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input type="email" placeholder="Enter your email" className="flex-1 md:w-72 px-5 py-3 bg-white/10 border border-white/10 rounded-l-full text-sm focus:outline-none focus:border-orange-500 placeholder-gray-500" />
              <button className="px-6 py-3 bg-orange-500 text-white rounded-r-full text-sm font-medium hover:bg-orange-600 transition-colors">Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{store.name.charAt(0)}</span>
              </div>
              <span className="font-bold text-lg">{store.name}</span>
            </div>
            {store.description && <p className="text-gray-400 text-sm leading-relaxed mb-4">{store.description}</p>}
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-orange-400">Quick Links</h4>
            <div className="space-y-2.5 text-sm">
              <Link href={storeLink("")} className="block text-gray-400 hover:text-white transition-colors">Home</Link>
              <Link href={storeLink("search")} className="block text-gray-400 hover:text-white transition-colors">Search</Link>
              <Link href={storeLink("cart")} className="block text-gray-400 hover:text-white transition-colors">Cart</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-orange-400">Contact Us</h4>
            <div className="space-y-3 text-sm text-gray-400">
              {settings?.phone && (
                <div className="flex items-center gap-2"><Phone size={14} className="text-orange-400" /> {settings.phone}</div>
              )}
              {settings?.email && (
                <div className="flex items-center gap-2"><Mail size={14} className="text-orange-400" /> {settings.email}</div>
              )}
              {settings?.address && (
                <div className="flex items-start gap-2"><MapPin size={14} className="text-orange-400 mt-0.5" /> {settings.address}</div>
              )}
              {settings?.whatsapp && (
                <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <MessageCircle size={14} className="text-orange-400" /> Order on WhatsApp
                </a>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-orange-400">Hours</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>{settings?.hours || "Mon - Sun: 10AM - 10PM"}</p>
              <div className="flex items-center gap-2 mt-3">
                <Clock size={14} className="text-orange-400" />
                <span className="text-green-400 text-xs font-medium">Open Now</span>
              </div>
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

// ─── Product Card ─────────────────────────────────────────────────────
function FoodProductCard({ product, store, formatPrice }: { product: Product; store: StoreTemplateProps["store"]; formatPrice: (p: number) => string }) {
  const { storeLink } = useStoreHelpers(store)
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist(store.id)
  const [addedToCart, setAddedToCart] = useState(false)
  const imageUrl = product.images?.[0] || "/placeholder.svg"

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  return (
    <Link href={storeLink(`product/${product.slug}`)} className="group block">
      <div className="relative aspect-square bg-orange-50 rounded-xl overflow-hidden mb-3">
        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            -{Math.round((1 - product.price / product.comparePrice) * 100)}%
          </span>
        )}
        {product.featured && (
          <span className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Flame size={10} /> Popular
          </span>
        )}
        {/* Quick actions */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleQuickAdd}
            className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 ${
              addedToCart ? "bg-green-500 text-white" : "bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-orange-500 hover:text-white"
            }`}
          >
            {addedToCart ? "✓ Added" : "Add to Cart"}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product) }}
            className={`p-2.5 rounded-lg transition-colors ${isInWishlist(product.id) ? "bg-red-50 text-red-500" : "bg-white/95 backdrop-blur-sm hover:bg-red-50 hover:text-red-500"}`}
          >
            <Heart size={16} className={isInWishlist(product.id) ? "fill-current" : ""} />
          </button>
        </div>
      </div>
      <div className="px-1">
        <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors">{product.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.description}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Home Page ───────────────────────────────────────────────────────
function HomePage({ store }: { store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink, settings } = useStoreHelpers(store)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const featuredProducts = store.products.filter(p => p.featured)
  const filteredProducts = store.products.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    return matchesSearch
  })

  const categories = store.collections.length > 0
    ? store.collections.map(c => ({ id: c.id, name: c.name }))
    : [
        { id: "starters", name: "Starters" },
        { id: "mains", name: "Main Dishes" },
        { id: "desserts", name: "Desserts" },
        { id: "drinks", name: "Drinks" },
      ]

  return (
    <div className="min-h-screen bg-white">
      <FoodNavbar store={store} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-16 md:py-24">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium mb-6 tracking-wider uppercase">
                <Flame size={14} /> Order Now
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-6">
                Delicious
                <span className="block text-orange-600">Food Awaits</span>
              </h1>

              <p className="text-base text-gray-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                {store.description || "Order from our carefully curated menu. Fresh ingredients, authentic flavors, delivered right to your door."}
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
                {[
                  { icon: <Truck size={14} />, text: "Free Delivery" },
                  { icon: <Clock size={14} />, text: "30 Min Delivery" },
                  { icon: <RefreshCcw size={14} />, text: "Easy Refunds" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all duration-300 cursor-default">
                    <span className="text-orange-500">{f.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{f.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a href="#menu" className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors group">
                  View Menu <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Stats */}
              <div className="mt-10 flex items-center gap-8 justify-center lg:justify-start">
                {[
                  { value: "1000+", label: "Happy Customers" },
                  { value: "4.8", label: "Average Rating" },
                  { value: "30m", label: "Avg Delivery" },
                ].map((stat, i) => (
                  <Fragment key={i}>
                    {i > 0 && <div className="w-px h-10 bg-gray-200" />}
                    <div className="group cursor-default">
                      <div className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{stat.value}</div>
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
                  <div className="w-full aspect-[3/4] lg:aspect-square bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                        <Utensils className="text-white" size={40} />
                      </div>
                      <h3 className="text-white text-2xl font-bold mb-2">{store.name}</h3>
                      <p className="text-white/60 text-sm">Order Online</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 w-36 bg-white rounded-xl shadow-lg p-4 border border-gray-100 hidden lg:block hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Star size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">4.8</div>
                    <div className="text-[10px] text-gray-500">Top Rated</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Chef's Specials</h2>
                <p className="text-gray-500 text-sm mt-1">Our most popular dishes this week</p>
              </div>
              <a href="#menu" className="text-sm font-medium text-orange-600 hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map(product => (
                <FoodProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Truck size={22} />, title: "Free Delivery", desc: "On orders over ৳1,000" },
              { icon: <Clock size={22} />, title: "30 Min Delivery", desc: "Fast & reliable" },
              { icon: <Shield size={22} />, title: "Secure Payment", desc: "100% secure checkout" },
              { icon: <Award size={22} />, title: "Best Quality", desc: "Fresh ingredients only" },
            ].map((f, i) => (
              <div key={i} className="group p-6 rounded-xl bg-white border border-gray-100 hover:border-orange-300 hover:shadow-lg transition-all duration-500 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 mb-4 group-hover:bg-orange-500 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-orange-600 transition-colors">{f.title}</h3>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Menu */}
      <section id="menu" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h2>
            <p className="text-gray-500 text-sm">Discover something you love</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
              />
            </div>
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${!activeCategory ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === cat.id ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {cat.name}
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
              <p className="text-gray-500 text-lg">No items found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <FoodProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} />
              ))}
            </div>
          )}
        </div>
      </section>

      <FoodRecentlyViewedSection store={store} />

      <FoodFooter store={store} />

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
      <FoodNavbar store={store} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
          <Link href={storeLink("")} className="hover:text-orange-600 transition-colors">Home</Link>
          <ChevronRight size={14} />
          {product.collectionIds.length > 0 && (() => {
            const col = store.collections.find(c => product.collectionIds.includes(c.id))
            return col ? (
              <>
                <Link href={storeLink(`collection/${col.slug}`)} className="hover:text-orange-600 transition-colors">{col.name}</Link>
                <ChevronRight size={14} />
              </>
            ) : null
          })()}
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-orange-50 rounded-2xl overflow-hidden mb-4">
              <img src={product.images?.[selectedImage] || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? "border-orange-500" : "border-transparent opacity-60 hover:opacity-100"}`}>
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
              return col ? <p className="text-xs text-orange-600 uppercase tracking-widest font-medium mb-3">{col.name}</p> : null
            })()}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <FoodStarRating rating={product.averageRating || 0} size="sm" />
              <span className="text-sm text-gray-500">({product.reviewCount || 0} reviews)</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                  <span className="text-sm font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
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
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {addedToCart ? <><Check size={18} /> Added to Cart</> : <><ShoppingCart size={18} /> Add to Cart — {formatPrice(product.price * quantity)}</>}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 border rounded-full transition-colors ${isInWishlist(product.id) ? "border-red-400 text-red-500 bg-red-50" : "border-gray-200 hover:border-red-400 hover:text-red-500"}`}
              >
                {isInWishlist(product.id) ? <Heart size={18} className="fill-current" /> : <Heart size={18} />}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              {[
                { icon: <Truck size={20} />, text: "Free Delivery" },
                { icon: <RefreshCcw size={20} />, text: "Easy Refunds" },
                { icon: <Shield size={20} />, text: "Secure Payment" },
              ].map((f, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto mb-2 text-orange-500">{f.icon}</div>
                  <span className="text-xs text-gray-500">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <FoodProductCard key={p.id} product={p} store={store} formatPrice={formatPrice} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <section className="mt-16 pt-12 border-t">
          <FoodProductReviewsSection product={product} storeId={store.id} />
        </section>

        {/* Recently Viewed */}
        <section className="mt-16">
          <FoodRecentlyViewedSection store={store} />
        </section>
      </main>

      <FoodFooter store={store} />
    </div>
  )
}

// ─── Collection Page ──────────────────────────────────────────────────
function CollectionPage({ store, slug }: { store: StoreTemplateProps["store"]; slug?: string }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const [searchQuery, setSearchQuery] = useState("")

  const collection = store.collections.find(c => c.slug === slug)
  const products = collection
    ? store.products.filter(p => p.collectionIds.includes(collection.id))
    : store.products

  const filteredProducts = products.filter(p =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">
      <FoodNavbar store={store} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href={storeLink("")} className="hover:text-orange-600 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-700">{collection?.name || "All Items"}</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{collection?.name || "All Items"}</h1>
            <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} items</p>
          </div>
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm w-56"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No items in this category</p>
            <Link href={storeLink("")} className="text-sm text-orange-600 hover:underline mt-2 inline-block">Back to shop</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <FoodProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} />
            ))}
          </div>
        )}
      </main>

      <FoodFooter store={store} />
    </div>
  )
}

// ─── Cart Page ────────────────────────────────────────────────────────
function CartPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart()

  return (
    <div className="min-h-screen bg-orange-50">
      <FoodNavbar store={store} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <ShoppingCart size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
            <p className="text-gray-400 text-sm mb-6">Looks like you haven't added anything yet</p>
            <Link href={storeLink("")} className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors">
              Browse Menu <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 bg-white p-4 rounded-xl">
                  <Link href={storeLink(`product/${product.slug}`)} className="w-24 h-24 bg-orange-50 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={product.images?.[0] || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={storeLink(`product/${product.slug}`)} className="font-medium text-sm hover:text-orange-600 transition-colors">{product.name}</Link>
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
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-gray-500">Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Link href={storeLink("checkout")} className="block mt-6 bg-orange-500 text-white text-center py-3.5 rounded-full font-medium hover:bg-orange-600 transition-colors">
                Proceed to Checkout
              </Link>
              <Link href={storeLink("")} className="block mt-3 text-center text-sm text-gray-500 hover:text-orange-600 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>

      <FoodFooter store={store} />
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
      <div className="min-h-screen bg-orange-50">
        <FoodNavbar store={store} />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-8">Thank you for your order. We'll start preparing it right away!</p>
          <Link href={storeLink("")} className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors">
            Back to Menu <ArrowRight size={16} />
          </Link>
        </div>
        <FoodFooter store={store} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <FoodNavbar store={store} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link href={storeLink("")} className="text-sm text-orange-600 hover:underline">Go to menu</Link>
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
                      <input type="text" required value={form.name} onChange={e => updateField("name", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
                      <input type="tel" required value={form.phone} onChange={e => updateField("phone", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Email</label>
                      <input type="email" value={form.email} onChange={e => updateField("email", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Address *</label>
                      <input type="text" required value={form.address} onChange={e => updateField("address", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">City *</label>
                      <input type="text" required value={form.city} onChange={e => updateField("city", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Order Note</label>
                      <input type="text" value={form.note} onChange={e => updateField("note", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
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
                      <label key={method.id} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${form.paymentMethod === method.id ? "border-orange-400 bg-orange-50" : "hover:bg-gray-50"}`}>
                        <input type="radio" name="payment" value={method.id} checked={form.paymentMethod === method.id} onChange={e => updateField("paymentMethod", e.target.value)} className="accent-orange-500" />
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
                <button type="submit" disabled={loading} className="w-full mt-6 bg-orange-500 text-white py-3.5 rounded-full font-medium hover:bg-orange-600 disabled:bg-gray-300 transition-colors">
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      <FoodFooter store={store} />
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
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
    >
      <ArrowUp size={20} />
    </button>
  )
}

// ─── Star Rating ─────────────────────────────────────────────────────
function FoodStarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "size-6" : size === "md" ? "size-5" : "size-4"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`${sizeClass} ${s <= Math.round(rating) ? "fill-orange-400 text-orange-400" : "text-gray-200 fill-gray-200"}`} />
      ))}
    </div>
  )
}

// ─── Recently Viewed Section ──────────────────────────────────────────
function FoodRecentlyViewedSection({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const { getRecentlyViewed } = useRecentlyViewed(store.id)
  const items = getRecentlyViewed(store.products)

  if (items.length === 0) return null

  return (
    <section className="py-12 border-t">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {items.map(product => (
            <Link key={product.id} href={storeLink(`product/${product.slug}`)} className="flex-shrink-0 w-40 group">
              <div className="aspect-square bg-orange-50 rounded-lg overflow-hidden mb-2">
                <img src={product.images?.[0] || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors">{product.name}</h3>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatPrice(product.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Product Reviews Section ─────────────────────────────────────────
function FoodProductReviewsSection({ product, storeId }: { product: Product; storeId: string }) {
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

      {customer && (
        <form onSubmit={handleSubmit} className="bg-orange-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600 mr-2">Rating:</span>
            {[5, 4, 3, 2, 1].map(star => (
              <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                <Star className={`size-5 ${star <= rating ? "fill-orange-400 text-orange-400" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
          <input type="text" placeholder="Review title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none mb-3" />
          <textarea placeholder="Share your experience..." value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none mb-3 resize-none" />
          <button type="submit" disabled={submitting || !comment} className="bg-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-orange-600 disabled:bg-gray-300 transition-colors flex items-center gap-2">
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit Review</>}
          </button>
        </form>
      )}

      {!customer && (
        <div className="bg-orange-50 rounded-xl p-6 mb-8 text-center">
          <p className="text-gray-600 mb-3">Please log in to write a review</p>
          <Link href={`/store?path=login`} className="text-orange-600 font-medium hover:underline">Login →</Link>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this item!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border border-gray-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <FoodStarRating rating={review.rating} size="sm" />
                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              {review.title && <h4 className="font-semibold text-sm text-gray-900 mb-1">{review.title}</h4>}
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
    <div className="min-h-screen bg-orange-50">
      <FoodNavbar store={store} />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h1>
          <p className="text-gray-500 text-center text-sm mb-6">Sign in to your account</p>
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-orange-500 text-white py-3 rounded-full font-medium hover:bg-orange-600 disabled:bg-gray-300 transition-colors">
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account? <Link href={storeLink("register")} className="text-orange-600 font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
      <FoodFooter store={store} />
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
    <div className="min-h-screen bg-orange-50">
      <FoodNavbar store={store} />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Create Account</h1>
          <p className="text-gray-500 text-center text-sm mb-6">Join us for exclusive deals</p>
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-orange-500 text-white py-3 rounded-full font-medium hover:bg-orange-600 disabled:bg-gray-300 transition-colors">
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link href={storeLink("login")} className="text-orange-600 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
      <FoodFooter store={store} />
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin size-8 text-orange-500" /></div>
  if (!customer) return (window.location.href = storeLink("login"), <></>)

  return (
    <div className="min-h-screen bg-orange-50">
      <FoodNavbar store={store} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-500 text-sm mt-1">{customer.name} • {customer.email}</p>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order History</h2>
          {loadingOrders ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin size-6 text-orange-500" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500">No orders yet</p>
              <Link href={storeLink("")} className="text-orange-600 font-medium hover:underline text-sm mt-2 inline-block">Browse Menu →</Link>
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
      <FoodFooter store={store} />
    </div>
  )
}

// ─── Wishlist Page ────────────────────────────────────────────────────
function WishlistPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink, formatPrice } = useStoreHelpers(store)
  const { getWishlistItems, toggleWishlist } = useWishlist(store.id)
  const items = getWishlistItems(store.products)

  return (
    <div className="min-h-screen bg-orange-50">
      <FoodNavbar store={store} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Wishlist</h1>
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <HeartOff size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 text-lg mb-2">Your wishlist is empty</p>
            <p className="text-gray-400 text-sm mb-6">Save items you love for later</p>
            <Link href={storeLink("")} className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors">
              Browse Menu <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map(product => (
              <div key={product.id} className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <Link href={storeLink(`product/${product.slug}`)} className="block">
                  <div className="relative aspect-square bg-orange-50">
                    <img src={product.images?.[0] || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{formatPrice(product.price)}</p>
                  <button onClick={() => toggleWishlist(product)} className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1">
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <FoodFooter store={store} />
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
      <FoodNavbar store={store} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Menu</h1>
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search menu items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-orange-400">
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 text-lg">No items found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map(product => (
              <FoodProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} />
            ))}
          </div>
        )}
      </div>
      <FoodFooter store={store} />
    </div>
  )
}
