"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, SlidersHorizontal } from "lucide-react"
import type { ProductsSectionProps } from "../types"
import type { StoreProduct, StoreCollection } from "../../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"
import { ConfigProductCard } from "../components/ConfigProductCard"

interface ProductsSectionFullProps {
  props: ProductsSectionProps
  config: TemplateConfig
  products: StoreProduct[]
  collections: StoreCollection[]
  store: { id: string; subdomain: string }
  formatPrice: (price: number) => string
  storeLink: (subpath: string) => string
}

export function ProductsSection({ props, config, products, collections, store, formatPrice, storeLink }: ProductsSectionFullProps) {
  const theme = useTemplateTheme(config)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCollection, setActiveCollection] = useState("all")

  const filtered = products.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCollection = activeCollection === "all" || p.collectionIds.includes(activeCollection)
    return matchesSearch && matchesCollection
  })

  const cols = props.columns || config.layout.productColumns
  const gridClass = cols === 2
    ? "grid-cols-1 sm:grid-cols-2"
    : cols === 3
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`} id="products">
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        {props.title && <h2 className="text-2xl font-bold text-[var(--tpl-text)] mb-6">{props.title}</h2>}

        {/* Filters */}
        {(props.showFilters || props.showSearch) && (
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {props.showSearch && (
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tpl-text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className={`w-full pl-9 pr-4 py-2.5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-surface)] text-[var(--tpl-text)] text-sm outline-none focus:ring-2 focus:ring-[var(--tpl-primary)]/20`}
                />
              </div>
            )}
            {props.showFilters && collections.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <SlidersHorizontal size={16} className="text-[var(--tpl-text-muted)] shrink-0" />
                <button
                  onClick={() => setActiveCollection("all")}
                  className={`px-3 py-1.5 ${theme.radiusClass} text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCollection === "all"
                      ? `${theme.bgPrimary} ${theme.textOnPrimary}`
                      : "bg-[var(--tpl-surface)] text-[var(--tpl-text-muted)] hover:text-[var(--tpl-text)]"
                  }`}
                >
                  All
                </button>
                {collections.map(col => (
                  <button
                    key={col.id}
                    onClick={() => setActiveCollection(col.id)}
                    className={`px-3 py-1.5 ${theme.radiusClass} text-sm font-medium whitespace-nowrap transition-colors ${
                      activeCollection === col.id
                        ? `${theme.bgPrimary} ${theme.textOnPrimary}`
                        : "bg-[var(--tpl-surface)] text-[var(--tpl-text-muted)] hover:text-[var(--tpl-text)]"
                    }`}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--tpl-text-muted)]">No products found.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${gridClass}`}>
            {filtered.map(product => (
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
        )}
      </div>
    </section>
  )
}
