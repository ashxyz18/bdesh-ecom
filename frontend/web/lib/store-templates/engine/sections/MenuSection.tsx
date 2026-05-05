"use client"

import type { MenuSectionProps, TemplateConfig, SectionThemeOverride } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface MenuSectionFullProps {
  props: MenuSectionProps
  config: TemplateConfig
}

type MenuItem = { name: string; description?: string; price: string; image?: string; badge?: string }
type MenuCategory = { name: string; items: MenuItem[] }

const DEMO_CATEGORIES: MenuCategory[] = [
  {
    name: "Starters",
    items: [
      { name: "Bruschetta", description: "Toasted bread with fresh tomatoes, basil, and olive oil", price: "$8.99", badge: "Popular" },
      { name: "Caesar Salad", description: "Crisp romaine with parmesan, croutons, and house dressing", price: "$10.99" },
      { name: "Soup of the Day", description: "Freshly prepared daily with seasonal ingredients", price: "$7.99" },
    ],
  },
  {
    name: "Main Course",
    items: [
      { name: "Grilled Salmon", description: "Atlantic salmon with lemon butter and seasonal vegetables", price: "$24.99", badge: "Chef's Choice" },
      { name: "Ribeye Steak", description: "12oz prime cut with mashed potatoes and asparagus", price: "$32.99" },
      { name: "Mushroom Risotto", description: "Arborio rice with wild mushrooms, parmesan, and truffle oil", price: "$18.99" },
    ],
  },
  {
    name: "Desserts",
    items: [
      { name: "Tiramisu", description: "Classic Italian dessert with espresso and mascarpone", price: "$9.99" },
      { name: "Crème Brûlée", description: "Vanilla custard with caramelized sugar top", price: "$8.99", badge: "Must Try" },
    ],
  },
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

export function MenuSection({ props, config }: MenuSectionFullProps) {
  const theme = useTemplateTheme(config)
  const { layout = "cards", categories, title, showImages = false, columns = 3 } = props
  const cats: MenuCategory[] = (categories?.length ? categories : DEMO_CATEGORIES) as MenuCategory[]
  const themeClasses = getThemeClasses(props.sectionTheme)

  const isLightBg = props.sectionTheme?.background === "primary" || props.sectionTheme?.background === "gradient"
  const cardBg = isLightBg ? "bg-white/10 backdrop-blur-sm" : "bg-[var(--tpl-surface)]"
  const cardBorder = isLightBg ? "border-white/20" : "border-[var(--tpl-border)]"
  const cardSubtext = isLightBg ? "text-white/70" : "text-[var(--tpl-text-secondary)]"
  const colClass = columns === 2 ? "md:grid-cols-2" : columns === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"

  return (
    <section className={`${themeClasses.padding} ${themeClasses.bg} ${themeClasses.text} ${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
      {title && <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>}

      {layout === "cards" && (
        <div className="space-y-12">
          {cats.map((cat, ci) => (
            <div key={ci}>
              <h3 className="text-2xl font-bold mb-6 text-center border-b border-[var(--tpl-border)] pb-3">{cat.name}</h3>
              <div className={`grid gap-4 ${colClass}`}>
                {cat.items.map((item, ii) => (
                  <div key={ii} className={`${cardBg} border ${cardBorder} rounded-xl p-5 hover:shadow-md transition-shadow`}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{item.name}</h4>
                          {item.badge && <span className="text-[10px] font-medium bg-[var(--tpl-primary)]/10 text-[var(--tpl-primary)] px-2 py-0.5 rounded-full">{item.badge}</span>}
                        </div>
                        {item.description && <p className={`text-sm ${cardSubtext} mt-1`}>{item.description}</p>}
                      </div>
                      <span className="font-bold text-[var(--tpl-primary)] whitespace-nowrap">{item.price}</span>
                    </div>
                    {showImages && item.image && (
                      <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg mt-3" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {layout === "list" && (
        <div className="max-w-3xl mx-auto space-y-10">
          {cats.map((cat, ci) => (
            <div key={ci}>
              <h3 className="text-2xl font-bold mb-4 text-center">{cat.name}</h3>
              <div className="space-y-4">
                {cat.items.map((item, ii) => (
                  <div key={ii} className="flex justify-between items-start gap-4 border-b border-[var(--tpl-border)] pb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{item.name}</h4>
                    {item.badge && <span className="text-[10px] font-medium bg-[var(--tpl-primary)]/10 text-[var(--tpl-primary)] px-2 py-0.5 rounded-full">{item.badge}</span>}
                  </div>
                  {item.description && <p className={`text-sm ${cardSubtext} mt-1`}>{item.description}</p>}
                </div>
                <span className="font-bold text-[var(--tpl-primary)]">{item.price}</span>
              </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {layout === "tabs" && (
        <div>
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {cats.map((cat, ci) => (
              <button key={ci} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${ci === 0 ? "bg-[var(--tpl-primary)] text-white" : "bg-[var(--tpl-surface)] border border-[var(--tpl-border)] hover:bg-[var(--tpl-primary)]/10"}`}>
                {cat.name}
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {cats[0]?.items.map((item, ii) => (
              <div key={ii} className={`${cardBg} border ${cardBorder} rounded-xl p-5`}>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{item.name}</h4>
                      {item.badge && <span className="text-[10px] font-medium bg-[var(--tpl-primary)]/10 text-[var(--tpl-primary)] px-2 py-0.5 rounded-full">{item.badge}</span>}
                    </div>
                    {item.description && <p className={`text-sm ${cardSubtext} mt-1`}>{item.description}</p>}
                  </div>
                  <span className="font-bold text-[var(--tpl-primary)]">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {layout === "grid" && (
        <div className="space-y-10">
          {cats.map((cat, ci) => (
            <div key={ci}>
              <h3 className="text-2xl font-bold mb-6 text-center">{cat.name}</h3>
              <div className={`grid gap-6 ${colClass}`}>
                {cat.items.map((item, ii) => (
                  <div key={ii} className={`${cardBg} border ${cardBorder} rounded-xl overflow-hidden`}>
                    {(showImages && item.image) ? (
                      <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-[var(--tpl-primary)]/10 to-[var(--tpl-secondary)]/10 flex items-center justify-center">
                        <span className="text-3xl opacity-20">🍽️</span>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          {item.description && <p className={`text-xs ${cardSubtext} mt-1`}>{item.description}</p>}
                        </div>
                        <span className="font-bold text-[var(--tpl-primary)] text-sm">{item.price}</span>
                      </div>
                      {item.badge && <span className="inline-block mt-2 text-[10px] font-medium bg-[var(--tpl-primary)]/10 text-[var(--tpl-primary)] px-2 py-0.5 rounded-full">{item.badge}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
