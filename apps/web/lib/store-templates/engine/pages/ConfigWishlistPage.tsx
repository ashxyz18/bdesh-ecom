"use client"

import Link from "next/link"
import { Heart, HeartOff, Trash2, ShoppingCart } from "lucide-react"
import { useWishlist } from "../../shared/hooks/useWishlist"
import { useCart } from "../../shared/context/CartContext"
import type { TemplateConfig } from "../types"
import type { StoreTemplateProps } from "../../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface ConfigWishlistPageProps {
  config: TemplateConfig
  store: StoreTemplateProps["store"]
  formatPrice: (price: number) => string
  storeLink: (subpath: string) => string
}

export function ConfigWishlistPage({ config, store, formatPrice, storeLink }: ConfigWishlistPageProps) {
  const theme = useTemplateTheme(config)
  const { getWishlistItems, toggleWishlist, wishlistCount } = useWishlist(store.id)
  const { addToCart } = useCart()
  const items = getWishlistItems(store.products)

  return (
    <div className="min-h-screen bg-[var(--tpl-bg)]">
      <div className={`${theme.maxWidthClass} mx-auto px-4 py-8`}>
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-6 h-6 text-[var(--tpl-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--tpl-text)]">Wishlist</h1>
          <span className="text-sm text-[var(--tpl-text-muted)]">({wishlistCount} items)</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <HeartOff className="w-16 h-16 text-[var(--tpl-text-muted)] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--tpl-text)] mb-2">Your wishlist is empty</h2>
            <p className="text-[var(--tpl-text-muted)] mb-6">Save items you love for later</p>
            <Link
              href={storeLink("")}
              className={`inline-block px-6 py-3 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity`}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className={`grid grid-cols-2 md:grid-cols-3 ${theme.productGridCols} gap-4`}>
            {items.map(product => (
              <div
                key={product.id}
                className={`group bg-[var(--tpl-surface)] ${theme.cardClass} ${theme.radiusClass} overflow-hidden hover:shadow-lg transition-shadow`}
              >
                <Link href={storeLink(`product/${product.slug}`)} className="block">
                  <div className="relative aspect-square bg-gray-100">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--tpl-text-muted)]">
                        <ShoppingCart size={24} />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-[var(--tpl-text)] truncate">{product.name}</h3>
                  <p className="text-sm font-bold text-[var(--tpl-primary)] mt-1">{formatPrice(product.price)}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => addToCart(product)}
                      className={`flex-1 py-2 text-xs ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} hover:opacity-90 transition-opacity`}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`p-2 text-red-500 hover:bg-red-50 ${theme.radiusClass} transition-colors`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
