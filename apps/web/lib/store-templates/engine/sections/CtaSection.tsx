"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { CtaSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface CtaSectionFullProps {
  props: CtaSectionProps
  config: TemplateConfig
}

export function CtaSection({ props, config }: CtaSectionFullProps) {
  const theme = useTemplateTheme(config)
  const link = props.buttonLink || "#"

  if (props.style === "banner") {
    return (
      <section className="bg-[var(--tpl-primary)] py-16">
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 text-center`}>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{props.title}</h2>
          {props.subtitle && <p className="text-white/80 mb-6">{props.subtitle}</p>}
          <Link href={link} className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[var(--tpl-primary)] rounded-xl font-medium hover:bg-white/90 transition-colors shadow-lg">
            {props.buttonText} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    )
  }

  if (props.style === "split") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          <div className={`${theme.cardClass} ${theme.radiusClass} p-8 flex flex-col md:flex-row items-center justify-between gap-6`}>
            <div>
              <h2 className="text-2xl font-bold text-[var(--tpl-text)]">{props.title}</h2>
              {props.subtitle && <p className="text-[var(--tpl-text-muted)] mt-1">{props.subtitle}</p>}
            </div>
            <Link href={link} className={`inline-flex items-center gap-2 px-8 py-3.5 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity shrink-0`}>
              {props.buttonText} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // Default: centered
  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-surface)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 text-center`}>
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-3">{props.title}</h2>
        {props.subtitle && <p className="text-[var(--tpl-text-muted)] mb-6 max-w-xl mx-auto">{props.subtitle}</p>}
        <Link href={link} className={`inline-flex items-center gap-2 px-8 py-3.5 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity shadow-lg`}>
          {props.buttonText} <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
