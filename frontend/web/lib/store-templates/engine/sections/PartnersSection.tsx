"use client"

import type { PartnersSectionProps, TemplateConfig, SectionThemeOverride } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface PartnersSectionFullProps {
  props: PartnersSectionProps
  config: TemplateConfig
}

type PartnerItem = { name: string; logo?: string; url?: string }

const DEMO_PARTNERS: PartnerItem[] = [
  { name: "Partner One" },
  { name: "Partner Two" },
  { name: "Partner Three" },
  { name: "Partner Four" },
  { name: "Partner Five" },
  { name: "Partner Six" },
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

export function PartnersSection({ props, config }: PartnersSectionFullProps) {
  const theme = useTemplateTheme(config)
  const { layout = "grid", items, title, grayscale = true } = props
  const partners: PartnerItem[] = (items?.length ? items : DEMO_PARTNERS) as PartnerItem[]
  const themeClasses = getThemeClasses(props.sectionTheme)

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <section className={`${themeClasses.padding} ${themeClasses.bg} ${themeClasses.text} ${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
      {title && <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>}
      {children}
    </section>
  )

  if (layout === "carousel") {
    return (
      <Wrapper>
        <div className="flex items-center gap-12 overflow-x-auto pb-4">
          {partners.map((item, i) => (
            <a key={i} href={item.url || "#"} className="flex-shrink-0 group">
              {item.logo ? (
                <img src={item.logo} alt={item.name} className={`h-12 object-contain opacity-60 group-hover:opacity-100 transition-opacity ${grayscale ? "grayscale group-hover:grayscale-0" : ""}`} />
              ) : (
                <div className="h-12 px-6 rounded-lg bg-[var(--tpl-surface)] border border-[var(--tpl-border)] flex items-center justify-center text-[var(--tpl-text-secondary)] font-semibold opacity-60 group-hover:opacity-100 transition-opacity">
                  {item.name}
                </div>
              )}
            </a>
          ))}
        </div>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
        {partners.map((item, i) => (
          <a key={i} href={item.url || "#"} className="flex items-center justify-center group">
            {item.logo ? (
              <img src={item.logo} alt={item.name} className={`h-12 object-contain opacity-50 group-hover:opacity-100 transition-opacity ${grayscale ? "grayscale group-hover:grayscale-0" : ""}`} />
            ) : (
              <div className="h-12 px-4 rounded-lg bg-[var(--tpl-surface)] border border-[var(--tpl-border)] flex items-center justify-center text-[var(--tpl-text-secondary)] text-sm font-medium opacity-50 group-hover:opacity-100 transition-opacity">
                {item.name}
              </div>
            )}
          </a>
        ))}
      </div>
    </Wrapper>
  )
}
