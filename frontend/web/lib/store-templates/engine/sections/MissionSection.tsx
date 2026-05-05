"use client"

import type { MissionSectionProps, TemplateConfig, SectionThemeOverride } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface MissionSectionFullProps {
  props: MissionSectionProps
  config: TemplateConfig
}

type ValueItem = { title: string; description?: string; icon?: string }

const DEMO_VALUES: ValueItem[] = [
  { title: "Innovation", description: "Pushing boundaries and embracing new ideas", icon: "💡" },
  { title: "Integrity", description: "Doing the right thing, always", icon: "🤝" },
  { title: "Excellence", description: "Striving for the highest quality in everything", icon: "⭐" },
  { title: "Impact", description: "Making a meaningful difference in the world", icon: "🌍" },
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

export function MissionSection({ props, config }: MissionSectionFullProps) {
  const theme = useTemplateTheme(config)
  const { layout = "centered", title, description, values } = props
  const vals: ValueItem[] = (values?.length ? values : DEMO_VALUES) as ValueItem[]
  const themeClasses = getThemeClasses(props.sectionTheme)

  const isLightBg = props.sectionTheme?.background === "primary" || props.sectionTheme?.background === "gradient"
  const cardBg = isLightBg ? "bg-white/10 backdrop-blur-sm" : "bg-[var(--tpl-surface)]"
  const cardBorder = isLightBg ? "border-white/20" : "border-[var(--tpl-border)]"
  const cardSubtext = isLightBg ? "text-white/80" : "text-[var(--tpl-text-secondary)]"

  return (
    <section className={`${themeClasses.padding} ${themeClasses.bg} ${themeClasses.text} ${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
      {layout === "centered" && (
        <div className="max-w-3xl mx-auto text-center">
          {title && <h2 className="text-3xl font-bold mb-6">{title}</h2>}
          {description && <p className={`text-lg ${cardSubtext} mb-12`}>{description}</p>}
          {vals.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {vals.map((v, i) => (
                <div key={i} className={`${cardBg} border ${cardBorder} rounded-xl p-6 text-center`}>
                  {v.icon && <span className="text-3xl mb-3 block">{v.icon}</span>}
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  {v.description && <p className={`text-sm ${cardSubtext}`}>{v.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {layout === "split" && (
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            {title && <h2 className="text-3xl font-bold mb-6">{title}</h2>}
            {description && <p className={`text-lg ${cardSubtext}`}>{description}</p>}
          </div>
          <div className="space-y-4">
            {vals.map((v, i) => (
              <div key={i} className="flex items-start gap-4">
                {v.icon && <span className="text-2xl flex-shrink-0">{v.icon}</span>}
                <div>
                  <h3 className="font-semibold mb-1">{v.title}</h3>
                  {v.description && <p className={`text-sm ${cardSubtext}`}>{v.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {layout === "cards" && (
        <>
          {(title || description) && (
            <div className="text-center mb-12">
              {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
              {description && <p className={`text-lg max-w-2xl mx-auto ${cardSubtext}`}>{description}</p>}
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {vals.map((v, i) => (
              <div key={i} className={`${cardBg} border ${cardBorder} rounded-xl p-6 text-center hover:-translate-y-1 transition-transform`}>
                {v.icon && <span className="text-4xl mb-4 block">{v.icon}</span>}
                <h3 className="font-bold mb-2">{v.title}</h3>
                {v.description && <p className={`text-sm ${cardSubtext}`}>{v.description}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
