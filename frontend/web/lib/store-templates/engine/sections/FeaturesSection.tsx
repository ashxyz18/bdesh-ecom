"use client"

import { Truck, ShieldCheck, RefreshCcw, Headphones, CreditCard, Package, Star, Clock } from "lucide-react"
import type { FeaturesSectionProps, FeatureItem } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

const ICON_MAP: Record<string, any> = { Truck, ShieldCheck, RefreshCcw, Headphones, CreditCard, Package, Star, Clock }

interface FeaturesSectionFullProps {
  props: FeaturesSectionProps
  config: TemplateConfig
}

export function FeaturesSection({ props, config }: FeaturesSectionFullProps) {
  const theme = useTemplateTheme(config)
  const style = props.style || "default"
  const isColored = style === "colored"
  const isMinimal = style === "minimal"

  return (
    <section className={`${theme.sectionPadding} ${isColored ? "bg-[var(--tpl-primary)]" : "bg-[var(--tpl-bg)]"}`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        {props.layout === "icons" ? (
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {props.items.map((item, i) => {
              const Icon = ICON_MAP[item.icon] || Star
              return (
                <div key={i} className="flex flex-col items-center text-center max-w-[120px]">
                  <div className={`w-12 h-12 ${theme.radiusClass} ${isColored ? "bg-white/20" : "bg-[var(--tpl-primary)]/10"} flex items-center justify-center mb-2`}>
                    <Icon size={22} className={isColored ? "text-white" : "text-[var(--tpl-primary)]"} />
                  </div>
                  <p className={`text-sm font-medium ${isColored ? "text-white" : "text-[var(--tpl-text)]"}`}>{item.title}</p>
                  {!isMinimal && <p className={`text-xs mt-0.5 ${isColored ? "text-white/70" : "text-[var(--tpl-text-muted)]"}`}>{item.description}</p>}
                </div>
              )
            })}
          </div>
        ) : (
          <div className={`grid gap-6 ${props.layout === "cards" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
            {props.items.map((item, i) => {
              const Icon = ICON_MAP[item.icon] || Star
              return (
                <div key={i} className={`${isColored ? "bg-white/10" : theme.cardClass} ${theme.radiusClass} p-6 text-center`}>
                  <div className={`w-12 h-12 ${theme.radiusClass} ${isColored ? "bg-white/20" : "bg-[var(--tpl-primary)]/10"} flex items-center justify-center mx-auto mb-3`}>
                    <Icon size={22} className={isColored ? "text-white" : "text-[var(--tpl-primary)]"} />
                  </div>
                  <h3 className={`text-sm font-semibold mb-1 ${isColored ? "text-white" : "text-[var(--tpl-text)]"}`}>{item.title}</h3>
                  <p className={`text-xs ${isColored ? "text-white/70" : "text-[var(--tpl-text-muted)]"}`}>{item.description}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
