"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import type { NewsletterSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface NewsletterSectionFullProps {
  props: NewsletterSectionProps
  config: TemplateConfig
}

export function NewsletterSection({ props, config }: NewsletterSectionFullProps) {
  const theme = useTemplateTheme(config)
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) { setSubscribed(true); setEmail("") }
  }

  if (props.style === "fullwidth") {
    return (
      <section className="bg-[var(--tpl-primary)] py-16">
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 text-center`}>
          <h2 className="text-2xl font-bold text-white mb-2">{props.title}</h2>
          <p className="text-white/80 mb-6">{props.subtitle}</p>
          {subscribed ? (
            <p className="text-white font-medium">✓ Thank you for subscribing!</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex max-w-md mx-auto gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/30"
              />
              <button type="submit" className="px-6 py-3 bg-white text-[var(--tpl-primary)] rounded-xl font-medium hover:bg-white/90 transition-colors">
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </section>
    )
  }

  if (props.style === "card") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          <div className={`${theme.cardClass} ${theme.radiusClass} p-8 text-center`}>
            <h2 className="text-2xl font-bold text-[var(--tpl-text)] mb-2">{props.title}</h2>
            <p className="text-[var(--tpl-text-muted)] mb-6">{props.subtitle}</p>
            {subscribed ? (
              <p className="text-green-600 font-medium">✓ Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex max-w-md mx-auto gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className={`flex-1 px-4 py-3 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-bg)] text-[var(--tpl-text)] outline-none focus:ring-2 focus:ring-[var(--tpl-primary)]/20`}
                />
                <button type="submit" className={`px-6 py-3 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity`}>
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    )
  }

  // Default: inline
  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-surface)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--tpl-text)]">{props.title}</h2>
            <p className="text-sm text-[var(--tpl-text-muted)]">{props.subtitle}</p>
          </div>
          {subscribed ? (
            <p className="text-green-600 font-medium text-sm">✓ Subscribed!</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email"
                className={`px-4 py-2.5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-bg)] text-[var(--tpl-text)] text-sm outline-none focus:ring-2 focus:ring-[var(--tpl-primary)]/20`}
              />
              <button type="submit" className={`px-4 py-2.5 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} text-sm font-medium hover:opacity-90 transition-opacity`}>
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
