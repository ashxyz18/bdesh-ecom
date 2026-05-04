"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, Heart, Minus, Plus, ChevronRight, Truck, ShieldCheck, RefreshCcw, Star } from "lucide-react"
import { useCart } from "../../shared/context/CartContext"
import { useWishlist } from "../../shared/hooks/useWishlist"
import { useRecentlyViewed } from "../../shared/hooks/useRecentlyViewed"
import { ConfigStarRating } from "../components/ConfigStarRating"
import { ConfigProductCard } from "../components/ConfigProductCard"
import type { TemplateConfig, FeatureItem } from "../types"
import type { StoreTemplateProps, StoreProduct } from "../../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

const ICON_MAP: Record<string, any> = { Truck, ShieldCheck, RefreshCcw, Star }

interface ConfigProductPageProps {
  config: TemplateConfig
  store: StoreTemplateProps["store"]
  slug?: string
  formatPrice: (price: number) => string
  storeLink: (subpath: string) => string
}

export function ConfigProductPage({ config, store, slug, formatPrice, storeLink }: ConfigProductPageProps) {
  const theme = useTemplateTheme(config)
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist(store.id)
  const { addProduct, getRecentlyViewed } = useRecentlyViewed(store.id)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const product = store.products.find(p => p.slug === slug)
  const relatedProducts = product
    ? store.products.filter(p => p.id !== product.id && p.collectionIds.some(c => product.collectionIds.includes(c))).slice(0, 4)
    : []
  const recentlyViewed = getRecentlyViewed(store.products).filter(p => p.id !== product?.id).slice(0, 6)

  useEffect(() => {
    if (product) addProduct(product)
  }, [product?.id])

  if (!product) {
    return (
      <div className={`${theme.maxWidthClass} mx-auto px-4 py-16 text-center`}>
        <h1 className="text-2xl font-bold text-[var(--tpl-text)]">Product not found</h1>
        <Link href={storeLink("")} className={`mt-4 inline-block ${theme.bgPrimary} ${theme.textOnPrimary} px-6 py-2 ${theme.radiusClass}`}>Back to Store</Link>
      </div>
    )
  }

  const wishlisted = isInWishlist(product.id)
  const ppConfig = config.productPage ?? { imageLayout: "stacked" as const, showReviews: true, showRecentlyViewed: true, showRelatedProducts: true, showWishlist: true, showFeatures: false, features: [] }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product)
  }

  return (
    <div className="min-h-screen bg-[var(--tpl-bg)]">
      <main className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 py-8`}>
        {/* Breadcrumb */}
        <nav className="text-sm text-[var(--tpl-text-muted)] mb-8 flex items-center gap-2">
          <Link href={storeLink("")} className="hover:text-[var(--tpl-primary)]">Home</Link>
          <ChevronRight size={14} />
          {product.collectionIds.length > 0 && (() => {
            const col = store.collections.find(c => product.collectionIds.includes(c.id))
            return col ? (
              <>
                <Link href={storeLink(`collection/${col.slug}`)} className="hover:text-[var(--tpl-primary)]">{col.name}</Link>
                <ChevronRight size={14} />
              </>
            ) : null
          })()}
          <span className="text-[var(--tpl-text)]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className={`${theme.cardClass} ${theme.radiusClass} overflow-hidden aspect-square mb-4`}>
              {product.images[selectedImage] ? (
                <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ShoppingCart size={48} />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`flex-shrink-0 w-20 h-20 ${theme.radiusClass} overflow-hidden border-2 ${i === selectedImage ? "border-[var(--tpl-primary)]" : "border-[var(--tpl-border)]"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--tpl-text)] mb-2">{product.name}</h1>

            {ppConfig.showReviews && product.averageRating !== undefined && product.averageRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <ConfigStarRating rating={product.averageRating} size="md" />
                <span className="text-sm text-[var(--tpl-text-muted)]">({product.reviewCount} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-[var(--tpl-primary)]">{formatPrice(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-lg text-[var(--tpl-text-muted)] line-through">{formatPrice(product.comparePrice)}</span>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-[var(--tpl-text-muted)] mb-6 leading-relaxed">{product.description}</p>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`flex items-center border border-[var(--tpl-border)] ${theme.radiusClass}`}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-[var(--tpl-text)] hover:bg-[var(--tpl-surface)]"><Minus size={16} /></button>
                <span className="px-4 py-2 text-[var(--tpl-text)] font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-[var(--tpl-text)] hover:bg-[var(--tpl-surface)]"><Plus size={16} /></button>
              </div>
              <button onClick={handleAddToCart} className={`flex-1 py-3 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}>
                <ShoppingCart size={18} /> Add to Cart
              </button>
              {ppConfig.showWishlist && (
                <button onClick={() => toggleWishlist(product)} className={`p-3 border border-[var(--tpl-border)] ${theme.radiusClass} ${wishlisted ? "text-red-500 bg-red-50" : "text-[var(--tpl-text-muted)] hover:text-red-500"} transition-colors`}>
                  <Heart size={20} className={wishlisted ? "fill-current" : ""} />
                </button>
              )}
            </div>

            {/* Features */}
            {ppConfig.showFeatures && ppConfig.features && ppConfig.features.length > 0 && (
              <div className={`grid grid-cols-3 gap-3 mb-6 p-4 ${theme.bgSurface} ${theme.radiusClass}`}>
                {ppConfig.features.map((f, i) => {
                  const Icon = ICON_MAP[f.icon] || Star
                  return (
                    <div key={i} className="text-center">
                      <Icon size={18} className="text-[var(--tpl-primary)] mx-auto mb-1" />
                      <p className="text-xs font-medium text-[var(--tpl-text)]">{f.title}</p>
                      <p className="text-[10px] text-[var(--tpl-text-muted)]">{f.description}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        {ppConfig.showReviews && (
          <section className="mt-12 border-t border-[var(--tpl-border)] pt-8">
            <h2 className="text-xl font-bold text-[var(--tpl-text)] mb-4">Customer Reviews</h2>
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map(review => (
                  <div key={review.id} className={`${theme.cardClass} ${theme.radiusClass} p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <ConfigStarRating rating={review.rating} />
                      <span className="text-sm font-medium text-[var(--tpl-text)]">{review.userName}</span>
                    </div>
                    {review.title && <h4 className="font-medium text-[var(--tpl-text)] text-sm">{review.title}</h4>}
                    {review.comment && <p className="text-sm text-[var(--tpl-text-muted)] mt-1">{review.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--tpl-text-muted)]">No reviews yet.</p>
            )}
          </section>
        )}

        {/* Recently Viewed */}
        {ppConfig.showRecentlyViewed && recentlyViewed.length > 0 && (
          <section className="mt-12 border-t border-[var(--tpl-border)] pt-8">
            <h2 className="text-lg font-semibold text-[var(--tpl-text)] mb-4">Recently Viewed</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recentlyViewed.map(p => (
                <ConfigProductCard key={p.id} product={p} config={config} store={{ id: store.id, subdomain: store.subdomain }} formatPrice={formatPrice} storeLink={storeLink} />
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {ppConfig.showRelatedProducts && relatedProducts.length > 0 && (
          <section className="mt-12 border-t border-[var(--tpl-border)] pt-8">
            <h2 className="text-xl font-bold text-[var(--tpl-text)] mb-4">Related Products</h2>
            <div className={`grid gap-6 ${theme.productGridCols}`}>
              {relatedProducts.map(p => (
                <ConfigProductCard key={p.id} product={p} config={config} store={{ id: store.id, subdomain: store.subdomain }} formatPrice={formatPrice} storeLink={storeLink} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
