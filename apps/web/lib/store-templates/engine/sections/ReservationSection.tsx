"use client"

import type { ReservationSectionProps, TemplateConfig, SectionThemeOverride } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface ReservationSectionFullProps {
  props: ReservationSectionProps
  config: TemplateConfig
}

function getThemeClasses(theme: SectionThemeOverride | undefined): { bg: string; text: string; padding: string } {
  const bg = theme?.background === "dark" ? "bg-[var(--tpl-surface)]" :
    theme?.background === "primary" ? "bg-[var(--tpl-primary)]" :
    theme?.background === "gradient" ? "bg-gradient-to-br from-[var(--tpl-primary)] to-[var(--tpl-secondary)]" :
    theme?.background === "surface" ? "bg-[var(--tpl-surface)]" :
    theme?.background === "secondary" ? "bg-[var(--tpl-secondary)]" :
    "bg-[var(--tpl-bg)]"
  const text = theme?.textColor === "light" ? "text-white" : theme?.textColor === "dark" ? "text-gray-900" : "text-[var(--tpl-text)]"
  const padding = theme?.padding === "compact" ? "py-8 md:py-12" : theme?.padding === "spacious" ? "py-16 md:py-24" : theme?.padding === "none" ? "" : "py-12 md:py-20"
  return { bg, text, padding }
}

export function ReservationSection({ props, config }: ReservationSectionFullProps) {
  const theme = useTemplateTheme(config)
  const { layout = "form", title = "Make a Reservation", subtitle, showPhone = true, showEmail = true } = props
  const themeClasses = getThemeClasses(props.sectionTheme)

  const isLightBg = props.sectionTheme?.background === "primary" || props.sectionTheme?.background === "gradient"
  const cardBg = isLightBg ? "bg-white/10 backdrop-blur-sm" : "bg-[var(--tpl-surface)]"
  const cardBorder = isLightBg ? "border-white/20" : "border-[var(--tpl-border)]"
  const cardSubtext = isLightBg ? "text-white/70" : "text-[var(--tpl-text-secondary)]"
  const inputBg = isLightBg ? "bg-white/10 border-white/20 text-white placeholder-white/50" : "bg-[var(--tpl-bg)] border-[var(--tpl-border)] text-[var(--tpl-text)]"
  const btnClass = isLightBg ? "bg-white text-[var(--tpl-primary)] hover:bg-white/90" : "bg-[var(--tpl-primary)] text-white hover:opacity-90"

  const FormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input type="text" placeholder="Name" readOnly className={`${inputBg} border rounded-lg px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--tpl-primary)]/50`} />
        <input type="email" placeholder="Email" readOnly className={`${inputBg} border rounded-lg px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--tpl-primary)]/50`} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input type="date" readOnly className={`${inputBg} border rounded-lg px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--tpl-primary)]/50`} />
        <input type="time" readOnly className={`${inputBg} border rounded-lg px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--tpl-primary)]/50`} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <select disabled className={`${inputBg} border rounded-lg px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--tpl-primary)]/50`}>
          <option>1 Guest</option><option>2 Guests</option><option>3 Guests</option><option>4 Guests</option><option>5+ Guests</option>
        </select>
        <input type="tel" placeholder="Phone" readOnly className={`${inputBg} border rounded-lg px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--tpl-primary)]/50`} />
      </div>
      <textarea placeholder="Special requests (optional)" readOnly rows={3} className={`${inputBg} border rounded-lg px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--tpl-primary)]/50`} />
      <button className={`w-full ${btnClass} rounded-lg px-6 py-3 font-semibold transition-colors`}>
        Reserve Now
      </button>
    </div>
  )

  return (
    <section className={`${themeClasses.padding} ${themeClasses.bg} ${themeClasses.text} ${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
      {layout === "form" && (
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">{title}</h2>
            {subtitle && <p className={`mt-2 ${cardSubtext}`}>{subtitle}</p>}
          </div>
          <FormFields />
        </div>
      )}

      {layout === "split" && (
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            {subtitle && <p className={`${cardSubtext} mb-6`}>{subtitle}</p>}
            <div className="space-y-4">
              {showPhone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--tpl-primary)]/10 flex items-center justify-center text-[var(--tpl-primary)]">📞</div>
                  <div>
                    <p className="text-xs text-[var(--tpl-text-secondary)]">Call us</p>
                    <p className="font-medium">+1 (555) 123-4567</p>
                  </div>
                </div>
              )}
              {showEmail && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--tpl-primary)]/10 flex items-center justify-center text-[var(--tpl-primary)]">✉️</div>
                  <div>
                    <p className="text-xs text-[var(--tpl-text-secondary)]">Email us</p>
                    <p className="font-medium">reservations@example.com</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={`${cardBg} border ${cardBorder} rounded-xl p-6`}>
            <FormFields />
          </div>
        </div>
      )}

      {layout === "card" && (
        <div className={`${cardBg} border ${cardBorder} rounded-2xl p-8 md:p-12 max-w-2xl mx-auto`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">{title}</h2>
            {subtitle && <p className={`mt-2 ${cardSubtext}`}>{subtitle}</p>}
          </div>
          <FormFields />
        </div>
      )}
    </section>
  )
}
