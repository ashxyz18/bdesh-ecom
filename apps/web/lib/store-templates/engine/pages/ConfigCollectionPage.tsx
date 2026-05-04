"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, SlidersHorizontal } from "lucide-react"
import { ConfigProductCard } from "../components/ConfigProductCard"
import type { TemplateConfig } from "../types"
import type { StoreTemplateProps } from "../../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface ConfigCollectionPageProps {
  config: TemplateConfig
  store: StoreTemplateProps["store"]
  slug?: string
  formatPrice: (price: number) => string
  storeLink: (subpath: string) => string
}

export function ConfigCollectionPage({ config, store, slug, formatPrice, storeLink }: ConfigCollectionPageProps) {
  const theme = useTemplateTheme(config)
  const [sortBy, setSortBy] = useState("newest")

  const collection = store.collections.find(c => c.slug === slug)
  const products = collection
    ? store.products.filter(p => p.collectionIds.includes(collection.id))
    : store.products

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-asc": return a.price - b.price
      case "price-desc": return b.price - a.price
      case "name": return a.name.localeCompare(b.name)
      default: return 0
    }
  })

  const cpConfig = config.collectionPage ?? {}
  const cols = (cpConfig as any).gridColumns
  const gridClass = cols === 2
    ? "grid-cols-1 sm:grid-cols-2"
    : cols === 3
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

  return (
    <div className="min-h-screen bg-[var(--tpl-bg)]">
      <main className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 py-8`}>
        {/* Breadcrumb */}
        <nav className="text-sm text-[var(--tpl-text-muted)] mb-6 flex items-center gap-2">
          <Link href={storeLink("")} className="hover:text-[var(--tpl-primary)]">Home</Link>
          <ChevronRight size={14} />
          <span className="text-[var(--tpl-text)]">{collection?.name || "All Products"}</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[var(--tpl-text)]">{collection?.name || "All Products"}</h1>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className={`px-4 py-2.5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-surface)] text-[var(--tpl-text)] text-sm outline-none`}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--tpl-text-muted)]">No products found in this collection.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${gridClass}`}>
            {sortedProducts.map(product => (
              <ConfigProductCard
                key={product.id}
                product={product}
                config={config}
                store={{ id: store.id, subdomain: store.subdomain }}
                formatPrice={formatPrice}
                storeLink={storeLink}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
