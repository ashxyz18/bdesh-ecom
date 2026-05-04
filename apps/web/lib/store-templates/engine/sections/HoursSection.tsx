"use client"

import type { HoursSectionProps, TemplateConfig, SectionThemeOverride } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface HoursSectionFullProps {
  props: HoursSectionProps
  config: TemplateConfig
}

type ScheduleEntry = { day: string; hours: string }

const DEMO_SCHEDULE: ScheduleEntry[] = [
  { day: "Monday", hours: "9:00 AM - 9:00 PM" },
  { day: "Tuesday", hours: "9:00 AM - 9:00 PM" },
  { day: "Wednesday", hours: "9:00 AM - 9:00 PM" },
  { day: "Thursday", hours: "9:00 AM - 9:00 PM" },
  { day: "Friday", hours: "9:00 AM - 10:00 PM" },
  { day: "Saturday", hours: "10:00 AM - 10:00 PM" },
  { day: "Sunday", hours: "10:00 AM - 8:00 PM" },
]

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

export function HoursSection({ props, config }: HoursSectionFullProps) {
  const theme = useTemplateTheme(config)
  const { layout = "table", schedule, title } = props
  const hours: ScheduleEntry[] = (schedule?.length ? schedule : DEMO_SCHEDULE) as ScheduleEntry[]
  const themeClasses = getThemeClasses(props.sectionTheme)

  const isLightBg = props.sectionTheme?.background === "primary" || props.sectionTheme?.background === "gradient"
  const cardBg = isLightBg ? "bg-white/10 backdrop-blur-sm" : "bg-[var(--tpl-surface)]"
  const cardBorder = isLightBg ? "border-white/20" : "border-[var(--tpl-border)]"
  const cardSubtext = isLightBg ? "text-white/70" : "text-[var(--tpl-text-secondary)]"
  const rowBorder = isLightBg ? "border-white/10" : "border-[var(--tpl-border)]"

  // Detect current day (0=Sunday)
  const todayIndex = new Date().getDay()
  const dayMap: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }

  return (
    <section className={`${themeClasses.padding} ${themeClasses.bg} ${themeClasses.text} ${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
      {title && <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>}

      {layout === "table" && (
        <div className="max-w-xl mx-auto">
          <div className={`${cardBg} border ${cardBorder} rounded-xl overflow-hidden`}>
            {hours.map((entry, i) => {
              const dayNum = dayMap[entry.day.toLowerCase()] ?? -1
              const isToday = dayNum === todayIndex
              return (
                <div key={i} className={`flex justify-between items-center px-6 py-3 ${i < hours.length - 1 ? `border-b ${rowBorder}` : ""} ${isToday ? "bg-[var(--tpl-primary)]/5" : ""}`}>
                  <span className={`font-medium ${isToday ? "text-[var(--tpl-primary)]" : ""}`}>{entry.day}{isToday && <span className="ml-2 text-xs bg-[var(--tpl-primary)] text-white px-2 py-0.5 rounded-full">Today</span>}</span>
                  <span className={isToday ? "font-semibold text-[var(--tpl-primary)]" : cardSubtext}>{entry.hours}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {layout === "cards" && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto">
          {hours.map((entry, i) => {
            const dayNum = dayMap[entry.day.toLowerCase()] ?? -1
            const isToday = dayNum === todayIndex
            return (
              <div key={i} className={`${cardBg} border ${isToday ? "border-[var(--tpl-primary)]" : cardBorder} rounded-xl p-4 text-center ${isToday ? "ring-2 ring-[var(--tpl-primary)]/20" : ""}`}>
                <p className={`font-semibold ${isToday ? "text-[var(--tpl-primary)]" : ""}`}>{entry.day}</p>
                <p className={`text-sm mt-1 ${cardSubtext}`}>{entry.hours}</p>
              </div>
            )
          })}
        </div>
      )}

      {layout === "minimal" && (
        <div className="max-w-md mx-auto text-center space-y-2">
          {hours.map((entry, i) => {
            const dayNum = dayMap[entry.day.toLowerCase()] ?? -1
            const isToday = dayNum === todayIndex
            return (
              <div key={i} className={`flex justify-between items-center ${isToday ? "font-semibold text-[var(--tpl-primary)]" : cardSubtext}`}>
                <span>{entry.day}</span>
                <span>{entry.hours}</span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
