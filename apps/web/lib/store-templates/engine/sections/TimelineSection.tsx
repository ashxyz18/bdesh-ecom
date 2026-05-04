"use client"

import { Truck, ShieldCheck, RefreshCcw, Headphones, CreditCard, Package, Star, ArrowRight, Clock, Zap, Settings, Gift } from "lucide-react"
import type { TimelineSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface TimelineSectionFullProps {
  props: TimelineSectionProps
  config: TemplateConfig
}

const ICON_MAP: Record<string, any> = { Truck, ShieldCheck, RefreshCcw, Headphones, CreditCard, Package, Star, ArrowRight, Clock, Zap, Settings, Gift }

export function TimelineSection({ props, config }: TimelineSectionFullProps) {
  const theme = useTemplateTheme(config)

  if (props.style === "horizontal") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {props.title && (
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] text-center mb-12">{props.title}</h2>
          )}
          <div className="relative">
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-[var(--tpl-border)]" />
            <div className="flex justify-between">
              {props.steps.map((step, i) => {
                const Icon = step.icon ? ICON_MAP[step.icon] || Star : null
                return (
                  <div key={i} className="relative flex flex-col items-center text-center flex-1 px-2">
                    <div className={`w-16 h-16 ${theme.bgPrimary} ${theme.radiusClass} flex items-center justify-center relative z-10 ${theme.textOnPrimary}`}>
                      {Icon ? <Icon size={24} /> : <span className="text-lg font-bold">{i + 1}</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--tpl-text)] mt-3">{step.title}</h3>
                    <p className="text-xs text-[var(--tpl-text-muted)] mt-1 max-w-[120px]">{step.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (props.style === "zigzag") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-surface)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {props.title && (
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] text-center mb-12">{props.title}</h2>
          )}
          <div className="space-y-8">
            {props.steps.map((step, i) => {
              const Icon = step.icon ? ICON_MAP[step.icon] || Star : null
              const isEven = i % 2 === 0
              return (
                <div key={i} className={`flex flex-col md:flex-row items-center gap-6 ${isEven ? "" : "md:flex-row-reverse"}`}>
                  <div className={`flex-1 ${isEven ? "md:text-right" : "md:text-left"}`}>
                    <h3 className="text-lg font-semibold text-[var(--tpl-text)]">{step.title}</h3>
                    <p className="text-sm text-[var(--tpl-text-muted)] mt-1">{step.description}</p>
                  </div>
                  <div className={`w-14 h-14 ${theme.bgPrimary} ${theme.radiusClass} flex items-center justify-center shrink-0 ${theme.textOnPrimary}`}>
                    {Icon ? <Icon size={22} /> : <span className="font-bold">{i + 1}</span>}
                  </div>
                  <div className="flex-1" />
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // Default: vertical
  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        {props.title && (
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] text-center mb-12">{props.title}</h2>
        )}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--tpl-border)]" />
          <div className="space-y-8">
            {props.steps.map((step, i) => {
              const Icon = step.icon ? ICON_MAP[step.icon] || Star : null
              return (
                <div key={i} className="relative flex gap-6">
                  <div className={`w-12 h-12 ${theme.bgPrimary} ${theme.radiusClass} flex items-center justify-center shrink-0 relative z-10 ${theme.textOnPrimary}`}>
                    {Icon ? <Icon size={20} /> : <span className="font-bold">{i + 1}</span>}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-base font-semibold text-[var(--tpl-text)]">{step.title}</h3>
                    <p className="text-sm text-[var(--tpl-text-muted)] mt-1">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
