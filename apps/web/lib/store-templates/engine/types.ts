// ─── Template Config Types ───
// These define the JSON schema for uploaded/config-driven templates

export interface TemplateConfig {
  id: string
  name: string
  tagline: string
  description: string
  version: string
  category: TemplateCategory
  websiteType?: string
  isPremium: boolean

  colors: TemplateColors
  typography: TemplateTypography
  layout: TemplateLayout

  navbar: TemplateNavbarConfig
  footer: TemplateFooterConfig

  homePage: {
    sections: HomeSectionConfig[]
  }

  productPage?: TemplateProductPageConfig
  collectionPage?: TemplateCollectionPageConfig

  customCss?: string
}

export type TemplateCategory =
  | 'general'
  | 'fashion'
  | 'food'
  | 'electronics'
  | 'salon'
  | 'portfolio'
  | 'grocery'
  | 'pharmacy'
  | 'clinic'
  | 'tuition'
  | 'corporate'

export interface TemplateColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textMuted: string
  border: string
  success: string
  error: string
}

export interface TemplateTypography {
  headingFont: string
  bodyFont: string
  headingWeight: string
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export interface TemplateLayout {
  maxWidth: string
  sectionSpacing: 'compact' | 'normal' | 'spacious'
  cardStyle: 'flat' | 'bordered' | 'shadowed' | 'elevated'
  productColumns: 2 | 3 | 4
  pageLayout?: 'fullwidth' | 'sidebar-left' | 'sidebar-right' | 'boxed' | 'magazine'
  contentWidth?: 'narrow' | 'normal' | 'wide' | 'full'
}

export interface TemplateNavbarConfig {
  style: 'sticky-white' | 'sticky-blur' | 'sticky-dark' | 'transparent' | 'centered-logo' | 'minimal'
  showSearch: boolean
  showWishlist: boolean
  showUserMenu: boolean
  layout: 'centered' | 'left-aligned'
  announcementBar?: {
    message: string
    bgColor?: string
    textColor?: string
  }
}

export interface TemplateFooterConfig {
  style: 'dark' | 'light' | 'minimal' | 'centered' | 'expanded' | 'newsletter-focus'
  showNewsletter: boolean
  showSocial: boolean
  columns: 2 | 3 | 4
}

// ─── Per-Section Theme Override ───

export interface SectionThemeOverride {
  background?: 'default' | 'dark' | 'light' | 'primary' | 'gradient' | 'surface' | 'secondary'
  textColor?: 'default' | 'light' | 'dark'
  padding?: 'compact' | 'normal' | 'spacious' | 'none'
}

// ─── Home Page Section Types ───

export type HomeSectionConfig =
  // Ecommerce sections
  | { type: 'announcement'; props: AnnouncementSectionProps }
  | { type: 'hero'; props: HeroSectionProps }
  | { type: 'collections'; props: CollectionsSectionProps }
  | { type: 'featuredProducts'; props: FeaturedProductsSectionProps }
  | { type: 'features'; props: FeaturesSectionProps }
  | { type: 'products'; props: ProductsSectionProps }
  | { type: 'testimonials'; props: TestimonialsSectionProps }
  | { type: 'newsletter'; props: NewsletterSectionProps }
  | { type: 'recentlyViewed'; props: RecentlyViewedSectionProps }
  | { type: 'stats'; props: StatsSectionProps }
  | { type: 'cta'; props: CtaSectionProps }
  | { type: 'spacer'; props: SpacerSectionProps }
  | { type: 'banner'; props: BannerSectionProps }
  | { type: 'brandLogos'; props: BrandLogosSectionProps }
  | { type: 'countdown'; props: CountdownSectionProps }
  | { type: 'faq'; props: FaqSectionProps }
  | { type: 'team'; props: TeamSectionProps }
  | { type: 'pricing'; props: PricingSectionProps }
  | { type: 'timeline'; props: TimelineSectionProps }
  | { type: 'categories'; props: CategoriesSectionProps }
  // Portfolio sections
  | { type: 'projects'; props: ProjectsSectionProps }
  | { type: 'gallery'; props: GallerySectionProps }
  | { type: 'skills'; props: SkillsSectionProps }
  | { type: 'experience'; props: ExperienceSectionProps }
  | { type: 'contact'; props: ContactSectionProps }
  // Corporate sections
  | { type: 'about'; props: AboutSectionProps }
  | { type: 'services'; props: ServicesSectionProps }
  | { type: 'clients'; props: ClientsSectionProps }
  | { type: 'partners'; props: PartnersSectionProps }
  | { type: 'mission'; props: MissionSectionProps }
  // Blog sections
  | { type: 'blogPosts'; props: BlogPostsSectionProps }
  | { type: 'featuredPost'; props: FeaturedPostSectionProps }
  // Restaurant sections
  | { type: 'menu'; props: MenuSectionProps }
  | { type: 'hours'; props: HoursSectionProps }
  | { type: 'reservation'; props: ReservationSectionProps }
  // Education sections
  | { type: 'courses'; props: CoursesSectionProps }

// ─── Ecommerce Section Props ───

export interface AnnouncementSectionProps {
  message: string
  bgColor?: string
  textColor?: string
  sectionTheme?: SectionThemeOverride
}

export interface HeroSectionProps {
  style: 'centered' | 'split' | 'fullwidth' | 'minimal' | 'video' | 'parallax' | 'magazine'
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  showStats?: boolean
  stats?: { label: string; value: string }[]
  showFeatures?: boolean
  features?: FeatureItem[]
  backgroundImage?: boolean
  overlay?: boolean
  minHeight?: string
  sectionTheme?: SectionThemeOverride
}

export interface CollectionsSectionProps {
  layout: 'grid' | 'carousel' | 'list' | 'cards' | 'icons'
  columns?: number
  showAll?: boolean
  title?: string
  limit?: number
  sectionTheme?: SectionThemeOverride
}

export interface FeaturedProductsSectionProps {
  layout: 'grid' | 'carousel'
  columns?: number
  limit: number
  title?: string
  showQuickAdd?: boolean
  sectionTheme?: SectionThemeOverride
}

export interface FeaturesSectionProps {
  layout: 'grid' | 'cards' | 'icons'
  items: FeatureItem[]
  style?: 'default' | 'colored' | 'minimal'
  sectionTheme?: SectionThemeOverride
}

export interface ProductsSectionProps {
  layout: 'grid' | 'carousel' | 'list'
  columns: number
  showFilters: boolean
  showSearch: boolean
  title?: string
  sectionTheme?: SectionThemeOverride
}

export interface TestimonialsSectionProps {
  style: 'cards' | 'carousel' | 'minimal'
  limit?: number
  sectionTheme?: SectionThemeOverride
}

export interface NewsletterSectionProps {
  title: string
  subtitle: string
  style: 'inline' | 'card' | 'fullwidth'
  sectionTheme?: SectionThemeOverride
}

export interface RecentlyViewedSectionProps {
  title?: string
  sectionTheme?: SectionThemeOverride
}

export interface StatsSectionProps {
  items: { label: string; value: string }[]
  style?: 'simple' | 'animated'
  sectionTheme?: SectionThemeOverride
}

export interface CtaSectionProps {
  title: string
  subtitle?: string
  buttonText: string
  buttonLink?: string
  style: 'centered' | 'split' | 'banner'
  sectionTheme?: SectionThemeOverride
}

export interface SpacerSectionProps {
  height: 'sm' | 'md' | 'lg'
}

// ─── Extended Ecommerce Section Props ───

export interface BannerSectionProps {
  title: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  backgroundImage?: string
  overlay?: boolean
  bgColor?: string
  textColor?: 'dark' | 'light'
  height: 'sm' | 'md' | 'lg' | 'full'
  alignment: 'left' | 'center' | 'right'
  sectionTheme?: SectionThemeOverride
}

export interface BrandLogosSectionProps {
  title?: string
  items: { name: string; logo?: string }[]
  layout: 'carousel' | 'grid'
  grayscale?: boolean
  sectionTheme?: SectionThemeOverride
}

export interface CountdownSectionProps {
  title: string
  subtitle?: string
  targetDate: string // ISO date string
  style: 'cards' | 'inline' | 'flip'
  endedMessage?: string
  sectionTheme?: SectionThemeOverride
}

export interface FaqSectionProps {
  title?: string
  items: { question: string; answer: string }[]
  style?: 'accordion' | 'bordered'
  sectionTheme?: SectionThemeOverride
}

export interface TeamSectionProps {
  title?: string
  members: { name: string; role: string; image?: string; bio?: string; social?: { platform: string; url: string }[] }[]
  columns: 2 | 3 | 4
  style?: 'cards' | 'minimal' | 'overlay'
  sectionTheme?: SectionThemeOverride
}

export interface PricingSectionProps {
  title?: string
  plans: { name: string; price: string; period?: string; features: string[]; ctaText?: string; ctaLink?: string; highlighted?: boolean }[]
  columns?: 2 | 3 | 4
  style?: 'cards' | 'table' | 'minimal'
  sectionTheme?: SectionThemeOverride
}

export interface TimelineSectionProps {
  title?: string
  steps: { title: string; description: string; icon?: string }[]
  style: 'vertical' | 'horizontal' | 'zigzag'
  sectionTheme?: SectionThemeOverride
}

export interface CategoriesSectionProps {
  title?: string
  items: { name: string; image?: string; icon?: string; description?: string }[]
  columns: 2 | 3 | 4 | 5 | 6
  style: 'cards' | 'icons' | 'grid' | 'overlay'
  sectionTheme?: SectionThemeOverride
}

// ─── Portfolio Section Props ───

export interface ProjectsSectionProps {
  title?: string
  layout: 'grid' | 'masonry' | 'carousel' | 'list'
  columns?: 2 | 3 | 4
  showFilters?: boolean
  items?: { title: string; description?: string; image?: string; category?: string; link?: string }[]
  style?: 'cards' | 'overlay' | 'minimal'
  sectionTheme?: SectionThemeOverride
}

export interface GallerySectionProps {
  title?: string
  layout: 'grid' | 'masonry' | 'lightbox' | 'carousel'
  columns?: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  items?: { src?: string; alt?: string; caption?: string }[]
  sectionTheme?: SectionThemeOverride
}

export interface SkillsSectionProps {
  title?: string
  layout: 'bars' | 'tags' | 'cards' | 'grid'
  items?: { name: string; level?: number; icon?: string; category?: string }[]
  sectionTheme?: SectionThemeOverride
}

export interface ExperienceSectionProps {
  title?: string
  layout: 'timeline' | 'cards' | 'compact'
  items?: { title: string; company?: string; period?: string; description?: string }[]
  sectionTheme?: SectionThemeOverride
}

export interface ContactSectionProps {
  layout: 'split' | 'centered' | 'minimal'
  showMap?: boolean
  showForm?: boolean
  title?: string
  subtitle?: string
  email?: string
  phone?: string
  address?: string
  sectionTheme?: SectionThemeOverride
}

// ─── Corporate Section Props ───

export interface AboutSectionProps {
  layout: 'split' | 'centered' | 'image-left' | 'image-right'
  title?: string
  description?: string
  image?: string
  highlights?: { label: string; value: string }[]
  sectionTheme?: SectionThemeOverride
}

export interface ServicesSectionProps {
  layout: 'grid' | 'cards' | 'icons' | 'list'
  columns?: 2 | 3 | 4
  items?: { title: string; description?: string; icon?: string; image?: string; link?: string }[]
  title?: string
  style?: 'default' | 'colored' | 'minimal' | 'bordered'
  sectionTheme?: SectionThemeOverride
}

export interface ClientsSectionProps {
  title?: string
  items: { name: string; logo?: string; testimonial?: string }[]
  layout: 'grid' | 'carousel' | 'masonry'
  style?: 'default' | 'minimal' | 'cards'
  sectionTheme?: SectionThemeOverride
}

export interface PartnersSectionProps {
  title?: string
  items: { name: string; logo?: string; url?: string }[]
  layout: 'grid' | 'carousel'
  grayscale?: boolean
  sectionTheme?: SectionThemeOverride
}

export interface MissionSectionProps {
  layout: 'centered' | 'split' | 'cards'
  title?: string
  description?: string
  values?: { title: string; description?: string; icon?: string }[]
  sectionTheme?: SectionThemeOverride
}

// ─── Blog Section Props ───

export interface BlogPostsSectionProps {
  layout: 'grid' | 'list' | 'featured' | 'masonry'
  columns?: 2 | 3
  limit?: number
  title?: string
  showExcerpt?: boolean
  showDate?: boolean
  showAuthor?: boolean
  sectionTheme?: SectionThemeOverride
}

export interface FeaturedPostSectionProps {
  layout: 'hero' | 'split' | 'card'
  title?: string
  sectionTheme?: SectionThemeOverride
}

// ─── Restaurant Section Props ───

export interface MenuSectionProps {
  layout: 'cards' | 'list' | 'tabs' | 'grid'
  categories?: { name: string; items: { name: string; description?: string; price: string; image?: string; badge?: string }[] }[]
  title?: string
  showImages?: boolean
  columns?: 2 | 3 | 4
  sectionTheme?: SectionThemeOverride
}

export interface HoursSectionProps {
  layout: 'table' | 'cards' | 'minimal'
  schedule?: { day: string; hours: string }[]
  title?: string
  sectionTheme?: SectionThemeOverride
}

export interface ReservationSectionProps {
  layout: 'form' | 'split' | 'card'
  title?: string
  subtitle?: string
  showPhone?: boolean
  showEmail?: boolean
  sectionTheme?: SectionThemeOverride
}

// ─── Education Section Props ───

export interface CoursesSectionProps {
  layout: 'grid' | 'list' | 'cards'
  columns?: 2 | 3 | 4
  items?: { title: string; description?: string; image?: string; price?: string; duration?: string; level?: string; instructor?: string }[]
  title?: string
  style?: 'default' | 'minimal' | 'detailed'
  sectionTheme?: SectionThemeOverride
}

// ─── Shared Types ───

export interface FeatureItem {
  icon: string
  title: string
  description: string
}

export interface TemplateProductPageConfig {
  imageLayout: 'stacked' | 'grid' | 'sidebar'
  showReviews: boolean
  showRecentlyViewed: boolean
  showRelatedProducts: boolean
  showWishlist: boolean
  showFeatures: boolean
  features?: FeatureItem[]
}

export interface TemplateCollectionPageConfig {
  showFilters: boolean
  gridColumns: 2 | 3 | 4
  cardStyle: 'standard' | 'overlay' | 'minimal'
}

// ─── Template DB Record (from Prisma) ───

export interface TemplateRecord {
  id: string
  name: string
  slug: string
  description: string | null
  thumbnail: string | null
  config: TemplateConfig
  category: string
  isPremium: boolean
  isPublic: boolean
  isBuiltIn: boolean
  uploadedBy: string | null
  downloads: number
  version: string
  createdAt: string
  updatedAt: string
}

// ─── Validation ───

export const REQUIRED_COLOR_KEYS: (keyof TemplateColors)[] = [
  'primary', 'secondary', 'accent', 'background', 'surface',
  'text', 'textMuted', 'border', 'success', 'error',
]

export const VALID_SECTION_TYPES = [
  // Ecommerce
  'announcement', 'hero', 'collections', 'featuredProducts',
  'features', 'products', 'testimonials', 'newsletter',
  'recentlyViewed', 'stats', 'cta', 'spacer',
  'banner', 'brandLogos', 'countdown', 'faq',
  'team', 'pricing', 'timeline', 'categories',
  // Portfolio
  'projects', 'gallery', 'skills', 'experience', 'contact',
  // Corporate
  'about', 'services', 'clients', 'partners', 'mission',
  // Blog
  'blogPosts', 'featuredPost',
  // Restaurant
  'menu', 'hours', 'reservation',
  // Education
  'courses',
] as const

export const VALID_CATEGORIES: TemplateCategory[] = [
  'general', 'fashion', 'food', 'electronics', 'salon',
  'portfolio', 'grocery', 'pharmacy', 'clinic', 'tuition', 'corporate',
]

export function validateTemplateConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ['Config must be an object'] }
  }

  // Required string fields
  const requiredStrings = ['id', 'name', 'tagline', 'description', 'version']
  for (const key of requiredStrings) {
    if (!config[key] || typeof config[key] !== 'string') {
      errors.push(`Missing required string: ${key}`)
    }
  }

  // Category
  if (!VALID_CATEGORIES.includes(config.category)) {
    errors.push(`Invalid category: ${config.category}. Must be one of: ${VALID_CATEGORIES.join(', ')}`)
  }

  // Colors
  if (!config.colors || typeof config.colors !== 'object') {
    errors.push('Missing colors object')
  } else {
    for (const key of REQUIRED_COLOR_KEYS) {
      if (!config.colors[key] || typeof config.colors[key] !== 'string') {
        errors.push(`Missing color: ${key}`)
      }
    }
  }

  // Typography
  if (!config.typography || typeof config.typography !== 'object') {
    errors.push('Missing typography object')
  }

  // Layout
  if (!config.layout || typeof config.layout !== 'object') {
    errors.push('Missing layout object')
  }

  // Navbar
  if (!config.navbar || typeof config.navbar !== 'object') {
    errors.push('Missing navbar config')
  }

  // Footer
  if (!config.footer || typeof config.footer !== 'object') {
    errors.push('Missing footer config')
  }

  // Home page sections
  if (!config.homePage?.sections || !Array.isArray(config.homePage?.sections)) {
    errors.push('Missing homePage.sections array')
  } else {
    config.homePage.sections.forEach((section: any, i: number) => {
      if (!VALID_SECTION_TYPES.includes(section.type)) {
        errors.push(`Invalid section type at index ${i}: ${section.type}`)
      }
    })
  }

  // Product page (optional for non-ecommerce)
  if (config.websiteType === 'ecommerce' && (!config.productPage || typeof config.productPage !== 'object')) {
    errors.push('Missing productPage config for ecommerce website')
  }

  // Collection page (optional for non-ecommerce)
  if (config.websiteType === 'ecommerce' && (!config.collectionPage || typeof config.collectionPage !== 'object')) {
    errors.push('Missing collectionPage config for ecommerce website')
  }

  // Custom CSS sanitization check
  if (config.customCss && typeof config.customCss === 'string') {
    const dangerous = /javascript:|expression\(|@import|<\/style/i
    if (dangerous.test(config.customCss)) {
      errors.push('Custom CSS contains potentially dangerous code')
    }
  }

  return { valid: errors.length === 0, errors }
}
