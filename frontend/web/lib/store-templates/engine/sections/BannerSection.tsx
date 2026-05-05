"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { BannerSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface BannerSectionFullProps {
  props: BannerSectionProps
  config: TemplateConfig
}

const HEIGHT_MAP = {
  sm: "py-16",
  md: "py-24",
  lg: "py-32",
  full: "min-h-[70vh] flex items-center",
}

const ALIGN_MAP = {
  left: "text-left",
  center: "text-center",
  right: "text-right ml-auto",
}

export function BannerSection({ props, config }: BannerSectionFullProps) {
  const theme = useTemplateTheme(config)
  const isLight = props.textColor !== "light"
  const textClass = isLight ? "text-[var(--tpl-text)]" : "text-white"
  const mutedClass = isLight ? "text-[var(--tpl-text-muted)]" : "text-white/80"

  const bgStyle: React.CSSProperties = props.backgroundImage
    ? { backgroundImage: `url(${props.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : {}

  const bgColor = props.bgColor || "var(--tpl-primary)"

  return (
    <section
      className={`relative ${HEIGHT_MAP[props.height || "md"]} ${!props.backgroundImage ? "" : ""}`}
      style={props.backgroundImage ? bgStyle : { backgroundColor: bgColor }}
    >
      {props.backgroundImage && props.overlay !== false && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      {!props.backgroundImage && (
        <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
      )}
      <div className={`relative ${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        <div className={`max-w-2xl ${ALIGN_MAP[props.alignment || "center"]}`}>
          <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${textClass}`}>{props.title}</h2>
          {props.subtitle && <p className={`text-lg mb-8 ${mutedClass}`}>{props.subtitle}</p>}
          {props.ctaText && (
            <Link
              href={props.ctaLink || "#"}
              className={`inline-flex items-center gap-2 px-8 py-3.5 ${isLight ? `${theme.bgPrimary} ${theme.textOnPrimary}` : "bg-white text-gray-900"} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity shadow-lg`}
            >
              {props.ctaText} <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
