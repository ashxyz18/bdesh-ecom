"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import type { PricingSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface PricingSectionFullProps {
  props: PricingSectionProps
  config: TemplateConfig
}

const COLS_MAP: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
}

export function PricingSection({ props, config }: PricingSectionFullProps) {
  const theme = useTemplateTheme(config)
  const style = props.style || "cards"
  const cols = props.columns || 3

  if (style === "table") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {props.title && (
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] text-center mb-10">{props.title}</h2>
          )}
          <div className="overflow-x-auto">
            <table className={`w-full ${theme.cardClass} ${theme.radiusClass} overflow-hidden`}>
              <thead>
                <tr className="border-b border-[var(--tpl-border)]">
                  <th className="text-left p-4 text-[var(--tpl-text)] font-semibold">Feature</th>
                  {props.plans.map((plan) => (
                    <th key={plan.name} className={`p-4 text-center font-semibold ${plan.highlighted ? "text-[var(--tpl-primary)]" : "text-[var(--tpl-text)]"}`}>
                      {plan.name}
                      <div className="text-lg mt-1">{plan.price}<span className="text-sm font-normal text-[var(--tpl-text-muted)]">{plan.period || ""}</span></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {props.plans[0]?.features.map((_, fi) => (
                  <tr key={fi} className="border-b border-[var(--tpl-border)] last:border-0">
                    <td className="p-4 text-sm text-[var(--tpl-text-muted)]">Feature {fi + 1}</td>
                    {props.plans.map((plan) => (
                      <td key={plan.name} className="p-4 text-center">
                        {fi < plan.features.length ? (
                          <Check size={16} className="text-[var(--tpl-success)] mx-auto" />
                        ) : (
                          <span className="text-[var(--tpl-text-muted)]">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    )
  }

  if (style === "minimal") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          {props.title && (
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] text-center mb-10">{props.title}</h2>
          )}
          <div className={`grid gap-8 ${COLS_MAP[cols]}`}>
            {props.plans.map((plan) => (
              <div key={plan.name} className={`p-8 ${plan.highlighted ? "border-2 border-[var(--tpl-primary)]" : "border border-[var(--tpl-border)]"} ${theme.radiusClass}`}>
                <h3 className="text-lg font-semibold text-[var(--tpl-text)]">{plan.name}</h3>
                <div className="mt-3 mb-6">
                  <span className="text-4xl font-bold text-[var(--tpl-text)]">{plan.price}</span>
                  {plan.period && <span className="text-[var(--tpl-text-muted)]">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--tpl-text-muted)]">
                      <Check size={16} className="shrink-0 text-[var(--tpl-success)] mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.ctaText && (
                  <Link
                    href={plan.ctaLink || "#"}
                    className={`block text-center py-3 ${theme.radiusClass} font-medium text-sm ${
                      plan.highlighted
                        ? `${theme.bgPrimary} ${theme.textOnPrimary} hover:opacity-90`
                        : "border border-[var(--tpl-border)] text-[var(--tpl-text)] hover:bg-[var(--tpl-surface)]"
                    } transition-colors`}
                  >
                    {plan.ctaText}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default: cards
  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-surface)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        {props.title && (
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] text-center mb-10">{props.title}</h2>
        )}
        <div className={`grid gap-8 ${COLS_MAP[cols]}`}>
          {props.plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative ${theme.cardClass} ${theme.radiusClass} p-8 ${
                plan.highlighted ? "ring-2 ring-[var(--tpl-primary)] shadow-xl scale-105" : ""
              }`}
            >
              {plan.highlighted && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 ${theme.bgPrimary} ${theme.textOnPrimary} text-xs font-semibold ${theme.radiusClass}`}>
                  Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-[var(--tpl-text)]">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-[var(--tpl-text)]">{plan.price}</span>
                {plan.period && <span className="text-[var(--tpl-text-muted)]">{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--tpl-text-muted)]">
                    <Check size={16} className="shrink-0 text-[var(--tpl-success)] mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.ctaText && (
                <Link
                  href={plan.ctaLink || "#"}
                  className={`block text-center py-3 ${theme.radiusClass} font-medium text-sm ${
                    plan.highlighted
                      ? `${theme.bgPrimary} ${theme.textOnPrimary} hover:opacity-90`
                      : "border border-[var(--tpl-border)] text-[var(--tpl-text)] hover:bg-[var(--tpl-surface)]"
                  } transition-colors`}
                >
                  {plan.ctaText}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
