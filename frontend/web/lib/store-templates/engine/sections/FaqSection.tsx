"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { FaqSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface FaqSectionFullProps {
  props: FaqSectionProps
  config: TemplateConfig
}

export function FaqSection({ props, config }: FaqSectionFullProps) {
  const theme = useTemplateTheme(config)
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const style = props.style || "accordion"

  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        {props.title && (
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] text-center mb-10">
            {props.title}
          </h2>
        )}
        <div className="max-w-3xl mx-auto space-y-3">
          {props.items.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className={`${style === "bordered" ? "border border-[var(--tpl-border)]" : "border-b border-[var(--tpl-border)]"} ${theme.radiusClass} overflow-hidden ${style === "bordered" ? theme.cardClass : ""}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between py-4 px-5 text-left hover:bg-[var(--tpl-surface)] transition-colors"
                >
                  <span className="font-medium text-[var(--tpl-text)] pr-4">{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-[var(--tpl-text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-[var(--tpl-text-muted)] text-sm leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
