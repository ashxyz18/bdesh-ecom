"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ShoppingCart, Menu, X, Search, Minus, Plus, Trash2,
  ArrowRight, Truck, RefreshCcw, Shield, CreditCard, Check,
  Heart, User, Star, LogIn, UserPlus, LogOut, ClipboardList,
  HeartOff, Loader2, Clock, Package, ArrowUp, Zap, RotateCcw
} from "lucide-react"
import type { StoreTemplateProps, StoreProduct, StoreProductReview } from "../types"
import { useCart } from "../shared/context/CartContext"
import { useCustomerAuth } from "../shared/context/CustomerAuthContext"
import { useRecentlyViewed } from "../shared/hooks/useRecentlyViewed"
import { useWishlist } from "../shared/hooks/useWishlist"

type Product = StoreTemplateProps["store"]["products"][0]

// ─── Main Component ───────────────────────────────────────────────
export default function MinimalStoreFront({ store, path = [] }: StoreTemplateProps) {
  return <MinimalRouter store={store} path={path} />
}

// ─── Internal Router ─────────────────────────────────────────────────
function MinimalRouter({ store, path }: { store: StoreTemplateProps["store"]; path: string[] }) {
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

// ─── Shared Helpers ──────────────────────────────────────────────────
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

// ─── Navbar ──────────────────────────────────────────────────────────
function MinimalNavbar({ store }: { store: StoreTemplateProps["store"] }) {
  const { storeLink } = useStoreHelpers(store)
  const { itemCount } = useCart()
  const { customer } = useCustomerAuth()
  const { wishlistCount } = useWishlist(store.id)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-white"} border-b`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-1">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href={storeLink("")} className="font-bold text-xl tracking-tight">
              {store.name}
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <Link href={storeLink("")} className="text-sm text-gray-600 hover:text-black transition-colors">Home</Link>
            {store.collections.slice(0, 4).map(col => (
              <Link key={col.id} href={storeLink(`collection/${col.slug}`)} className="text-sm text-gray-600 hover:text-black transition-colors">{col.name}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href={storeLink("search")} className="p-2 text-gray-600 hover:text-black transition-colors">
              <Search size={20} />
            </Link>
            <Link href={storeLink("wishlist")} className="relative p-2 text-gray-600 hover:text-black transition-colors">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-pink-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link href={storeLink("cart")} className="relative p-2 text-gray-600 hover:text-black transition-colors">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="p-2 text-gray-600 hover:text-black transition-colors">
                <User size={20} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {customer ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                        <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                      </div>
                      <Link href={storeLink("account")} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                        <User size={14} /> My Account
                      </Link>
                      <Link href={storeLink("wishlist")} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                        <Heart size={14} /> Wishlist
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href={storeLink("login")} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                        <LogIn size={14} /> Sign In
                      </Link>
                      <Link href={storeLink("register")} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                        <UserPlus size={14} /> Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t bg-white">
          <nav className="flex flex-col p-4 gap-3 text-sm">
            <Link href={storeLink("")} onClick={() => setMenuOpen(false)} className="py-2 font-medium">Home</Link>
            {store.collections.map(col => (
              <Link key={col.id} href={storeLink(`collection/${col.slug}`)} onClick={() => setMenuOpen(false)} className="py-2 text-gray-600">{col.name}</Link>
            ))}
            <div className="border-t pt-2 mt-1">
              <Link href={storeLink("search")} onClick={() => setMenuOpen(false)} className="py-2 text-gray-600 flex items-center gap-2"><Search size={14} /> Search</Link>
              <Link href={storeLink("wishlist")} onClick={() => setMenuOpen(false)} className="py-2 text-gray-600 flex items-center gap-2"><Heart size={14} /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</Link>
              <Link href={storeLink("cart")} onClick={() => setMenuOpen(false)} className="py-2 text-gray-600 flex items-center gap-2"><ShoppingCart size={14} /> Cart ({itemCount})</Link>
              {customer ? (
                <Link href={storeLink("account")} onClick={() => setMenuOpen(false)} className="py-2 text-gray-600 flex items-center gap-2"><User size={14} /> My Account</Link>
              ) : (
                <>
                  <Link href={storeLink("login")} onClick={() => setMenuOpen(false)} className="py-2 text-gray-600 flex items-center gap-2"><LogIn size={14} /> Sign In</Link>
                  <Link href={storeLink("register")} onClick={() => setMenuOpen(false)} className="py-2 text-gray-600 flex items-center gap-2"><UserPlus size={14} /> Create Account</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────
function MinimalFooter({ store }: { store: StoreTemplateProps["store"] }) {
  const { settings } = useStoreHelpers(store)
  return (
    <footer className="border-t mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-3">{store.name}</h3>
            {store.description && <p className="text-gray-500 text-sm leading-relaxed">{store.description}</p>}
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">Collections</h4>
            <div className="space-y-2 text-sm">
              {store.collections.map(col => (
                <a key={col.id} href={`?store=${store.subdomain}&path=collection/${col.slug}`} className="block text-gray-600 hover:text-black transition-colors">{col.name}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">Contact</h4>
            <div className="space-y-2 text-sm text-gray-600">
              {settings?.phone && <p>{settings.phone}</p>}
              {settings?.email && <p>{settings.email}</p>}
              {settings?.address && <p>{settings.address}</p>}
            </div>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-gray-400 text-xs">
          © {new Date().getFullYear()} {store.name}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

// ─── Product Card ────────────────────────────────────────────────────
function MinimalProductCard({ product, store, formatPrice }: { product: Product; store: StoreTemplateProps["store"]; formatPrice: (p: number) => string }) {
  const { storeLink } = useStoreHelpers(store)
  const imageUrl = product.images?.[0] || "/placeholder.svg"

  return (
    <a href={storeLink(`product/${product.slug}`)} className="group block">
      <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3 relative">
        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-medium px-2 py-1 rounded-full">
            SALE
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="text-gray-400 line-through text-xs">{formatPrice(product.comparePrice)}</span>
        )}
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
      <MinimalNavbar store={store} />

      {/* Hero */}
      <section className="relative py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">{store.name}</h1>
          {store.description && (
            <p className="text-gray-500 max-w-xl mx-auto text-lg">{store.description}</p>
          )}
          <div className="mt-8">
            <a href="#products" className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
              Shop Now <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && !searchQuery && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Featured</h2>
              <a href="#products" className="text-sm text-gray-500 hover:text-black transition-colors">View All →</a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map(product => (
                <MinimalProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section id="products" className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold">
              {searchQuery ? `Results for "${searchQuery}"` : activeCollection ? store.collections.find(c => c.id === activeCollection)?.name || "Products" : "All Products"}
            </h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-full border border-gray-200 focus:outline-none focus:border-gray-400 w-64"
              />
            </div>
          </div>

          {/* Collection Filter */}
          {store.collections.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveCollection(null)}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${!activeCollection ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                All
              </button>
              {store.collections.map(col => (
                <button
                  key={col.id}
                  onClick={() => setActiveCollection(col.id)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors ${activeCollection === col.id ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {col.name}
                </button>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <MinimalProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} />
              ))}
            </div>
          )}
        </div>
      </section>

      <MinimalRecentlyViewedSection store={store} />
      <MinimalFooter store={store} />
    </div>
  )
}

// ─── Product Page ───────────────────────────────────────────────────
function ProductPage({ store, slug }: { store: StoreTemplateProps["store"]; slug?: string }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { addToCart } = useCart()
  const { addProduct } = useRecentlyViewed(store.id)
  const { isInWishlist, toggleWishlist } = useWishlist(store.id)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const product = store.products.find(p => p.slug === slug)
  if (!product) return <div className="min-h-screen flex items-center justify-center"><p>Product not found</p></div>

  useEffect(() => {
    addProduct(product)
  }, [product, addProduct])

  const handleAddToCart = () => {
    addToCart(product, quantity)
  }

  const relatedProducts = store.products.filter(p => p.id !== product.id && p.collectionIds.some(id => product.collectionIds.includes(id))).slice(0, 4)

  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar store={store} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8">
          <a href={storeLink("")} className="hover:text-black transition-colors">Home</a>
          <span className="mx-2">/</span>
          {product.collectionIds.length > 0 && (() => {
            const col = store.collections.find(c => product.collectionIds.includes(c.id))
            return col ? (
              <>
                <a href={storeLink(`collection/${col.slug}`)} className="hover:text-black transition-colors">{col.name}</a>
                <span className="mx-2">/</span>
              </>
            ) : null
          })()}
          <span className="text-gray-600">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4">
              <img src={product.images?.[selectedImage] || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-black" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.collectionIds.length > 0 && (() => {
              const col = store.collections.find(c => product.collectionIds.includes(c.id))
              return col ? <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">{col.name}</p> : null
            })()}
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-gray-400 line-through text-lg">{formatPrice(product.comparePrice)}</span>
                  <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
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
              <div className="flex items-center border rounded-full">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 rounded-l-full transition-colors">
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50 rounded-r-full transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 bg-black text-white py-3.5 rounded-full font-medium hover:bg-gray-800 transition-colors">
                Add to Cart — {formatPrice(product.price * quantity)}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-full border transition-all ${isInWishlist(product.id) ? "bg-pink-50 border-pink-300 text-pink-500" : "border-gray-200 text-gray-400 hover:text-pink-500 hover:border-pink-300"}`}
              >
                <Heart size={20} className={isInWishlist(product.id) ? "fill-pink-500" : ""} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck size={20} className="mx-auto mb-2 text-gray-400" />
                <span className="text-xs text-gray-500">Free Shipping</span>
              </div>
              <div className="text-center">
                <RefreshCcw size={20} className="mx-auto mb-2 text-gray-400" />
                <span className="text-xs text-gray-500">Easy Returns</span>
              </div>
              <div className="text-center">
                <Shield size={20} className="mx-auto mb-2 text-gray-400" />
                <span className="text-xs text-gray-500">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <MinimalProductReviewsSection product={product} storeId={store.id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t">
            <h2 className="text-xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <MinimalProductCard key={p.id} product={p} store={store} formatPrice={formatPrice} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        <MinimalRecentlyViewedSection store={store} />
      </main>

      <MinimalFooter store={store} />
    </div>
  )
}

// ─── Collection Page ─────────────────────────────────────────────────
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
      <MinimalNavbar store={store} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-6">
          <a href={storeLink("")} className="hover:text-black transition-colors">Home</a>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{collection?.name || "All Products"}</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{collection?.name || "All Products"}</h1>
          <span className="text-sm text-gray-400">{filteredProducts.length} products</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No products in this collection</p>
            <a href={storeLink("")} className="text-sm text-black underline mt-2 inline-block">Back to shop</a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <MinimalProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} />
            ))}
          </div>
        )}
      </main>

      <MinimalFooter store={store} />
    </div>
  )
}

// ─── Cart Page ───────────────────────────────────────────────────────
function CartPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart()

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavbar store={store} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <ShoppingCart size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <a href={storeLink("")} className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
              Continue Shopping <ArrowRight size={16} />
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 bg-white p-4 rounded-xl">
                  <a href={storeLink(`product/${product.slug}`)} className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={product.images?.[0] || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
                  </a>
                  <div className="flex-1 min-w-0">
                    <a href={storeLink(`product/${product.slug}`)} className="font-medium text-sm hover:underline">{product.name}</a>
                    <p className="text-sm font-semibold mt-1">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border rounded-full">
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
              <a href={storeLink("checkout")} className="block mt-6 bg-black text-white text-center py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                Checkout
              </a>
              <a href={storeLink("")} className="block mt-3 text-center text-sm text-gray-500 hover:text-black transition-colors">
                Continue Shopping
              </a>
            </div>
          </div>
        )}
      </main>

      <MinimalFooter store={store} />
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
      <div className="min-h-screen bg-gray-50">
        <MinimalNavbar store={store} />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-8">Thank you for your order. We'll contact you shortly.</p>
          <a href={storeLink("")} className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
            Continue Shopping <ArrowRight size={16} />
          </a>
        </div>
        <MinimalFooter store={store} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavbar store={store} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <a href={storeLink("")} className="text-sm text-black underline">Go to shop</a>
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
                      <input type="text" required value={form.name} onChange={e => updateField("name", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
                      <input type="tel" required value={form.phone} onChange={e => updateField("phone", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Email</label>
                      <input type="email" value={form.email} onChange={e => updateField("email", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Address *</label>
                      <input type="text" required value={form.address} onChange={e => updateField("address", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">City *</label>
                      <input type="text" required value={form.city} onChange={e => updateField("city", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Order Note</label>
                      <input type="text" value={form.note} onChange={e => updateField("note", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
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
                      <label key={method.id} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${form.paymentMethod === method.id ? "border-black bg-gray-50" : "hover:bg-gray-50"}`}>
                        <input type="radio" name="payment" value={method.id} checked={form.paymentMethod === method.id} onChange={e => updateField("paymentMethod", e.target.value)} className="accent-black" />
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
                <button type="submit" disabled={loading} className="w-full mt-6 bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 disabled:bg-gray-300 transition-colors">
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      <MinimalFooter store={store} />
    </div>
  )
}

// ─── Star Rating ───────────────────────────────────────────────────
function MinimalStarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
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
function MinimalRecentlyViewedSection({ store }: { store: StoreTemplateProps["store"] }) {
  const { getRecentlyViewed } = useRecentlyViewed(store.id)
  const items = getRecentlyViewed(store.products)
  const { formatPrice, storeLink } = useStoreHelpers(store)

  if (items.length === 0) return null

  return (
    <section className="py-12 border-t">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Recently Viewed</h2>
          <Clock size={18} className="text-gray-400" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {items.map(product => (
            <Link key={product.id} href={storeLink(`product/${product.slug}`)} className="flex-shrink-0 w-40 group">
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2">
                <img src={product.images?.[0] || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
              <p className="text-sm font-bold">{formatPrice(product.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Product Reviews Section ───────────────────────────────────────
function MinimalProductReviewsSection({ product, storeId }: { product: Product; storeId: string }) {
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
        body: JSON.stringify({ productId: product.id, storeId, rating: formRating, title: formTitle, comment: formComment, userId: customer.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setReviews(prev => [data.review, ...prev])
        setShowForm(false); setFormTitle(""); setFormComment(""); setFormRating(5)
      }
    } finally { setSubmitting(false) }
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Customer Reviews</h3>
        {customer && <button onClick={() => setShowForm(!showForm)} className="text-sm text-gray-600 hover:text-black font-medium">Write a Review</button>}
      </div>
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="text-3xl font-bold">{averageRating}</div>
          <MinimalStarRating rating={averageRating} size="md" />
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
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} /></div>
                <span className="w-6 text-gray-500">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-xl space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} type="button" onClick={() => setFormRating(i)} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)}>
                  <Star className={`w-7 h-7 cursor-pointer transition-colors ${i <= (hoverRating || formRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Title (optional)</label>
            <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" placeholder="Summarize your review" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Review *</label>
            <textarea value={formComment} onChange={e => setFormComment(e.target.value)} required rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none" placeholder="Share your experience" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 disabled:opacity-50">{submitting ? "Submitting..." : "Submit Review"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-black">Cancel</button>
          </div>
        </form>
      )}
      {reviews.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <MinimalStarRating rating={review.rating} />
                {review.title && <span className="text-sm font-semibold">{review.title}</span>}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <span>{review.userName}</span><span>•</span>
                <span>{new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
              {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
      {!customer && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-sm text-gray-500"><Link href={`?store=${storeId}&path=login`} className="text-black hover:underline font-medium">Sign in</Link> to write a review</p>
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
    e.preventDefault(); setError("")
    try { await login(email, password); window.location.href = storeLink("account") } catch { setError("Invalid email or password") }
  }

  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar store={store} />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4"><LogIn className="w-8 h-8 text-white" /></div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-sm font-medium mb-1 block">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400" placeholder="you@example.com" /></div>
          <div><label className="text-sm font-medium mb-1 block">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400" placeholder="Enter your password" /></div>
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 disabled:opacity-50">{isLoading ? "Signing in..." : "Sign In"}</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">Don't have an account? <Link href={storeLink("register")} className="text-black hover:underline font-medium">Create one</Link></p>
      </div>
      <MinimalFooter store={store} />
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
    e.preventDefault(); setError("")
    try { await register({ name, email, password, phone }); window.location.href = storeLink("account") } catch { setError("Registration failed. Email may already be in use.") }
  }

  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar store={store} />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4"><UserPlus className="w-8 h-8 text-white" /></div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-gray-500 mt-2">Join us for a better shopping experience</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-sm font-medium mb-1 block">Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400" placeholder="Your full name" /></div>
          <div><label className="text-sm font-medium mb-1 block">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400" placeholder="you@example.com" /></div>
          <div><label className="text-sm font-medium mb-1 block">Phone (optional)</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400" placeholder="+880 1XXX-XXXXXX" /></div>
          <div><label className="text-sm font-medium mb-1 block">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400" placeholder="At least 6 characters" /></div>
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 disabled:opacity-50">{isLoading ? "Creating account..." : "Create Account"}</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link href={storeLink("login")} className="text-black hover:underline font-medium">Sign in</Link></p>
      </div>
      <MinimalFooter store={store} />
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
    fetch(`/api/${store.id}/orders`).then(r => r.json()).then(data => setOrders(data.orders || [])).catch(() => {}).finally(() => setLoadingOrders(false))
  }, [customer, store.id])

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>

  if (!customer) {
    return (
      <div className="min-h-screen bg-white">
        <MinimalNavbar store={store} />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Please sign in</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to view your account.</p>
          <Link href={storeLink("login")} className="inline-block px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800">Sign In</Link>
        </div>
        <MinimalFooter store={store} />
      </div>
    )
  }

  const statusColor = (s: string) => {
    const map: Record<string, string> = { PENDING: "bg-yellow-100 text-yellow-700", CONFIRMED: "bg-blue-100 text-blue-700", PROCESSING: "bg-purple-100 text-purple-700", SHIPPED: "bg-indigo-100 text-indigo-700", DELIVERED: "bg-green-100 text-green-700", CANCELLED: "bg-red-100 text-red-700" }
    return map[s] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar store={store} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-bold">My Account</h1><p className="text-gray-500">{customer.email}</p></div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600"><LogOut size={16} /> Sign Out</button>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white text-xl font-bold">{customer.name.charAt(0).toUpperCase()}</div>
            <div><h3 className="font-bold">{customer.name}</h3><p className="text-sm text-gray-500">{customer.email}</p></div>
          </div>
        </div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><ClipboardList size={20} /> Order History</h2>
        {loadingOrders ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl"><Package className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No orders yet</p><Link href={storeLink("")} className="text-sm text-black hover:underline mt-2 inline-block">Start Shopping</Link></div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <div key={order.id} className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">#{order.orderNumber || order.id.slice(-8)}</span>
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
      <MinimalFooter store={store} />
    </div>
  )
}

// ─── Wishlist Page ──────────────────────────────────────────────────
function WishlistPage({ store }: { store: StoreTemplateProps["store"] }) {
  const { getWishlistItems, toggleWishlist, wishlistCount } = useWishlist(store.id)
  const items = getWishlistItems(store.products)
  const { formatPrice, storeLink } = useStoreHelpers(store)
  const { addToCart } = useCart()

  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar store={store} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-6 h-6 text-pink-500" />
          <h1 className="text-2xl font-bold">Wishlist</h1>
          <span className="text-sm text-gray-500">({wishlistCount} items)</span>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <HeartOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save items you love for later</p>
            <Link href={storeLink("")} className="inline-block px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(product => (
              <div key={product.id} className="group border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={storeLink(`product/${product.slug}`)} className="block">
                  <div className="relative aspect-square bg-gray-50">
                    <img src={product.images?.[0] || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="text-sm font-medium truncate">{product.name}</h3>
                  <p className="text-sm font-bold mt-1">{formatPrice(product.price)}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => addToCart(product)} className="flex-1 py-2 text-xs bg-black text-white rounded-full hover:bg-gray-800">Add to Cart</button>
                    <button onClick={() => toggleWishlist(product)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <MinimalFooter store={store} />
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
      <MinimalNavbar store={store} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Search Products</h1>
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-3 border rounded-full focus:outline-none focus:border-gray-400" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded-full px-4 py-3 text-sm focus:outline-none focus:border-gray-400">
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20"><Search className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">No products found</h2><p className="text-gray-500">Try a different search term</p></div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedProducts.map(product => (
                <MinimalProductCard key={product.id} product={product} store={store} formatPrice={formatPrice} />
              ))}
            </div>
          </>
        )}
      </div>
      <MinimalFooter store={store} />
    </div>
  )
}
