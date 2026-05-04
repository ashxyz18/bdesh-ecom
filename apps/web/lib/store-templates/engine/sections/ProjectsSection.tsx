"use client"

import type { ProjectsSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"
import { ExternalLink } from "lucide-react"

interface ProjectsSectionFullProps {
  props: ProjectsSectionProps
  config: TemplateConfig
}

export function ProjectsSection({ props, config }: ProjectsSectionFullProps) {
  const theme = useTemplateTheme(config)
  const {
    title = "Our Projects",
    layout = "grid",
    columns = 3,
    showFilters = false,
    items = [],
    style = "cards",
  } = props

  const demoItems = items.length > 0 ? items : [
    { title: "Project Alpha", description: "A cutting-edge solution for modern businesses", category: "Web Design", image: undefined },
    { title: "Project Beta", description: "Brand identity and visual system for a tech startup", category: "Branding", image: undefined },
    { title: "Project Gamma", description: "Mobile-first e-commerce platform with AI recommendations", category: "Development", image: undefined },
    { title: "Project Delta", description: "Data visualization dashboard for analytics", category: "Web Design", image: undefined },
    { title: "Project Epsilon", description: "Social media campaign and content strategy", category: "Marketing", image: undefined },
    { title: "Project Zeta", description: "Enterprise resource planning system redesign", category: "Development", image: undefined },
  ]

  const categories = [...new Set(demoItems.map(i => i.category).filter(Boolean))]
  const cols = columns === 2 ? "grid-cols-1 sm:grid-cols-2"
    : columns === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

  if (layout === "masonry") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-8">{title}</h2>}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {demoItems.map((item, i) => (
              <div key={i} className={`break-inside-avoid ${theme.radiusClass} overflow-hidden border border-[var(--tpl-border)] bg-[var(--tpl-surface)] ${style === "overlay" ? "relative group" : ""}`}>
                <div className={`h-${32 + (i % 3) * 16} bg-[var(--tpl-primary)]/10 flex items-center justify-center`}>
                  <span className="text-[var(--tpl-primary)]/40 text-4xl font-bold">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="p-5">
                  {item.category && <span className="text-xs font-medium text-[var(--tpl-primary)] uppercase tracking-wider">{item.category}</span>}
                  <h3 className="text-lg font-semibold text-[var(--tpl-text)] mt-1">{item.title}</h3>
                  {item.description && <p className="text-sm text-[var(--tpl-text-muted)] mt-2">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (layout === "list") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-8">{title}</h2>}
          <div className="space-y-4">
            {demoItems.map((item, i) => (
              <div key={i} className={`flex items-center gap-6 p-5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-surface)] hover:shadow-md transition-shadow`}>
                <span className="text-3xl font-bold text-[var(--tpl-primary)]/20 w-12 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[var(--tpl-text)]">{item.title}</h3>
                  {item.description && <p className="text-sm text-[var(--tpl-text-muted)] mt-1">{item.description}</p>}
                </div>
                {item.category && <span className="text-xs font-medium text-[var(--tpl-primary)] bg-[var(--tpl-primary)]/10 px-3 py-1 rounded-full shrink-0">{item.category}</span>}
                <ExternalLink size={16} className="text-[var(--tpl-text-muted)] shrink-0" />
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
        {showFilters && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button className="px-4 py-1.5 text-sm font-medium bg-[var(--tpl-primary)] text-white rounded-full">All</button>
            {categories.map(cat => (
              <button key={cat} className="px-4 py-1.5 text-sm font-medium border border-[var(--tpl-border)] text-[var(--tpl-text-muted)] rounded-full hover:border-[var(--tpl-primary)] hover:text-[var(--tpl-primary)] transition-colors">{cat}</button>
            ))}
          </div>
        )}
        <div className={`grid gap-6 ${cols}`}>
          {demoItems.map((item, i) => (
            <div key={i} className={`group ${theme.radiusClass} overflow-hidden border border-[var(--tpl-border)] bg-[var(--tpl-surface)] hover:shadow-lg transition-all duration-300`}>
              <div className="h-48 bg-gradient-to-br from-[var(--tpl-primary)]/10 to-[var(--tpl-secondary)]/10 flex items-center justify-center relative overflow-hidden">
                <span className="text-[var(--tpl-primary)]/30 text-5xl font-bold group-hover:scale-110 transition-transform">{String(i + 1).padStart(2, "0")}</span>
                {style === "overlay" && (
                  <div className="absolute inset-0 bg-[var(--tpl-primary)]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink size={24} className="text-white" />
                  </div>
                )}
              </div>
              <div className="p-5">
                {item.category && <span className="text-xs font-medium text-[var(--tpl-primary)] uppercase tracking-wider">{item.category}</span>}
                <h3 className="text-lg font-semibold text-[var(--tpl-text)] mt-1 group-hover:text-[var(--tpl-primary)] transition-colors">{item.title}</h3>
                {item.description && <p className="text-sm text-[var(--tpl-text-muted)] mt-2 line-clamp-2">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
