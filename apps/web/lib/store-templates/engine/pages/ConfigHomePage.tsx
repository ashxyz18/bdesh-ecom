"use client"

import type { TemplateConfig, HomeSectionConfig } from "../types"
import type { StoreTemplateProps, StoreProduct } from "../../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"
import { AnnouncementSection } from "../sections/AnnouncementSection"
import { HeroSection } from "../sections/HeroSection"
import { CollectionsSection } from "../sections/CollectionsSection"
import { FeaturedProductsSection } from "../sections/FeaturedProductsSection"
import { FeaturesSection } from "../sections/FeaturesSection"
import { ProductsSection } from "../sections/ProductsSection"
import { TestimonialsSection } from "../sections/TestimonialsSection"
import { NewsletterSection } from "../sections/NewsletterSection"
import { RecentlyViewedSection } from "../sections/RecentlyViewedSection"
import { StatsSection } from "../sections/StatsSection"
import { CtaSection } from "../sections/CtaSection"
import { SpacerSection } from "../sections/SpacerSection"
import { BannerSection } from "../sections/BannerSection"
import { BrandLogosSection } from "../sections/BrandLogosSection"
import { CountdownSection } from "../sections/CountdownSection"
import { FaqSection } from "../sections/FaqSection"
import { TeamSection } from "../sections/TeamSection"
import { PricingSection } from "../sections/PricingSection"
import { TimelineSection } from "../sections/TimelineSection"
import { CategoriesSection } from "../sections/CategoriesSection"
// Portfolio sections
import { ProjectsSection } from "../sections/ProjectsSection"
import { GallerySection } from "../sections/GallerySection"
import { SkillsSection } from "../sections/SkillsSection"
import { ExperienceSection } from "../sections/ExperienceSection"
import { ContactSection } from "../sections/ContactSection"
import { AboutSection } from "../sections/AboutSection"
// Corporate sections
import { ServicesSection } from "../sections/ServicesSection"
import { ClientsSection } from "../sections/ClientsSection"
import { PartnersSection } from "../sections/PartnersSection"
import { MissionSection } from "../sections/MissionSection"
// Blog sections
import { BlogPostsSection } from "../sections/BlogPostsSection"
import { FeaturedPostSection } from "../sections/FeaturedPostSection"
// Restaurant sections
import { MenuSection } from "../sections/MenuSection"
import { HoursSection } from "../sections/HoursSection"
import { ReservationSection } from "../sections/ReservationSection"
// Education sections
import { CoursesSection } from "../sections/CoursesSection"
import { SectionErrorBoundary } from "../components/SectionErrorBoundary"

interface ConfigHomePageProps {
  config: TemplateConfig
  store: StoreTemplateProps["store"]
  formatPrice: (price: number) => string
  storeLink: (subpath: string) => string
}

export function ConfigHomePage({ config, store, formatPrice, storeLink }: ConfigHomePageProps) {
  const theme = useTemplateTheme(config)
  const sections = config.homePage.sections

  return (
    <div className="min-h-screen bg-[var(--tpl-bg)]">
      {sections.map((section, i) => (
        <SectionErrorBoundary key={i} sectionType={section.type}>
          <SectionRenderer
            section={section}
            config={config}
            store={store}
            formatPrice={formatPrice}
            storeLink={storeLink}
          />
        </SectionErrorBoundary>
      ))}
    </div>
  )
}

function SectionRenderer({
  section,
  config,
  store,
  formatPrice,
  storeLink,
}: {
  section: HomeSectionConfig
  config: TemplateConfig
  store: StoreTemplateProps["store"]
  formatPrice: (price: number) => string
  storeLink: (subpath: string) => string
}) {
  switch (section.type) {
    // ─── Ecommerce Sections ───
    case "announcement":
      return <AnnouncementSection props={section.props} />
    case "hero":
      return <HeroSection props={section.props} config={config} store={store} />
    case "collections":
      return <CollectionsSection props={section.props} config={config} collections={store.collections} storeLink={storeLink} />
    case "featuredProducts":
      return <FeaturedProductsSection props={section.props} config={config} products={store.products} store={{ id: store.id, subdomain: store.subdomain }} formatPrice={formatPrice} storeLink={storeLink} />
    case "features":
      return <FeaturesSection props={section.props} config={config} />
    case "products":
      return <ProductsSection props={section.props} config={config} products={store.products} collections={store.collections} store={{ id: store.id, subdomain: store.subdomain }} formatPrice={formatPrice} storeLink={storeLink} />
    case "testimonials":
      return <TestimonialsSection props={section.props} config={config} />
    case "newsletter":
      return <NewsletterSection props={section.props} config={config} />
    case "recentlyViewed":
      return <RecentlyViewedSection props={section.props} config={config} products={store.products} storeLink={storeLink} />
    case "stats":
      return <StatsSection props={section.props} config={config} />
    case "cta":
      return <CtaSection props={section.props} config={config} />
    case "spacer":
      return <SpacerSection props={section.props} />
    case "banner":
      return <BannerSection props={section.props} config={config} />
    case "brandLogos":
      return <BrandLogosSection props={section.props} config={config} />
    case "countdown":
      return <CountdownSection props={section.props} config={config} />
    case "faq":
      return <FaqSection props={section.props} config={config} />
    case "team":
      return <TeamSection props={section.props} config={config} />
    case "pricing":
      return <PricingSection props={section.props} config={config} />
    case "timeline":
      return <TimelineSection props={section.props} config={config} />
    case "categories":
      return <CategoriesSection props={section.props} config={config} />

    // ─── Portfolio Sections ───
    case "projects":
      return <ProjectsSection props={section.props} config={config} />
    case "gallery":
      return <GallerySection props={section.props} config={config} />
    case "skills":
      return <SkillsSection props={section.props} config={config} />
    case "experience":
      return <ExperienceSection props={section.props} config={config} />
    case "contact":
      return <ContactSection props={section.props} config={config} />
    case "about":
      return <AboutSection props={section.props} config={config} />

    // ─── Corporate Sections ───
    case "services":
      return <ServicesSection props={section.props} config={config} />
    case "clients":
      return <ClientsSection props={section.props} config={config} />
    case "partners":
      return <PartnersSection props={section.props} config={config} />
    case "mission":
      return <MissionSection props={section.props} config={config} />

    // ─── Blog Sections ───
    case "blogPosts":
      return <BlogPostsSection props={section.props} config={config} />
    case "featuredPost":
      return <FeaturedPostSection props={section.props} config={config} />

    // ─── Restaurant Sections ───
    case "menu":
      return <MenuSection props={section.props} config={config} />
    case "hours":
      return <HoursSection props={section.props} config={config} />
    case "reservation":
      return <ReservationSection props={section.props} config={config} />

    // ─── Education Sections ───
    case "courses":
      return <CoursesSection props={section.props} config={config} />

    default:
      return null
  }
}
