"use client"

import type { FeaturedProductsSectionProps } from "../types"
import type { StoreProduct } from "../../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"
import { ConfigProductCard } from "../components/ConfigProductCard"

interface FeaturedProductsSectionFullProps {
  props: FeaturedProductsSectionProps
  config: TemplateConfig
  products: StoreProduct[]
  store: { id: string; subdomain: string }
  formatPrice: (price: number) => string
  storeLink: (subpath: string) => string
}

export function FeaturedProductsSection({ props, config, products, store, formatPrice, storeLink }: FeaturedProductsSectionFullProps) {
  const theme = useTemplateTheme(config)
  const featured = products.filter(p => p.featured).slice(0, props.limit || 4)

  if (featured.length === 0) return null

  const cols = props.columns || config.layout.productColumns
  const gridClass = cols === 2
    ? "grid-cols-1 sm:grid-cols-2"
    : cols === 3
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-surface)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        {props.title && <h2 className="text-2xl font-bold text-[var(--tpl-text)] mb-6">{props.title}</h2>}
        <div className={`grid gap-6 ${gridClass}`}>
          {featured.map(product => (
            <ConfigProductCard
              key={product.id}
              product={product}
              config={config}
              store={store}
              formatPrice={formatPrice}
              storeLink={storeLink}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
