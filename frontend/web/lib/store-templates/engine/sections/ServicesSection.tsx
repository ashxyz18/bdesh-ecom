"use client"

import type { ServicesSectionProps, TemplateConfig, SectionThemeOverride } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface ServicesSectionFullProps {
  props: ServicesSectionProps
  config: TemplateConfig
}

type ServiceItem = { title: string; description?: string; icon?: string; image?: string; link?: string }

const DEMO_SERVICES: ServiceItem[] = [
  { title: "Web Development", description: "Custom websites and web applications built with modern technologies", icon: "🌐" },
  { title: "Mobile Apps", description: "Native and cross-platform mobile applications for iOS and Android", icon: "📱" },
  { title: "UI/UX Design", description: "Beautiful, intuitive interfaces that delight users and drive engagement", icon: "🎨" },
  { title: "Cloud Solutions", description: "Scalable cloud infrastructure and deployment strategies", icon: "☁️" },
  { title: "Data Analytics", description: "Turn your data into actionable insights with advanced analytics", icon: "📊" },
  { title: "Cybersecurity", description: "Protect your digital assets with comprehensive security solutions", icon: "🔒" },
]

function getThemeClasses(theme: SectionThemeOverride | undefined): { bg: string; text: string; padding: string } {
  const bg = theme?.background === "dark" ? "bg-[var(--tpl-surface)]" :
    theme?.background === "primary" ? "bg-[var(--tpl-primary)]" :
    theme?.background === "gradient" ? "bg-gradient-to-br from-[var(--tpl-primary)] to-[var(--tpl-secondary)]" :
    theme?.background === "surface" ? "bg-[var(--tpl-surface)]" :
    theme?.background === "secondary" ? "bg-[var(--tpl-secondary)]" :
    "bg-[var(--tpl-bg)]"

  const text = theme?.textColor === "light" ? "text-white" :
    theme?.textColor === "dark" ? "text-gray-900" :
    "text-[var(--tpl-text)]"

  const padding = theme?.padding === "compact" ? "py-8 md:py-12" :
    theme?.padding === "spacious" ? "py-16 md:py-24" :
    theme?.padding === "none" ? "" :
    "py-12 md:py-20"

  return { bg, text, padding }
}

export function ServicesSection({ props, config }: ServicesSectionFullProps) {
  const theme = useTemplateTheme(config)
  const { layout = "grid", columns = 3, items, title, style = "default" } = props
  const services: ServiceItem[] = (items?.length ? items : DEMO_SERVICES) as ServiceItem[]
  const themeClasses = getThemeClasses(props.sectionTheme)

  const isLightBg = props.sectionTheme?.background === "primary" || props.sectionTheme?.background === "gradient"
  const cardBg = isLightBg ? "bg-white/10 backdrop-blur-sm" : "bg-[var(--tpl-surface)]"
  const cardBorder = isLightBg ? "border-white/20" : "border-[var(--tpl-border)]"
  const cardText = isLightBg ? "text-white" : "text-[var(--tpl-text)]"
  const cardSubtext = isLightBg ? "text-white/80" : "text-[var(--tpl-text-secondary)]"

  const colClass = columns === 2 ? "md:grid-cols-2" : columns === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"

  return (
    <section className={`${themeClasses.padding} ${themeClasses.bg} ${themeClasses.text} ${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
      {title && <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>}

      {layout === "grid" && (
        <div className={`grid gap-6 ${colClass}`}>
          {services.map((item, i) => (
            <div key={i} className={`${cardBg} border ${cardBorder} rounded-xl p-6 hover:shadow-lg transition-shadow`}>
              {item.icon && <span className="text-3xl mb-4 block">{item.icon}</span>}
              {item.image && <img src={item.image} alt={item.title} className="w-12 h-12 mb-4 rounded-lg object-cover" />}
              <h3 className={`text-lg font-semibold ${cardText} mb-2`}>{item.title}</h3>
              {item.description && <p className={`text-sm ${cardSubtext}`}>{item.description}</p>}
              {item.link && <a href={item.link} className="text-[var(--tpl-primary)] text-sm mt-3 inline-block hover:underline">Learn more →</a>}
            </div>
          ))}
        </div>
      )}

      {layout === "cards" && (
        <div className={`grid gap-8 ${colClass}`}>
          {services.map((item, i) => (
            <div key={i} className={`${style === "colored" ? "bg-[var(--tpl-primary)] text-white" : style === "bordered" ? `border-2 ${cardBorder} ${cardBg}` : `${cardBg}`} rounded-2xl p-8 text-center hover:-translate-y-1 transition-transform`}>
              {item.icon && <span className="text-4xl mb-4 block">{item.icon}</span>}
              <h3 className="text-lg font-bold mb-3">{item.title}</h3>
              {item.description && <p className={`text-sm ${style === "colored" ? "text-white/90" : cardSubtext}`}>{item.description}</p>}
            </div>
          ))}
        </div>
      )}

      {layout === "icons" && (
        <div className={`grid gap-8 ${colClass}`}>
          {services.map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--tpl-primary)]/10 flex items-center justify-center text-[var(--tpl-primary)] text-xl">
                {item.icon || "●"}
              </div>
              <div>
                <h3 className={`font-semibold ${cardText} mb-1`}>{item.title}</h3>
                {item.description && <p className={`text-sm ${cardSubtext}`}>{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {layout === "list" && (
        <div className="max-w-3xl mx-auto space-y-6">
          {services.map((item, i) => (
            <div key={i} className={`flex items-center gap-6 ${cardBg} border ${cardBorder} rounded-xl p-6`}>
              {item.icon && <span className="text-3xl">{item.icon}</span>}
              <div className="flex-1">
                <h3 className={`font-semibold ${cardText} mb-1`}>{item.title}</h3>
                {item.description && <p className={`text-sm ${cardSubtext}`}>{item.description}</p>}
              </div>
              {item.link && <a href={item.link} className="text-[var(--tpl-primary)] hover:underline text-sm">→</a>}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
