"use client"

import { useState } from "react"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Send } from "lucide-react"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface ConfigFooterProps {
  config: TemplateConfig
  store: {
    id: string
    name: string
    slug: string
    subdomain: string
    description: string | null
    collections: { id: string; name: string; slug: string; image: string | null }[]
  }
}

export function ConfigFooter({ config, store }: ConfigFooterProps) {
  const theme = useTemplateTheme(config)
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const storeLink = (subpath: string) => {
    const base = `/store?store=${store.subdomain}`
    return subpath ? `${base}&path=${subpath}` : base
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) { setSubscribed(true); setEmail("") }
  }

  const isDark = config.footer.style === "dark"
  const isMinimal = config.footer.style === "minimal"

  const bgClass = isDark
    ? "bg-[var(--tpl-primary)]"
    : isMinimal
    ? "bg-[var(--tpl-bg)] border-t border-[var(--tpl-border)]"
    : "bg-gray-50 border-t border-[var(--tpl-border)]"

  const textClass = isDark ? "text-white" : "text-[var(--tpl-text)]"
  const mutedClass = isDark ? "text-white/60" : "text-[var(--tpl-text-muted)]"
  const linkHover = isDark ? "hover:text-white" : "hover:text-[var(--tpl-primary)]"

  const colCount = config.footer.columns

  return (
    <footer className={`${bgClass} pt-16 pb-8`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        <div className={`grid gap-8 ${colCount === 2 ? "md:grid-cols-2" : colCount === 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
          {/* Brand Column */}
          <div>
            <h3 className={`text-lg font-bold ${textClass} mb-3`}>{store.name}</h3>
            {store.description && <p className={`text-sm ${mutedClass} mb-4 line-clamp-3`}>{store.description}</p>}
            {config.footer.showSocial && (
              <div className="flex items-center gap-3">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className={`w-9 h-9 ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-[var(--tpl-primary)]/10 hover:bg-[var(--tpl-primary)]/20"} ${theme.radiusClass} flex items-center justify-center transition-colors`}>
                    <Icon size={16} className={mutedClass} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-sm font-semibold ${textClass} mb-3`}>Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "All Products", ...store.collections.slice(0, 2).map(c => c.name)].map(link => (
                <li key={link}>
                  <Link href={storeLink("")} className={`text-sm ${mutedClass} ${linkHover} transition-colors`}>{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          {colCount >= 3 && (
            <div>
              <h4 className={`text-sm font-semibold ${textClass} mb-3`}>Collections</h4>
              <ul className="space-y-2">
                {store.collections.slice(0, 5).map(col => (
                  <li key={col.id}>
                    <Link href={storeLink(`collection/${col.slug}`)} className={`text-sm ${mutedClass} ${linkHover} transition-colors`}>{col.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Newsletter */}
          {config.footer.showNewsletter && (
            <div>
              <h4 className={`text-sm font-semibold ${textClass} mb-3`}>Newsletter</h4>
              <p className={`text-sm ${mutedClass} mb-3`}>Get the latest updates and offers.</p>
              {subscribed ? (
                <p className={`text-sm ${isDark ? "text-green-300" : "text-green-600"}`}>✓ Subscribed!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email"
                    className={`flex-1 px-3 py-2 text-sm ${theme.radiusClass} ${isDark ? "bg-white/10 border-white/20 text-white placeholder:text-white/40" : "bg-[var(--tpl-bg)] border-[var(--tpl-border)] text-[var(--tpl-text)]"} border outline-none focus:ring-2 focus:ring-[var(--tpl-primary)]/30`}
                  />
                  <button type="submit" className={`px-3 py-2 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} text-sm font-medium hover:opacity-90 transition-opacity`}>
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className={`mt-12 pt-6 ${isDark ? "border-t border-white/10" : "border-t border-[var(--tpl-border)]"} flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <p className={`text-sm ${mutedClass}`}>© {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <p className={`text-sm ${mutedClass}`}>Powered by Bdesh</p>
        </div>
      </div>
    </footer>
  )
}
