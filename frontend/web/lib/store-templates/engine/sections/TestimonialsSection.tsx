"use client"

import { Star, Quote } from "lucide-react"
import type { TestimonialsSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

const DEMO_TESTIMONIALS = [
  { name: "Rahim Ahmed", text: "Excellent quality and fast delivery. Will definitely order again!", rating: 5 },
  { name: "Fatima Khan", text: "Beautiful products with great customer service. Highly recommended.", rating: 5 },
  { name: "Kamal Hossain", text: "Good value for money. The product exceeded my expectations.", rating: 4 },
]

interface TestimonialsSectionFullProps {
  props: TestimonialsSectionProps
  config: TemplateConfig
}

export function TestimonialsSection({ props, config }: TestimonialsSectionFullProps) {
  const theme = useTemplateTheme(config)
  const testimonials = DEMO_TESTIMONIALS.slice(0, props.limit || 3)
  const isMinimal = props.style === "minimal"

  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-surface)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        <h2 className="text-2xl font-bold text-[var(--tpl-text)] text-center mb-8">What Our Customers Say</h2>
        <div className={`grid gap-6 ${testimonials.length <= 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          {testimonials.map((t, i) => (
            <div key={i} className={`${theme.cardClass} ${theme.radiusClass} p-6`}>
              {!isMinimal && <Quote size={24} className="text-[var(--tpl-primary)]/20 mb-3" />}
              <div className="flex items-center gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={14} className={s <= t.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                ))}
              </div>
              <p className="text-sm text-[var(--tpl-text-muted)] mb-4 line-clamp-3">{t.text}</p>
              <p className="text-sm font-medium text-[var(--tpl-text)]">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
