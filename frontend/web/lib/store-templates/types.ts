import { ReactNode } from 'react'

export type TemplateId = 'default' | 'roseo' | 'shopify' | 'food' | 'electronics' | 'jewelry' | 'restaurant' | 'clothing' | 'grocery' | 'pharmacy'

export interface StoreTemplate {
  id: TemplateId
  name: string
  description: string
  previewImage?: string
  isPremium: boolean
  components: {
    Navbar?: React.ComponentType<NavbarProps>
    HeroSection?: React.ComponentType<HeroSectionProps>
    ProductGrid?: React.ComponentType<ProductGridProps>
    ProductCard?: React.ComponentType<ProductCardProps>
    Features?: React.ComponentType<FeaturesProps>
    CartDrawer?: React.ComponentType<CartDrawerProps>
    QuickViewModal?: React.ComponentType<QuickViewModalProps>
    AnnouncementBar?: React.ComponentType<AnnouncementBarProps>
    Footer?: React.ComponentType<FooterProps>
  }
}

export interface NavbarProps {
  storeName: string
  cartCount: number
  onCartClick: () => void
}

export interface HeroSectionProps {
  title: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  backgroundImage?: string
}

export interface ProductGridProps {
  products: Array<{
    id: string
    name: string
    price: number
    image: string
    description?: string
    category?: string
  }>
  onAddToCart: (product: { id: string; name: string; price: number; image: string }) => void
  onViewProduct: (product: { id: string; name: string; price: number; image: string; description?: string }) => void
}

export interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    image: string
    description?: string
    category?: string
  }
  onAddToCart: () => void
  onViewProduct: () => void
}

export interface FeaturesProps {
  features?: Array<{
    title: string
    description: string
    icon?: string
  }>
}

export interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }>
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  onCheckout: () => void
}

export interface QuickViewModalProps {
  product?: {
    id: string
    name: string
    price: number
    image: string
    description?: string
  }
  isOpen: boolean
  onClose: () => void
  onAddToCart: () => void
}

export interface AnnouncementBarProps {
  message?: string
}

export interface FilterTabsProps {
  activeFilter: string
  setActiveFilter: (filter: string) => void
}

export interface FooterProps {
  storeName: string
  links?: Array<{ label: string; href: string }>
  socialLinks?: Array<{ platform: string; href: string }>
}

export interface StoreTemplateProps {
  store: {
    id: string
    name: string
    slug: string
    subdomain: string
    description: string | null
    logo: string | null
    banner: string | null
    theme: StoreTheme
    settings: StoreSettings
    products: StoreProduct[]
    collections: StoreCollection[]
  }
  path: string[]
}

export interface StoreTheme {
  templateId: string
  primaryColor: string
  secondaryColor: string
  fontHeading?: string
  fontBody?: string
  customization?: Record<string, any>
}

export interface StoreSettings {
  whatsapp?: string
  phone?: string
  address?: string
  hours?: string
  currency?: string
  [key: string]: any
}

export interface StoreProductReview {
  id: string
  rating: number
  title: string | null
  comment: string | null
  userName: string
  createdAt: string
}

export interface StoreProduct {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  images: string[]
  featured: boolean
  status: string
  collectionIds: string[]
  attributes?: Record<string, any>
  reviews?: StoreProductReview[]
  averageRating?: number
  reviewCount?: number
}

export interface StoreCollection {
  id: string
  name: string
  slug: string
  image: string | null
}