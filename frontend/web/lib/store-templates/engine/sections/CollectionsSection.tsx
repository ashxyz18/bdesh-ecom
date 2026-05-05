"use client"

import Link from "next/link"
import type { CollectionsSectionProps } from "../types"
import type { StoreCollection } from "../../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"
import type { TemplateConfig } from "../types"

interface CollectionsSectionFullProps {
  props: CollectionsSectionProps
  config: TemplateConfig
  collections: StoreCollection[]
  storeLink: (subpath: string) => string
}

export function CollectionsSection({ props, config, collections, storeLink }: CollectionsSectionFullProps) {
  const theme = useTemplateTheme(config)
  const cols = props.columns || 4
  const limit = props.limit || 8
  const items = collections.slice(0, limit)

  if (items.length === 0) return null

  const gridClass = cols <= 2
    ? "grid-cols-1 sm:grid-cols-2"
    : cols === 3
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"

  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        {props.title && <h2 className="text-2xl font-bold text-[var(--tpl-text)] mb-6">{props.title}</h2>}
        <div className={`grid gap-4 ${gridClass}`}>
          {items.map(col => (
            <Link
              key={col.id}
              href={storeLink(`collection/${col.slug}`)}
              className={`group relative ${theme.radiusClass} overflow-hidden aspect-[4/3] ${theme.cardClass}`}
            >
              {col.image ? (
                <img src={col.image} alt={col.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center bg-[var(--tpl-primary)]/5`}>
                  <span className="text-3xl font-bold text-[var(--tpl-primary)]/20">{col.name.charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-sm">{col.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
