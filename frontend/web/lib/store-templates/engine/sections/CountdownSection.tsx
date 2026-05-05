"use client"

import { useState, useEffect } from "react"
import type { CountdownSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface CountdownSectionFullProps {
  props: CountdownSectionProps
  config: TemplateConfig
}

function getTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function CountdownSection({ props, config }: CountdownSectionFullProps) {
  const theme = useTemplateTheme(config)
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(props.targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(props.targetDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [props.targetDate])

  if (!timeLeft) {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-primary)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 text-center`}>
          <h2 className="text-2xl md:text-3xl font-bold text-white">{props.endedMessage || "This event has ended"}</h2>
        </div>
      </section>
    )
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ]

  if (props.style === "inline") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-primary)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 text-center`}>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{props.title}</h2>
          {props.subtitle && <p className="text-white/80 mb-6">{props.subtitle}</p>}
          <div className="flex items-center justify-center gap-2 text-white">
            {units.map((u, i) => (
              <span key={u.label} className="flex items-center gap-2">
                <span className="text-3xl md:text-4xl font-bold tabular-nums">{String(u.value).padStart(2, "0")}</span>
                <span className="text-xs uppercase tracking-wider text-white/70">{u.label}</span>
                {i < units.length - 1 && <span className="text-2xl font-light mx-1">:</span>}
              </span>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (props.style === "flip") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-surface)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 text-center`}>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-2">{props.title}</h2>
          {props.subtitle && <p className="text-[var(--tpl-text-muted)] mb-8">{props.subtitle}</p>}
          <div className="flex items-center justify-center gap-4">
            {units.map((u) => (
              <div key={u.label} className="flex flex-col items-center">
                <div className={`w-20 h-20 md:w-24 md:h-24 ${theme.bgPrimary} ${theme.radiusClass} flex items-center justify-center shadow-lg`}>
                  <span className={`text-3xl md:text-4xl font-bold ${theme.textOnPrimary} tabular-nums`}>
                    {String(u.value).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xs uppercase tracking-wider text-[var(--tpl-text-muted)] mt-2">{u.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default: cards style
  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-primary)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 text-center`}>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{props.title}</h2>
        {props.subtitle && <p className="text-white/80 mb-8">{props.subtitle}</p>}
        <div className="flex items-center justify-center gap-4">
          {units.map((u) => (
            <div key={u.label} className="flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold text-white tabular-nums">
                  {String(u.value).padStart(2, "0")}
                </span>
              </div>
              <span className="text-xs uppercase tracking-wider text-white/70 mt-2">{u.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
