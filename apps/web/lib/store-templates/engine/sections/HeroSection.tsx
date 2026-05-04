"use client"

import { useState, useEffect, Fragment } from "react"
import Link from "next/link"
import { ArrowRight, Truck, ShieldCheck, RefreshCcw, Headphones, CreditCard, Package, Star } from "lucide-react"
import type { HeroSectionProps, FeatureItem } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"
import type { TemplateConfig } from "../types"
import { SafeImage } from "../components/SafeImage"

const ICON_MAP: Record<string, any> = { Truck, ShieldCheck, RefreshCcw, Headphones, CreditCard, Package, Star, ArrowRight }

interface HeroSectionFullProps {
  props: HeroSectionProps
  config: TemplateConfig
  store: {
    name: string
    description: string | null
    banner: string | null
    subdomain: string
  }
}

export function HeroSection({ props, config, store }: HeroSectionFullProps) {
  const theme = useTemplateTheme(config)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => { setIsVisible(true) }, [])

  const title = props.title || store.name
  const subtitle = props.subtitle || store.description || ""
  const ctaText = props.ctaText || "Shop Now"
  const ctaLink = props.ctaLink || `/store?store=${store.subdomain}`
  const storeLink = (subpath: string) => {
    const base = `/store?store=${store.subdomain}`
    return subpath ? `${base}&path=${subpath}` : base
  }

  const heroBg = props.backgroundImage && store.banner
    ? "bg-cover bg-center"
    : "bg-gradient-to-br from-[var(--tpl-primary)]/5 via-[var(--tpl-bg)] to-[var(--tpl-secondary)]/5"

  const heroStyle = props.backgroundImage && store.banner
    ? { backgroundImage: `url(${store.banner})` }
    : {}

  const overlayNeeded = props.backgroundImage && store.banner && props.overlay !== false

  if (props.style === "minimal") {
    return (
      <section className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 py-12 md:py-20`}>
        <div className={`max-w-2xl transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--tpl-text)] mb-4">{title}</h1>
          <p className="text-lg text-[var(--tpl-text-muted)] mb-6">{subtitle}</p>
          <Link href={ctaLink} className={`inline-flex items-center gap-2 px-6 py-3 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity`}>
            {ctaText} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    )
  }

  if (props.style === "split") {
    return (
      <section className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 py-12 md:py-20`}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <h1 className="text-3xl md:text-5xl font-bold text-[var(--tpl-text)] mb-4">{title}</h1>
            <p className="text-lg text-[var(--tpl-text-muted)] mb-6">{subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={ctaLink} className={`inline-flex items-center justify-center gap-2 px-6 py-3 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity`}>
                {ctaText} <ArrowRight size={16} />
              </Link>
              <Link href={storeLink("")} className={`inline-flex items-center justify-center gap-2 px-6 py-3 border border-[var(--tpl-border)] ${theme.radiusClass} font-medium text-[var(--tpl-text)] hover:bg-[var(--tpl-surface)] transition-colors`}>
                Browse All
              </Link>
            </div>
            {props.showFeatures && props.features && props.features.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-4">
                {props.features.map((f, i) => {
                  const Icon = ICON_MAP[f.icon] || Star
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${theme.radiusClass} ${theme.bgPrimary}/10 flex items-center justify-center`}>
                        <Icon size={18} className="text-[var(--tpl-primary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--tpl-text)]">{f.title}</p>
                        <p className="text-xs text-[var(--tpl-text-muted)]">{f.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className={`relative ${theme.radiusClass} overflow-hidden aspect-square bg-[var(--tpl-surface)]`}>
            {store.banner ? (
              <SafeImage src={store.banner} alt={store.name} fill className="object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${theme.bgPrimary}/5`}>
                <span className="text-6xl font-bold text-[var(--tpl-primary)]/20">{store.name.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  // Default: centered or fullwidth
  return (
    <section
      className={`relative overflow-hidden ${heroBg} ${props.minHeight || "py-20 md:py-32"}`}
      style={heroStyle}
    >
      {overlayNeeded && <div className="absolute inset-0 bg-black/40" />}
      <div className={`relative ${theme.maxWidthClass} mx-auto px-4 lg:px-8 text-center`}>
        <div className={`max-w-3xl mx-auto transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold mb-4 ${overlayNeeded ? "text-white" : "text-[var(--tpl-text)]"}`}>
            {title}
          </h1>
          <p className={`text-lg md:text-xl mb-8 ${overlayNeeded ? "text-white/80" : "text-[var(--tpl-text-muted)]"}`}>
            {subtitle}
          </p>
          <div className={`flex flex-col sm:flex-row gap-3 justify-center ${props.style === "fullwidth" ? "" : ""}`}>
            <Link href={ctaLink} className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium text-base hover:opacity-90 transition-opacity shadow-lg`}>
              {ctaText} <ArrowRight size={16} />
            </Link>
            <Link href={storeLink("")} className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 ${overlayNeeded ? "bg-white/20 text-white border-white/30 hover:bg-white/30" : `bg-[var(--tpl-surface)] text-[var(--tpl-text)] border-[var(--tpl-border)] hover:bg-[var(--tpl-surface)]`} border ${theme.radiusClass} font-medium text-base transition-colors`}>
              Browse Products
            </Link>
          </div>
        </div>

        {/* Features row */}
        {props.showFeatures && props.features && props.features.length > 0 && (
          <div className={`mt-12 flex flex-wrap justify-center gap-6 md:gap-10 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            {props.features.map((f, i) => {
              const Icon = ICON_MAP[f.icon] || Star
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <Icon size={18} className={overlayNeeded ? "text-white/80" : "text-[var(--tpl-primary)]"} />
                  <div className="text-left">
                    <p className={`text-sm font-medium ${overlayNeeded ? "text-white" : "text-[var(--tpl-text)]"}`}>{f.title}</p>
                    <p className={`text-xs ${overlayNeeded ? "text-white/60" : "text-[var(--tpl-text-muted)]"}`}>{f.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats row */}
        {props.showStats && props.stats && props.stats.length > 0 && (
          <div className={`mt-10 flex flex-wrap justify-center gap-8 md:gap-16 transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            {props.stats.map((stat, i) => (
              <Fragment key={i}>
                <div className="text-center">
                  <p className={`text-2xl md:text-3xl font-bold ${overlayNeeded ? "text-white" : "text-[var(--tpl-primary)]"}`}>{stat.value}</p>
                  <p className={`text-sm ${overlayNeeded ? "text-white/60" : "text-[var(--tpl-text-muted)]"}`}>{stat.label}</p>
                </div>
                {i < props.stats!.length - 1 && (
                  <div className={`w-px h-12 ${overlayNeeded ? "bg-white/20" : "bg-[var(--tpl-border)]"}`} />
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
