"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { ConfigProductCard } from "../components/ConfigProductCard"
import type { TemplateConfig } from "../types"
import type { StoreTemplateProps } from "../../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface ConfigSearchPageProps {
  config: TemplateConfig
  store: StoreTemplateProps["store"]
  formatPrice: (price: number) => string
  storeLink: (subpath: string) => string
  query?: string
}

export function ConfigSearchPage({ config, store, formatPrice, storeLink, query }: ConfigSearchPageProps) {
  const theme = useTemplateTheme(config)
  const [searchQuery, setSearchQuery] = useState(query || "")
  const [sortBy, setSortBy] = useState("newest")

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
    <div className="min-h-screen bg-[var(--tpl-bg)]">
      <div className={`${theme.maxWidthClass} mx-auto px-4 py-8`}>
        <h1 className="text-2xl font-bold text-[var(--tpl-text)] mb-6">Search Products</h1>

        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--tpl-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className={`w-full pl-10 pr-4 py-3 border border-[var(--tpl-border)] ${theme.radiusClass} focus:ring-2 focus:ring-[var(--tpl-primary)] focus:border-[var(--tpl-primary)] outline-none bg-[var(--tpl-surface)] text-[var(--tpl-text)]`}
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className={`border border-[var(--tpl-border)] ${theme.radiusClass} px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--tpl-primary)] outline-none bg-[var(--tpl-surface)] text-[var(--tpl-text)]`}
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-[var(--tpl-text-muted)] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--tpl-text)] mb-2">No products found</h2>
            <p className="text-[var(--tpl-text-muted)]">Try a different search term</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--tpl-text-muted)] mb-4">
              {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""} found
            </p>
            <div className={`grid grid-cols-2 md:grid-cols-3 ${theme.productGridCols} gap-4`}>
              {sortedProducts.map(product => (
                <ConfigProductCard
                  key={product.id}
                  product={product}
                  store={store}
                  config={config}
                  formatPrice={formatPrice}
                  storeLink={storeLink}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
