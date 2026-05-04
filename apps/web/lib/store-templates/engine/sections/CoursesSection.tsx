"use client"

import type { CoursesSectionProps, TemplateConfig, SectionThemeOverride } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface CoursesSectionFullProps {
  props: CoursesSectionProps
  config: TemplateConfig
}

type CourseItem = { title: string; description?: string; image?: string; price?: string; duration?: string; level?: string; instructor?: string }

const DEMO_COURSES: CourseItem[] = [
  { title: "Web Development Bootcamp", description: "Learn full-stack web development from scratch with hands-on projects", price: "$499", duration: "12 weeks", level: "Beginner", instructor: "Sarah Chen" },
  { title: "Advanced React Patterns", description: "Master advanced React concepts including hooks, context, and performance", price: "$299", duration: "6 weeks", level: "Intermediate", instructor: "Mike Ross" },
  { title: "UI/UX Design Fundamentals", description: "Create beautiful, user-centered designs that drive engagement", price: "$349", duration: "8 weeks", level: "Beginner", instructor: "Emma Liu" },
  { title: "Data Science with Python", description: "Analyze data and build machine learning models with Python", price: "$599", duration: "16 weeks", level: "Intermediate", instructor: "Alex Kim" },
  { title: "Mobile App Development", description: "Build cross-platform mobile apps with React Native", price: "$399", duration: "10 weeks", level: "Intermediate", instructor: "David Park" },
  { title: "Cloud Architecture", description: "Design and deploy scalable cloud solutions on AWS and GCP", price: "$449", duration: "8 weeks", level: "Advanced", instructor: "Lisa Wang" },
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

export function CoursesSection({ props, config }: CoursesSectionFullProps) {
  const theme = useTemplateTheme(config)
  const { layout = "grid", columns = 3, items, title, style = "default" } = props
  const courses: CourseItem[] = (items?.length ? items : DEMO_COURSES) as CourseItem[]
  const themeClasses = getThemeClasses(props.sectionTheme)

  const isLightBg = props.sectionTheme?.background === "primary" || props.sectionTheme?.background === "gradient"
  const cardBg = isLightBg ? "bg-white/10 backdrop-blur-sm" : "bg-[var(--tpl-surface)]"
  const cardBorder = isLightBg ? "border-white/20" : "border-[var(--tpl-border)]"
  const cardSubtext = isLightBg ? "text-white/70" : "text-[var(--tpl-text-secondary)]"
  const colClass = columns === 2 ? "md:grid-cols-2" : columns === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"

  const levelColor: Record<string, string> = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced: "bg-red-100 text-red-700",
  }

  return (
    <section className={`${themeClasses.padding} ${themeClasses.bg} ${themeClasses.text} ${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
      {title && <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>}

      {layout === "grid" && (
        <div className={`grid gap-6 ${colClass}`}>
          {courses.map((course, i) => (
            <div key={i} className={`${cardBg} border ${cardBorder} rounded-xl overflow-hidden hover:shadow-lg transition-shadow group`}>
              <div className="h-44 bg-gradient-to-br from-[var(--tpl-primary)]/20 to-[var(--tpl-secondary)]/20 flex items-center justify-center relative">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl opacity-30">📚</span>
                )}
                {course.level && (
                  <span className={`absolute top-3 right-3 text-[10px] font-semibold px-2 py-1 rounded-full ${levelColor[course.level.toLowerCase()] || "bg-gray-100 text-gray-700"}`}>
                    {course.level}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--tpl-primary)] transition-colors">{course.title}</h3>
                {course.description && <p className={`text-sm ${cardSubtext} mb-3`}>{course.description}</p>}
                <div className={`flex items-center justify-between text-sm ${cardSubtext}`}>
                  <div className="flex items-center gap-3">
                    {course.duration && <span>⏱ {course.duration}</span>}
                    {course.instructor && <span>👤 {course.instructor}</span>}
                  </div>
                  {course.price && <span className="font-bold text-[var(--tpl-primary)]">{course.price}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {layout === "list" && (
        <div className="max-w-3xl mx-auto space-y-4">
          {courses.map((course, i) => (
            <div key={i} className={`${cardBg} border ${cardBorder} rounded-xl p-5 flex items-center gap-5 hover:shadow-md transition-shadow`}>
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-[var(--tpl-primary)]/20 to-[var(--tpl-secondary)]/20 flex items-center justify-center">
                {course.image ? <img src={course.image} alt={course.title} className="w-full h-full object-cover rounded-lg" /> : <span className="text-2xl opacity-30">📚</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold truncate">{course.title}</h3>
                  {course.level && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${levelColor[course.level.toLowerCase()] || "bg-gray-100 text-gray-700"}`}>{course.level}</span>}
                </div>
                {course.description && <p className={`text-sm ${cardSubtext} truncate`}>{course.description}</p>}
                <div className={`flex items-center gap-3 text-xs mt-1 ${cardSubtext}`}>
                  {course.duration && <span>⏱ {course.duration}</span>}
                  {course.instructor && <span>👤 {course.instructor}</span>}
                </div>
              </div>
              {course.price && <span className="font-bold text-[var(--tpl-primary)] whitespace-nowrap">{course.price}</span>}
            </div>
          ))}
        </div>
      )}

      {layout === "cards" && (
        <div className={`grid gap-8 ${colClass}`}>
          {courses.map((course, i) => (
            <div key={i} className={`${cardBg} border ${cardBorder} rounded-2xl p-6 hover:-translate-y-1 transition-transform ${style === "minimal" ? "border-0 shadow-sm" : style === "detailed" ? "shadow-md" : ""}`}>
              <div className="flex items-center justify-between mb-4">
                {course.level && <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${levelColor[course.level.toLowerCase()] || "bg-gray-100 text-gray-700"}`}>{course.level}</span>}
                {course.duration && <span className={`text-xs ${cardSubtext}`}>{course.duration}</span>}
              </div>
              <h3 className="font-bold text-lg mb-2">{course.title}</h3>
              {course.description && <p className={`text-sm ${cardSubtext} mb-4`}>{course.description}</p>}
              {style === "detailed" && course.instructor && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--tpl-primary)]/10 flex items-center justify-center text-[var(--tpl-primary)] text-xs font-bold">
                    {course.instructor.charAt(0)}
                  </div>
                  <span className={`text-sm ${cardSubtext}`}>{course.instructor}</span>
                </div>
              )}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--tpl-border)]">
                {course.price && <span className="font-bold text-[var(--tpl-primary)] text-lg">{course.price}</span>}
                <button className="bg-[var(--tpl-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
