"use client"

import type { ExperienceSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface ExperienceSectionFullProps {
  props: ExperienceSectionProps
  config: TemplateConfig
}

export function ExperienceSection({ props, config }: ExperienceSectionFullProps) {
  const theme = useTemplateTheme(config)
  const {
    title = "Experience",
    layout = "timeline",
    items = [],
  } = props

  const demoItems = items.length > 0 ? items : [
    { title: "Senior Developer", company: "Tech Corp", period: "2022 - Present", description: "Leading frontend architecture and team of 5 developers" },
    { title: "Full Stack Developer", company: "StartupXYZ", period: "2019 - 2022", description: "Built scalable web applications serving 100K+ users" },
    { title: "Junior Developer", company: "WebAgency", period: "2017 - 2019", description: "Developed responsive websites and e-commerce solutions" },
  ]

  if (layout === "cards") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-8">{title}</h2>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demoItems.map((item, i) => (
              <div key={i} className={`p-6 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-surface)] hover:shadow-md transition-shadow`}>
                <span className="text-xs font-medium text-[var(--tpl-primary)]">{item.period}</span>
                <h3 className="text-lg font-semibold text-[var(--tpl-text)] mt-1">{item.title}</h3>
                {item.company && <p className="text-sm text-[var(--tpl-primary)] font-medium mt-0.5">{item.company}</p>}
                {item.description && <p className="text-sm text-[var(--tpl-text-muted)] mt-2">{item.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (layout === "compact") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-8">{title}</h2>}
          <div className="space-y-4">
            {demoItems.map((item, i) => (
              <div key={i} className="flex items-start gap-4 py-3 border-b border-[var(--tpl-border)] last:border-0">
                <span className="text-xs font-medium text-[var(--tpl-primary)] whitespace-nowrap pt-0.5">{item.period}</span>
                <div>
                  <h3 className="font-semibold text-[var(--tpl-text)]">{item.title}</h3>
                  {item.company && <p className="text-sm text-[var(--tpl-text-muted)]">{item.company}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default: timeline layout
  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-8">{title}</h2>}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--tpl-border)]" />
          <div className="space-y-8">
            {demoItems.map((item, i) => (
              <div key={i} className="relative pl-12">
                <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-[var(--tpl-primary)] border-2 border-[var(--tpl-bg)]" />
                <span className="text-xs font-medium text-[var(--tpl-primary)]">{item.period}</span>
                <h3 className="text-lg font-semibold text-[var(--tpl-text)] mt-1">{item.title}</h3>
                {item.company && <p className="text-sm text-[var(--tpl-primary)] font-medium">{item.company}</p>}
                {item.description && <p className="text-sm text-[var(--tpl-text-muted)] mt-2">{item.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
