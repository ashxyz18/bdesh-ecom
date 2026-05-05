"use client"

import { Facebook, Instagram, Twitter, Linkedin, Globe } from "lucide-react"
import type { TeamSectionProps } from "../types"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface TeamSectionFullProps {
  props: TeamSectionProps
  config: TemplateConfig
}

const SOCIAL_ICON_MAP: Record<string, any> = { Facebook, Instagram, Twitter, Linkedin, Globe }

const COLS_MAP: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
}

export function TeamSection({ props, config }: TeamSectionFullProps) {
  const theme = useTemplateTheme(config)
  const style = props.style || "cards"
  const cols = props.columns || 3

  return (
    <section className={`${theme.sectionPadding} bg-[var(--tpl-bg)]`}>
      <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
        {props.title && (
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--tpl-text)] text-center mb-10">
            {props.title}
          </h2>
        )}
        <div className={`grid gap-8 ${COLS_MAP[cols]}`}>
          {props.members.map((member, i) => {
            if (style === "overlay") {
              return (
                <div key={i} className={`group relative ${theme.radiusClass} overflow-hidden aspect-[3/4]`}>
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[var(--tpl-surface)] flex items-center justify-center">
                      <span className="text-5xl font-bold text-[var(--tpl-text-muted)]">{member.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <h3 className="text-lg font-bold text-white">{member.name}</h3>
                    <p className="text-sm text-white/80">{member.role}</p>
                    {member.bio && <p className="text-xs text-white/60 mt-1 line-clamp-2">{member.bio}</p>}
                    {member.social && member.social.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {member.social.map((s, j) => {
                          const Icon = SOCIAL_ICON_MAP[s.platform] || Globe
                          return (
                            <a key={j} href={s.url} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                              <Icon size={14} />
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            if (style === "minimal") {
              return (
                <div key={i} className="text-center">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className={`w-24 h-24 rounded-full object-cover mx-auto mb-4`} />
                  ) : (
                    <div className={`w-24 h-24 rounded-full bg-[var(--tpl-primary)]/10 flex items-center justify-center mx-auto mb-4`}>
                      <span className="text-2xl font-bold text-[var(--tpl-primary)]">{member.name.charAt(0)}</span>
                    </div>
                  )}
                  <h3 className="font-semibold text-[var(--tpl-text)]">{member.name}</h3>
                  <p className="text-sm text-[var(--tpl-text-muted)]">{member.role}</p>
                  {member.social && member.social.length > 0 && (
                    <div className="flex gap-3 justify-center mt-2">
                      {member.social.map((s, j) => {
                        const Icon = SOCIAL_ICON_MAP[s.platform] || Globe
                        return (
                          <a key={j} href={s.url} target="_blank" rel="noopener noreferrer" className="text-[var(--tpl-text-muted)] hover:text-[var(--tpl-primary)] transition-colors">
                            <Icon size={14} />
                          </a>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Default: cards
            return (
              <div key={i} className={`${theme.cardClass} ${theme.radiusClass} overflow-hidden text-center`}>
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full aspect-square object-cover" />
                ) : (
                  <div className="w-full aspect-square bg-[var(--tpl-surface)] flex items-center justify-center">
                    <span className="text-4xl font-bold text-[var(--tpl-text-muted)]">{member.name.charAt(0)}</span>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-[var(--tpl-text)]">{member.name}</h3>
                  <p className="text-sm text-[var(--tpl-text-muted)]">{member.role}</p>
                  {member.bio && <p className="text-xs text-[var(--tpl-text-muted)] mt-2 line-clamp-2">{member.bio}</p>}
                  {member.social && member.social.length > 0 && (
                    <div className="flex gap-3 justify-center mt-3">
                      {member.social.map((s, j) => {
                        const Icon = SOCIAL_ICON_MAP[s.platform] || Globe
                        return (
                          <a key={j} href={s.url} target="_blank" rel="noopener noreferrer" className="text-[var(--tpl-text-muted)] hover:text-[var(--tpl-primary)] transition-colors">
                            <Icon size={14} />
                          </a>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
