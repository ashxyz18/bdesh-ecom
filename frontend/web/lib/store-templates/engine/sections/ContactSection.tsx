"use client"

import type { ContactSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"
import { Mail, Phone, MapPin } from "lucide-react"

interface ContactSectionFullProps {
  props: ContactSectionProps
  config: TemplateConfig
}

export function ContactSection({ props, config }: ContactSectionFullProps) {
  const theme = useTemplateTheme(config)
  const {
    layout = "split",
    showMap = false,
    showForm = true,
    title = "Get In Touch",
    subtitle,
    email,
    phone,
    address,
  } = props

  const contactInfo = [
    ...(email ? [{ icon: Mail, label: "Email", value: email }] : [{ icon: Mail, label: "Email", value: "hello@example.com" }]),
    ...(phone ? [{ icon: Phone, label: "Phone", value: phone }] : [{ icon: Phone, label: "Phone", value: "+880 1XXX-XXXXXX" }]),
    ...(address ? [{ icon: MapPin, label: "Address", value: address }] : [{ icon: MapPin, label: "Address", value: "Dhaka, Bangladesh" }]),
  ]

  if (layout === "centered") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 text-center`}>
          {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-2">{title}</h2>}
          {subtitle && <p className="text-[var(--tpl-text-muted)] mb-8">{subtitle}</p>}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {contactInfo.map((info, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 ${theme.radiusClass} bg-[var(--tpl-primary)]/10 flex items-center justify-center`}>
                  <info.icon size={18} className="text-[var(--tpl-primary)]" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-[var(--tpl-text-muted)]">{info.label}</p>
                  <p className="text-sm font-medium text-[var(--tpl-text)]">{info.value}</p>
                </div>
              </div>
            ))}
          </div>
          {showForm && (
            <div className={`max-w-lg mx-auto p-6 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-surface)]`}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name" className={`px-4 py-2.5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-bg)] text-sm text-[var(--tpl-text)] outline-none focus:border-[var(--tpl-primary)]`} readOnly />
                  <input type="email" placeholder="Your Email" className={`px-4 py-2.5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-bg)] text-sm text-[var(--tpl-text)] outline-none focus:border-[var(--tpl-primary)]`} readOnly />
                </div>
                <textarea placeholder="Your Message" rows={4} className={`w-full px-4 py-2.5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-bg)] text-sm text-[var(--tpl-text)] outline-none focus:border-[var(--tpl-primary)] resize-none`} readOnly />
                <button className={`w-full py-2.5 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium text-sm`}>Send Message</button>
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }

  if (layout === "minimal") {
    return (
      <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          <div className="flex flex-wrap justify-center gap-8">
            {contactInfo.map((info, i) => (
              <div key={i} className="flex items-center gap-2">
                <info.icon size={16} className="text-[var(--tpl-primary)]" />
                <span className="text-sm text-[var(--tpl-text)]">{info.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default: split layout
  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            {title && <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] mb-2">{title}</h2>}
            {subtitle && <p className="text-[var(--tpl-text-muted)] mb-8">{subtitle}</p>}
            <div className="space-y-6">
              {contactInfo.map((info, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${theme.radiusClass} bg-[var(--tpl-primary)]/10 flex items-center justify-center shrink-0`}>
                    <info.icon size={18} className="text-[var(--tpl-primary)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--tpl-text-muted)]">{info.label}</p>
                    <p className="text-sm font-medium text-[var(--tpl-text)]">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {showForm && (
            <div className={`p-6 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-surface)]`}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name" className={`px-4 py-2.5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-bg)] text-sm text-[var(--tpl-text)] outline-none focus:border-[var(--tpl-primary)]`} readOnly />
                  <input type="email" placeholder="Your Email" className={`px-4 py-2.5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-bg)] text-sm text-[var(--tpl-text)] outline-none focus:border-[var(--tpl-primary)]`} readOnly />
                </div>
                <input type="text" placeholder="Subject" className={`w-full px-4 py-2.5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-bg)] text-sm text-[var(--tpl-text)] outline-none focus:border-[var(--tpl-primary)]`} readOnly />
                <textarea placeholder="Your Message" rows={4} className={`w-full px-4 py-2.5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-bg)] text-sm text-[var(--tpl-text)] outline-none focus:border-[var(--tpl-primary)] resize-none`} readOnly />
                <button className={`w-full py-2.5 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium text-sm`}>Send Message</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
