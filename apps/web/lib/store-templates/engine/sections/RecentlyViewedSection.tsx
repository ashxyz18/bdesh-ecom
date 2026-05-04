"use client"

import Link from "next/link"
import { useRecentlyViewed } from "../../shared/hooks/useRecentlyViewed"
import type { RecentlyViewedSectionProps } from "../types"
import type { StoreProduct } from "../../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface RecentlyViewedSectionFullProps {
  props: RecentlyViewedSectionProps
  config: TemplateConfig
  products: StoreProduct[]
  storeLink: (subpath: string) => string
}

export function RecentlyViewedSection({ props, config, products, storeLink }: RecentlyViewedSectionFullProps) {
  const theme = useTemplateTheme(config)
  const { getRecentlyViewed } = useRecentlyViewed(config.id)
  const items = getRecentlyViewed(products)

  if (items.length === 0) return null

  return (
    <section className="py-12 border-t border-[var(--tpl-border)]">
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        <h2 className="text-lg font-semibold text-[var(--tpl-text)] mb-4">{props.title || "Recently Viewed"}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {items.map(product => (
            <Link key={product.id} href={storeLink(`product/${product.slug}`)} className="flex-shrink-0 w-40 group">
              <div className={`aspect-square ${theme.radiusClass} overflow-hidden bg-gray-100 mb-2`}>
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                )}
              </div>
              <p className="text-xs font-medium text-[var(--tpl-text)] line-clamp-1">{product.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
