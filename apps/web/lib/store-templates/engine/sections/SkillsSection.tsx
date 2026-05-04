"use client"

import type { SkillsSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface SkillsSectionFullProps {
  props: SkillsSectionProps
  config: TemplateConfig
}

export function SkillsSection({ props, config }: SkillsSectionFullProps) {
  const theme = useTemplateTheme(config)
  const {
    title = "Skills & Expertise",
    layout = "bars",
    items = [],
  } = props

  const demoItems = items.length > 0 ? items : [
    { name: "UI/UX Design", level: 95, category: "Design" },
    { name: "React & Next.js", level: 90, category: "Development" },
    { name: "TypeScript", level: 85, category: "Development" },
    { name: "Node.js", level: 80, category: "Development" },
    { name: "Figma", level: 92, category: "Design" },
    { name: "Project Management", level: 75, category: "Management" },
  ]

  if (layout === "tags") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-8">{title}</h2>}
          <div className="flex flex-wrap gap-3">
            {demoItems.map((item, i) => (
              <span key={i} className={`px-4 py-2 ${theme.radiusClass} border border-[var(--tpl-border)] text-[var(--tpl-text)] hover:bg-[var(--tpl-primary)] hover:text-white hover:border-[var(--tpl-primary)] transition-colors cursor-default`}>
                {item.name}
                {item.level && <span className="ml-2 text-xs opacity-60">{item.level}%</span>}
              </span>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (layout === "cards") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-8">{title}</h2>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoItems.map((item, i) => (
              <div key={i} className={`p-5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-surface)]`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-[var(--tpl-text)]">{item.name}</h3>
                  <span className="text-sm font-bold text-[var(--tpl-primary)]">{item.level || 0}%</span>
                </div>
                <div className="h-2 bg-[var(--tpl-border)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--tpl-primary)] rounded-full transition-all duration-1000" style={{ width: `${item.level || 0}%` }} />
                </div>
                {item.category && <span className="text-xs text-[var(--tpl-text-muted)] mt-2 block">{item.category}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (layout === "grid") {
    const categories = [...new Set(demoItems.map(i => i.category).filter(Boolean))]
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-8">{title}</h2>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map(cat => (
              <div key={cat}>
                <h3 className="text-lg font-semibold text-[var(--tpl-text)] mb-4">{cat}</h3>
                <div className="space-y-3">
                  {demoItems.filter(i => i.category === cat).map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-[var(--tpl-text)]">{item.name}</span>
                        <span className="text-xs text-[var(--tpl-text-muted)]">{item.level}%</span>
                      </div>
                      <div className="h-1.5 bg-[var(--tpl-border)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--tpl-primary)] rounded-full" style={{ width: `${item.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default: bars layout
  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-8">{title}</h2>}
        <div className="max-w-2xl space-y-5">
          {demoItems.map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--tpl-text)]">{item.name}</span>
                <span className="text-sm font-bold text-[var(--tpl-primary)]">{item.level || 0}%</span>
              </div>
              <div className="h-2.5 bg-[var(--tpl-border)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--tpl-primary)] to-[var(--tpl-accent)] rounded-full transition-all duration-1000" style={{ width: `${item.level || 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
