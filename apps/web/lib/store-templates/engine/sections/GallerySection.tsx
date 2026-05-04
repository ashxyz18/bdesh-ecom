"use client"

import type { GallerySectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface GallerySectionFullProps {
  props: GallerySectionProps
  config: TemplateConfig
}

export function GallerySection({ props, config }: GallerySectionFullProps) {
  const theme = useTemplateTheme(config)
  const {
    title = "Gallery",
    layout = "grid",
    columns = 3,
    gap = "md",
    items = [],
  } = props

  const demoItems = items.length > 0 ? items : Array.from({ length: 6 }, (_, i) => ({
    src: undefined,
    alt: `Gallery image ${i + 1}`,
    caption: undefined,
  }))

  const cols = columns === 2 ? "grid-cols-1 sm:grid-cols-2"
    : columns === 4 ? "grid-cols-2 sm:grid-cols-4"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

  const gapClass = gap === "sm" ? "gap-2" : gap === "lg" ? "gap-6" : "gap-4"

  if (layout === "masonry") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-8">{title}</h2>}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {demoItems.map((item, i) => (
              <div key={i} className={`break-inside-avoid ${theme.radiusClass} overflow-hidden group`}>
                <div className={`bg-gradient-to-br from-[var(--tpl-primary)]/${10 + (i % 3) * 5} to-[var(--tpl-secondary)]/${10 + (i % 2) * 5} flex items-center justify-center min-h-[${120 + (i % 3) * 80}px]`}>
                  <span className="text-[var(--tpl-primary)]/30 text-lg font-medium">{item.alt || `Image ${i + 1}`}</span>
                </div>
                {item.caption && <p className="text-xs text-[var(--tpl-text-muted)] mt-2 px-1">{item.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-8">{title}</h2>}
        <div className={`grid ${cols} ${gapClass}`}>
          {demoItems.map((item, i) => (
            <div key={i} className={`${theme.radiusClass} overflow-hidden group cursor-pointer`}>
              <div className="aspect-square bg-gradient-to-br from-[var(--tpl-primary)]/10 to-[var(--tpl-secondary)]/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <span className="text-[var(--tpl-primary)]/30 text-sm font-medium">{item.alt || `Image ${i + 1}`}</span>
              </div>
              {item.caption && <p className="text-xs text-[var(--tpl-text-muted)] mt-2">{item.caption}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
