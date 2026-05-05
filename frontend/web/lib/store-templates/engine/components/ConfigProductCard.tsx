"use client"

import Link from "next/link"
import { Heart, ShoppingCart } from "lucide-react"
import { useCart } from "../../shared/context/CartContext"
import { useWishlist } from "../../shared/hooks/useWishlist"
import { ConfigStarRating } from "./ConfigStarRating"
import type { TemplateConfig } from "../types"
import type { StoreProduct } from "../../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"
import { SafeImage } from "./SafeImage"

interface ConfigProductCardProps {
  product: StoreProduct
  config: TemplateConfig
  store: { id: string; subdomain: string }
  formatPrice: (price: number) => string
  storeLink: (subpath: string) => string
}

export function ConfigProductCard({ product, config, store, formatPrice, storeLink }: ConfigProductCardProps) {
  const theme = useTemplateTheme(config)
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist(store.id)
  const wishlisted = isInWishlist(product.id)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <Link href={storeLink(`product/${product.slug}`)} className="group block">
      <div className={`${theme.cardClass} ${theme.radiusClass} overflow-hidden transition-all duration-300 group-hover:shadow-lg`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images[0] ? (
            <SafeImage
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart size={32} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.comparePrice && product.comparePrice > product.price && (
              <span className={`px-2 py-0.5 text-[10px] font-bold ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass}`}>
                SALE
              </span>
            )}
            {product.featured && (
              <span className={`px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white ${theme.radiusClass}`}>
                FEATURED
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 w-8 h-8 ${theme.radiusClass} flex items-center justify-center transition-all ${
              wishlisted
                ? "bg-red-50 text-red-500"
                : "bg-white/80 backdrop-blur-sm text-gray-600 hover:text-red-500"
            }`}
          >
            <Heart size={16} className={wishlisted ? "fill-current" : ""} />
          </button>

          {/* Quick Add */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleQuickAdd}
              className={`w-full py-2.5 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
            >
              <ShoppingCart size={14} /> Add to Cart
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--tpl-text)] line-clamp-1 group-hover:text-[var(--tpl-primary)] transition-colors">
            {product.name}
          </h3>
          {(product.averageRating !== undefined && product.averageRating > 0) && (
            <div className="mt-1">
              <ConfigStarRating rating={product.averageRating} />
            </div>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--tpl-text)]">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-[var(--tpl-text-muted)] line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
