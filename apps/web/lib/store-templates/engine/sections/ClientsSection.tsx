"use client"

import type { ClientsSectionProps, TemplateConfig, SectionThemeOverride } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface ClientsSectionFullProps {
  props: ClientsSectionProps
  config: TemplateConfig
}

type ClientItem = { name: string; logo?: string; testimonial?: string }

const DEMO_CLIENTS: ClientItem[] = [
  { name: "Acme Corp", testimonial: "Outstanding work that transformed our business" },
  { name: "TechStart", testimonial: "Professional team with incredible results" },
  { name: "GlobalFlow", testimonial: "Exceeded all our expectations" },
  { name: "InnovateLab", testimonial: "A pleasure to work with from start to finish" },
  { name: "NextWave", testimonial: "Delivered on time and above standard" },
  { name: "BrightPath", testimonial: "Creative solutions to complex challenges" },
]

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

export function ClientsSection({ props, config }: ClientsSectionFullProps) {
  const theme = useTemplateTheme(config)
  const { layout = "grid", items, title, style = "default" } = props
  const clients: ClientItem[] = (items?.length ? items : DEMO_CLIENTS) as ClientItem[]
  const themeClasses = getThemeClasses(props.sectionTheme)

  const isLightBg = props.sectionTheme?.background === "primary" || props.sectionTheme?.background === "gradient"
  const cardBg = isLightBg ? "bg-white/10 backdrop-blur-sm" : "bg-[var(--tpl-surface)]"
  const cardBorder = isLightBg ? "border-white/20" : "border-[var(--tpl-border)]"
  const cardSubtext = isLightBg ? "text-white/80" : "text-[var(--tpl-text-secondary)]"

  return (
    <section className={`${themeClasses.padding} ${themeClasses.bg} ${themeClasses.text} ${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
      {title && <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>}

      {layout === "grid" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((item, i) => (
            <div key={i} className={`${style === "cards" ? `${cardBg} border ${cardBorder} rounded-xl p-6` : "p-4"} text-center`}>
              {item.logo ? (
                <img src={item.logo} alt={item.name} className="h-12 mx-auto mb-4 object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[var(--tpl-primary)]/10 flex items-center justify-center mx-auto mb-4 text-[var(--tpl-primary)] font-bold text-lg">
                  {item.name.charAt(0)}
                </div>
              )}
              <h3 className="font-semibold mb-2">{item.name}</h3>
              {item.testimonial && <p className={`text-sm italic ${cardSubtext}`}>&ldquo;{item.testimonial}&rdquo;</p>}
            </div>
          ))}
        </div>
      )}

      {layout === "carousel" && (
        <div className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory">
          {clients.map((item, i) => (
            <div key={i} className={`flex-shrink-0 w-72 snap-center ${cardBg} border ${cardBorder} rounded-xl p-6 text-center`}>
              {item.logo ? (
                <img src={item.logo} alt={item.name} className="h-10 mx-auto mb-3 object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--tpl-primary)]/10 flex items-center justify-center mx-auto mb-3 text-[var(--tpl-primary)] font-bold">
                  {item.name.charAt(0)}
                </div>
              )}
              <h3 className="font-semibold mb-2">{item.name}</h3>
              {item.testimonial && <p className={`text-sm italic ${cardSubtext}`}>&ldquo;{item.testimonial}&rdquo;</p>}
            </div>
          ))}
        </div>
      )}

      {layout === "masonry" && (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {clients.map((item, i) => (
            <div key={i} className={`break-inside-avoid ${cardBg} border ${cardBorder} rounded-xl p-6`}>
              <div className="flex items-center gap-3 mb-3">
                {item.logo ? (
                  <img src={item.logo} alt={item.name} className="h-8 object-contain" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--tpl-primary)]/10 flex items-center justify-center text-[var(--tpl-primary)] font-bold text-sm">
                    {item.name.charAt(0)}
                  </div>
                )}
                <h3 className="font-semibold">{item.name}</h3>
              </div>
              {item.testimonial && <p className={`text-sm italic ${cardSubtext}`}>&ldquo;{item.testimonial}&rdquo;</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
