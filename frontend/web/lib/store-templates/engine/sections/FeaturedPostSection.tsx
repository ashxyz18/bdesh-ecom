"use client"

import type { FeaturedPostSectionProps, TemplateConfig, SectionThemeOverride } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface FeaturedPostSectionFullProps {
  props: FeaturedPostSectionProps
  config: TemplateConfig
}

function getThemeClasses(theme: SectionThemeOverride | undefined): { bg: string; text: string; padding: string } {
  const bg = theme?.background === "dark" ? "bg-[var(--tpl-surface)]" :
    theme?.background === "primary" ? "bg-[var(--tpl-primary)]" :
    theme?.background === "gradient" ? "bg-gradient-to-br from-[var(--tpl-primary)] to-[var(--tpl-secondary)]" :
    theme?.background === "surface" ? "bg-[var(--tpl-surface)]" :
    theme?.background === "secondary" ? "bg-[var(--tpl-secondary)]" :
    "bg-[var(--tpl-bg)]"
  const text = theme?.textColor === "light" ? "text-white" : theme?.textColor === "dark" ? "text-gray-900" : "text-[var(--tpl-text)]"
  const padding = theme?.padding === "compact" ? "py-8 md:py-12" : theme?.padding === "spacious" ? "py-16 md:py-24" : theme?.padding === "none" ? "" : "py-12 md:py-20"
  return { bg, text, padding }
}

export function FeaturedPostSection({ props, config }: FeaturedPostSectionFullProps) {
  const theme = useTemplateTheme(config)
  const { layout = "hero", title } = props
  const themeClasses = getThemeClasses(props.sectionTheme)

  const isLightBg = props.sectionTheme?.background === "primary" || props.sectionTheme?.background === "gradient"
  const cardSubtext = isLightBg ? "text-white/80" : "text-[var(--tpl-text-secondary)]"

  return (
    <section className={`${themeClasses.padding} ${themeClasses.bg} ${themeClasses.text} ${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
      {title && <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>}

      {layout === "hero" && (
        <div className="relative rounded-2xl overflow-hidden min-h-[400px] bg-gradient-to-br from-[var(--tpl-primary)] to-[var(--tpl-secondary)] flex items-center">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 p-8 md:p-16 max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-wider text-white/80">Featured</span>
            <h3 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">Discover the Latest in Innovation</h3>
            <p className="text-white/80 mb-6">Explore groundbreaking ideas and insights that are shaping the future of technology and design.</p>
            <button className="bg-white text-[var(--tpl-primary)] px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors">
              Read Article
            </button>
          </div>
        </div>
      )}

      {layout === "split" && (
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="h-72 md:h-full rounded-2xl bg-gradient-to-br from-[var(--tpl-primary)]/20 to-[var(--tpl-secondary)]/20 flex items-center justify-center">
            <span className="text-6xl opacity-30">📝</span>
          </div>
          <div className="py-4">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--tpl-primary)]">Featured</span>
            <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-4">Discover the Latest in Innovation</h3>
            <p className={`${cardSubtext} mb-6`}>Explore groundbreaking ideas and insights that are shaping the future of technology and design.</p>
            <button className="bg-[var(--tpl-primary)] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Read Article →
            </button>
          </div>
        </div>
      )}

      {layout === "card" && (
        <div className={`${isLightBg ? "bg-white/10 backdrop-blur-sm border-white/20" : "bg-[var(--tpl-surface)] border-[var(--tpl-border)]"} border rounded-2xl p-8 md:p-12 max-w-3xl mx-auto text-center`}>
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--tpl-primary)]">Featured</span>
          <h3 className="text-2xl md:text-3xl font-bold mt-3 mb-4">Discover the Latest in Innovation</h3>
          <p className={`${cardSubtext} mb-6`}>Explore groundbreaking ideas and insights that are shaping the future of technology and design.</p>
          <button className="bg-[var(--tpl-primary)] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Read Article →
          </button>
        </div>
      )}
    </section>
  )
}
