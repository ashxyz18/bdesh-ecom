"use client"

import { ShoppingBag, Utensils, Shirt, Laptop, Home, Heart, Book, Music, Car, Dumbbell, Sparkles, Grid3X3 } from "lucide-react"
import type { CategoriesSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface CategoriesSectionFullProps {
  props: CategoriesSectionProps
  config: TemplateConfig
}

const ICON_MAP: Record<string, any> = {
  ShoppingBag, Utensils, Shirt, Laptop, Home, Heart, Book, Music, Car, Dumbbell, Sparkles, Grid3X3,
}

const COLUMN_CLASSES: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
}

export function CategoriesSection({ props, config }: CategoriesSectionFullProps) {
  const theme = useTemplateTheme(config)

  if (props.style === "icons") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {props.title && (
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] text-center mb-10">{props.title}</h2>
          )}
          <div className={`grid ${COLUMN_CLASSES[props.columns] || "grid-cols-4"} gap-6`}>
            {props.items.map((item, i) => {
              const Icon = item.icon ? ICON_MAP[item.icon] || ShoppingBag : ShoppingBag
              return (
                <div key={i} className="flex flex-col items-center gap-3 group cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--tpl-primary)]/10 flex items-center justify-center group-hover:bg-[var(--tpl-primary)] group-hover:text-white transition-all duration-300">
                    <Icon className="w-7 h-7 text-[var(--tpl-primary)] group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-[var(--tpl-text)] group-hover:text-[var(--tpl-primary)] transition-colors">
                    {item.name}
                  </span>
                  {item.description && (
                    <span className="text-xs text-[var(--tpl-text-muted)] text-center line-clamp-2">{item.description}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  if (props.style === "overlay") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {props.title && (
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] text-center mb-10">{props.title}</h2>
          )}
          <div className={`grid ${COLUMN_CLASSES[props.columns] || "grid-cols-4"} gap-4`}>
            {props.items.map((item, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--tpl-primary)]/20 to-[var(--tpl-primary)]/5 flex items-center justify-center">
                    {(() => {
                      const Icon = item.icon ? ICON_MAP[item.icon] || ShoppingBag : ShoppingBag
                      return <Icon className="w-10 h-10 text-[var(--tpl-primary)]/40" />
                    })()}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-sm md:text-base">{item.name}</h3>
                  {item.description && (
                    <p className="text-white/70 text-xs mt-1 line-clamp-1">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (props.style === "grid") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-surface)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {props.title && (
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] text-center mb-10">{props.title}</h2>
          )}
          <div className={`grid ${COLUMN_CLASSES[props.columns] || "grid-cols-4"} gap-4`}>
            {props.items.map((item, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden group cursor-pointer aspect-square">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--tpl-primary)]/15 to-[var(--tpl-primary)]/5 flex items-center justify-center">
                    {(() => {
                      const Icon = item.icon ? ICON_MAP[item.icon] || ShoppingBag : ShoppingBag
                      return <Icon className="w-12 h-12 text-[var(--tpl-primary)]/30" />
                    })()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm md:text-base">
                    {item.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default: "cards" style
  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        {props.title && (
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] text-center mb-10">{props.title}</h2>
        )}
        <div className={`grid ${COLUMN_CLASSES[props.columns] || "grid-cols-4"} gap-5`}>
          {props.items.map((item, i) => (
            <div key={i} className="bg-[var(--tpl-surface)] rounded-xl border border-[var(--tpl-border)] overflow-hidden group cursor-pointer hover:shadow-lg hover:border-[var(--tpl-primary)]/30 transition-all duration-300">
              <div className="aspect-[4/3] overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--tpl-primary)]/10 to-[var(--tpl-primary)]/5 flex items-center justify-center">
                    {(() => {
                      const Icon = item.icon ? ICON_MAP[item.icon] || ShoppingBag : ShoppingBag
                      return <Icon className="w-10 h-10 text-[var(--tpl-primary)]/30" />
                    })()}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[var(--tpl-text)] group-hover:text-[var(--tpl-primary)] transition-colors">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-[var(--tpl-text-muted)] mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
