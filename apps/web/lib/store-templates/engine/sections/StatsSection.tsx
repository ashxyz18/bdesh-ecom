"use client"

import { Fragment } from "react"
import type { StatsSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface StatsSectionFullProps {
  props: StatsSectionProps
  config: TemplateConfig
}

export function StatsSection({ props, config }: StatsSectionFullProps) {
  const theme = useTemplateTheme(config)

  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-primary)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {props.items.map((stat, i) => (
            <Fragment key={i}>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/70 mt-1">{stat.label}</p>
              </div>
              {i < props.items.length - 1 && (
                <div className="w-px h-12 bg-white/20 self-center" />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
