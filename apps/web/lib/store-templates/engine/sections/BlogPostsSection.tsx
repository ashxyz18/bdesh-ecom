"use client"

import type { BlogPostsSectionProps, TemplateConfig, SectionThemeOverride } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface BlogPostsSectionFullProps {
  props: BlogPostsSectionProps
  config: TemplateConfig
}

interface BlogPost {
  title: string
  excerpt?: string
  date?: string
  author?: string
  image?: string
  category?: string
  slug?: string
}

const DEMO_POSTS: BlogPost[] = [
  { title: "Getting Started with Modern Web Design", excerpt: "Learn the fundamentals of creating beautiful, responsive websites that engage users.", date: "2024-01-15", author: "Sarah Chen", category: "Design" },
  { title: "The Future of E-Commerce", excerpt: "Explore emerging trends shaping the online shopping experience of tomorrow.", date: "2024-01-12", author: "Mike Ross", category: "Business" },
  { title: "Building Scalable Applications", excerpt: "Best practices for architecting systems that grow with your business needs.", date: "2024-01-10", author: "Alex Kim", category: "Technology" },
  { title: "Design Systems That Work", excerpt: "How to create and maintain design systems that teams actually use.", date: "2024-01-08", author: "Emma Liu", category: "Design" },
  { title: "Customer Experience Excellence", excerpt: "Strategies for delivering exceptional experiences at every touchpoint.", date: "2024-01-05", author: "David Park", category: "Business" },
  { title: "Performance Optimization Guide", excerpt: "Techniques to make your web applications lightning fast.", date: "2024-01-03", author: "Lisa Wang", category: "Technology" },
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

export function BlogPostsSection({ props, config }: BlogPostsSectionFullProps) {
  const theme = useTemplateTheme(config)
  const { layout = "grid", columns = 3, title, showExcerpt = true, showDate = true, showAuthor = false } = props
  const posts = DEMO_POSTS.slice(0, props.limit || 6)
  const themeClasses = getThemeClasses(props.sectionTheme)

  const isLightBg = props.sectionTheme?.background === "primary" || props.sectionTheme?.background === "gradient"
  const cardBg = isLightBg ? "bg-white/10 backdrop-blur-sm" : "bg-[var(--tpl-surface)]"
  const cardBorder = isLightBg ? "border-white/20" : "border-[var(--tpl-border)]"
  const cardSubtext = isLightBg ? "text-white/70" : "text-[var(--tpl-text-secondary)]"
  const colClass = columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"

  return (
    <section className={`${themeClasses.padding} ${themeClasses.bg} ${themeClasses.text} ${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
      {title && <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>}

      {layout === "grid" && (
        <div className={`grid gap-8 ${colClass}`}>
          {posts.map((post, i) => (
            <article key={i} className={`${cardBg} border ${cardBorder} rounded-xl overflow-hidden hover:shadow-lg transition-shadow group`}>
              <div className="h-48 bg-gradient-to-br from-[var(--tpl-primary)]/20 to-[var(--tpl-secondary)]/20 flex items-center justify-center">
                {post.image ? (
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl opacity-30">📝</span>
                )}
              </div>
              <div className="p-6">
                {post.category && <span className="text-xs font-medium text-[var(--tpl-primary)] uppercase tracking-wider">{post.category}</span>}
                <h3 className="font-bold text-lg mt-2 mb-2 group-hover:text-[var(--tpl-primary)] transition-colors">{post.title}</h3>
                {showExcerpt && post.excerpt && <p className={`text-sm ${cardSubtext} mb-4`}>{post.excerpt}</p>}
                <div className={`flex items-center gap-3 text-xs ${cardSubtext}`}>
                  {showDate && post.date && <time>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time>}
                  {showAuthor && post.author && <span>· {post.author}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {layout === "list" && (
        <div className="max-w-3xl mx-auto space-y-6">
          {posts.map((post, i) => (
            <article key={i} className={`${cardBg} border ${cardBorder} rounded-xl p-6 flex gap-6 hover:shadow-md transition-shadow`}>
              <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-gradient-to-br from-[var(--tpl-primary)]/20 to-[var(--tpl-secondary)]/20 flex items-center justify-center">
                {post.image ? <img src={post.image} alt={post.title} className="w-full h-full object-cover rounded-lg" /> : <span className="text-2xl opacity-30">📝</span>}
              </div>
              <div className="flex-1">
                {post.category && <span className="text-xs font-medium text-[var(--tpl-primary)] uppercase tracking-wider">{post.category}</span>}
                <h3 className="font-bold text-lg mt-1 mb-1">{post.title}</h3>
                {showExcerpt && post.excerpt && <p className={`text-sm ${cardSubtext}`}>{post.excerpt}</p>}
                <div className={`flex items-center gap-3 text-xs mt-2 ${cardSubtext}`}>
                  {showDate && post.date && <time>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time>}
                  {showAuthor && post.author && <span>· {post.author}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {layout === "featured" && (
        <div className="space-y-8">
          {posts[0] && (
            <article className={`${cardBg} border ${cardBorder} rounded-xl overflow-hidden md:flex`}>
              <div className="md:w-1/2 h-64 md:h-auto bg-gradient-to-br from-[var(--tpl-primary)]/20 to-[var(--tpl-secondary)]/20 flex items-center justify-center">
                {posts[0].image ? <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover" /> : <span className="text-6xl opacity-30">📝</span>}
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-center">
                {posts[0].category && <span className="text-xs font-medium text-[var(--tpl-primary)] uppercase tracking-wider">{posts[0].category}</span>}
                <h3 className="font-bold text-2xl mt-2 mb-3">{posts[0].title}</h3>
                {showExcerpt && posts[0].excerpt && <p className={`${cardSubtext} mb-4`}>{posts[0].excerpt}</p>}
                <div className={`flex items-center gap-3 text-sm ${cardSubtext}`}>
                  {showDate && posts[0].date && <time>{new Date(posts[0].date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>}
                  {showAuthor && posts[0].author && <span>· {posts[0].author}</span>}
                </div>
              </div>
            </article>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.slice(1).map((post, i) => (
              <article key={i} className={`${cardBg} border ${cardBorder} rounded-xl p-6 hover:shadow-md transition-shadow`}>
                {post.category && <span className="text-xs font-medium text-[var(--tpl-primary)] uppercase tracking-wider">{post.category}</span>}
                <h3 className="font-bold mt-2 mb-2">{post.title}</h3>
                {showExcerpt && post.excerpt && <p className={`text-sm ${cardSubtext}`}>{post.excerpt}</p>}
              </article>
            ))}
          </div>
        </div>
      )}

      {layout === "masonry" && (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {posts.map((post, i) => (
            <article key={i} className={`break-inside-avoid ${cardBg} border ${cardBorder} rounded-xl overflow-hidden`}>
              <div className="h-40 bg-gradient-to-br from-[var(--tpl-primary)]/20 to-[var(--tpl-secondary)]/20 flex items-center justify-center">
                {post.image ? <img src={post.image} alt={post.title} className="w-full h-full object-cover" /> : <span className="text-3xl opacity-30">📝</span>}
              </div>
              <div className="p-5">
                {post.category && <span className="text-xs font-medium text-[var(--tpl-primary)] uppercase tracking-wider">{post.category}</span>}
                <h3 className="font-bold mt-1 mb-2">{post.title}</h3>
                {showExcerpt && post.excerpt && <p className={`text-sm ${cardSubtext}`}>{post.excerpt}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
