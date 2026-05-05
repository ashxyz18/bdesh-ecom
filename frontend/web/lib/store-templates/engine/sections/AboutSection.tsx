"use client"

import type { AboutSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface AboutSectionFullProps {
  props: AboutSectionProps
  config: TemplateConfig
}

export function AboutSection({ props, config }: AboutSectionFullProps) {
  const theme = useTemplateTheme(config)
  const {
    layout = "split",
    title = "About Us",
    description = "We are a passionate team dedicated to delivering exceptional results. With years of experience and a commitment to excellence, we help our clients achieve their goals.",
    highlights = [],
  } = props

  const demoHighlights = highlights.length > 0 ? highlights : [
    { label: "Years Experience", value: "10+" },
    { label: "Happy Clients", value: "500+" },
    { label: "Projects Done", value: "1000+" },
  ]

  if (layout === "centered") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 text-center max-w-3xl`}>
          {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-4">{title}</h2>}
          <p className="text-[var(--tpl-text-muted)] text-lg leading-relaxed">{description}</p>
          {demoHighlights.length > 0 && (
            <div className="flex flex-wrap justify-center gap-8 mt-8">
              {demoHighlights.map((h, i) => (
                <div key={i}>
                  <p className="text-3xl font-bold text-[var(--tpl-primary)]">{h.value}</p>
                  <p className="text-sm text-[var(--tpl-text-muted)]">{h.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    )
  }

  if (layout === "image-left" || layout === "image-right") {
    const isLeft = layout === "image-left"
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          <div className={`grid lg:grid-cols-2 gap-12 items-center ${isLeft ? "" : "direction-rtl"}`}>
            <div className={isLeft ? "" : "lg:order-2"}>
              <div className={`aspect-[4/3] ${theme.radiusClass} bg-gradient-to-br from-[var(--tpl-primary)]/10 to-[var(--tpl-secondary)]/10 flex items-center justify-center`}>
                <span className="text-[var(--tpl-primary)]/30 text-lg">About Image</span>
              </div>
            </div>
            <div className={isLeft ? "" : "lg:order-1"}>
              {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-4">{title}</h2>}
              <p className="text-[var(--tpl-text-muted)] leading-relaxed">{description}</p>
              {demoHighlights.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {demoHighlights.map((h, i) => (
                    <div key={i} className={`p-4 ${theme.radiusClass} bg-[var(--tpl-surface)] text-center`}>
                      <p className="text-2xl font-bold text-[var(--tpl-primary)]">{h.value}</p>
                      <p className="text-xs text-[var(--tpl-text-muted)] mt-1">{h.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Default: split layout
  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-4">{title}</h2>}
            <p className="text-[var(--tpl-text-muted)] leading-relaxed">{description}</p>
            {demoHighlights.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-8">
                {demoHighlights.map((h, i) => (
                  <div key={i} className={`p-4 ${theme.radiusClass} bg-[var(--tpl-surface)] text-center`}>
                    <p className="text-2xl font-bold text-[var(--tpl-primary)]">{h.value}</p>
                    <p className="text-xs text-[var(--tpl-text-muted)] mt-1">{h.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={`aspect-[4/3] ${theme.radiusClass} bg-gradient-to-br from-[var(--tpl-primary)]/10 to-[var(--tpl-secondary)]/10 flex items-center justify-center`}>
            <span className="text-[var(--tpl-primary)]/30 text-lg">About Image</span>
          </div>
        </div>
      </div>
    </section>
  )
}
