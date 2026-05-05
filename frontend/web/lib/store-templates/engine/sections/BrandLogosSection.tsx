"use client"

import type { BrandLogosSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface BrandLogosSectionFullProps {
  props: BrandLogosSectionProps
  config: TemplateConfig
}

export function BrandLogosSection({ props, config }: BrandLogosSectionFullProps) {
  const theme = useTemplateTheme(config)
  const grayscale = props.grayscale !== false

  if (props.layout === "carousel") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {props.title && (
            <p className="text-center text-sm font-medium text-[var(--tpl-text-muted)] uppercase tracking-wider mb-8">
              {props.title}
            </p>
          )}
          <div className="flex items-center gap-12 overflow-x-auto pb-4 scrollbar-hide">
            {props.items.map((item, i) => (
              <div key={i} className="flex-shrink-0 flex items-center justify-center h-12 px-4">
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt={item.name}
                    className={`h-10 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity ${grayscale ? "grayscale hover:grayscale-0" : ""}`}
                  />
                ) : (
                  <span className="text-lg font-bold text-[var(--tpl-text-muted)] opacity-60 hover:opacity-100 transition-opacity">
                    {item.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Grid layout
  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-surface)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        {props.title && (
          <p className="text-center text-sm font-medium text-[var(--tpl-text-muted)] uppercase tracking-wider mb-8">
            {props.title}
          </p>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-8 items-center justify-items-center">
          {props.items.map((item, i) => (
            <div key={i} className="flex items-center justify-center h-16">
              {item.logo ? (
                <img
                  src={item.logo}
                  alt={item.name}
                  className={`h-10 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity ${grayscale ? "grayscale hover:grayscale-0" : ""}`}
                />
              ) : (
                <span className="text-base font-bold text-[var(--tpl-text-muted)] opacity-50 hover:opacity-100 transition-opacity">
                  {item.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
