import dynamic from 'next/dynamic';
import type { StoreTemplateProps } from './types';

// Template component map — dynamically imported for code splitting
const templateComponents: Record<string, React.ComponentType<StoreTemplateProps>> = {
  default: dynamic(() => import('./default/DefaultStoreFront')),
  roseo: dynamic(() => import('./roseo/RoseoStoreFront')),
  shopify: dynamic(() => import('./shopify/MinimalStoreFront')),
  shopnest: dynamic(() => import('./shopnest/ShopnestStoreFront')),
  food: dynamic(() => import('./food/FoodStoreFront')),
  electro: dynamic(() => import('./electro/ElectroStoreFront')),
  boutique: dynamic(() => import('./boutique/BoutiqueStoreFront')),
  grocer: dynamic(() => import('./grocer/GrocerStoreFront')),
  // Bangladesh-specific config-driven templates
  salon: dynamic(() => import('./engine/ConfigSampleTemplates').then(mod => ({ default: mod.SalonTemplate }))),
  tuition: dynamic(() => import('./engine/ConfigSampleTemplates').then(mod => ({ default: mod.TuitionTemplate }))),
  clinic: dynamic(() => import('./engine/ConfigSampleTemplates').then(mod => ({ default: mod.ClinicTemplate }))),
  pharmacy: dynamic(() => import('./engine/ConfigSampleTemplates').then(mod => ({ default: mod.PharmacyTemplate }))),
  corporate: dynamic(() => import('./engine/ConfigSampleTemplates').then(mod => ({ default: mod.CorporateTemplate }))),
  portfolio: dynamic(() => import('./engine/ConfigSampleTemplates').then(mod => ({ default: mod.PortfolioTemplate }))),
};

// Set of built-in template IDs for fast lookup
const builtInTemplateIds = new Set(Object.keys(templateComponents));

// Template metadata for landing page, store creation, and settings
export interface TemplateInfo {
  id: string
  name: string
  tagline: string
  description: string
  color: string // gradient class
  features: string[]
  isPremium: boolean
  price: number // BDT, 0 = free
  defaultColors: {
    primary: string
    secondary: string
    accent: string
  }
}

export const templateList: TemplateInfo[] = [
  {
    id: 'roseo',
    name: 'Roseo',
    tagline: 'Premium & Luxurious',
    description: 'Dark, elegant design for leather goods, fashion, and premium products',
    color: 'from-stone-900 to-amber-900',
    features: ['Dark luxury aesthetic', 'Product quick view', 'Wishlist & cart', 'Customer reviews'],
    isPremium: false,
    price: 0,
    defaultColors: {
      primary: '#1a1a1a',
      secondary: '#D4A574',
      accent: '#8B4513',
    },
  },
  {
    id: 'default',
    name: 'Modern Shop',
    tagline: 'Clean & Professional',
    description: 'Bright, modern layout perfect for any type of product store',
    color: 'from-emerald-600 to-teal-700',
    features: ['Clean product grid', 'Collection filters', 'Fast checkout', 'Mobile-first'],
    isPremium: false,
    price: 0,
    defaultColors: {
      primary: '#006A4E',
      secondary: '#F42A41',
      accent: '#059669',
    },
  },
  {
    id: 'shopify',
    name: 'Minimal',
    tagline: 'Simple & Fast',
    description: 'Minimalist design focused on speed and conversion for any store',
    color: 'from-blue-600 to-indigo-700',
    features: ['Ultra-fast loading', 'One-page checkout', 'Smart search', 'Inventory alerts'],
    isPremium: false,
    price: 0,
    defaultColors: {
      primary: '#1e40af',
      secondary: '#6366f1',
      accent: '#3b82f6',
    },
  },
  {
    id: 'shopnest',
    name: 'Shopnest',
    tagline: 'Premium Fashion',
    description: 'Elegant fashion store with soft colors, hover effects, and a luxurious shopping experience',
    color: 'from-amber-200 to-amber-400',
    features: ['Premium fashion aesthetic', 'Image hover reveal', 'Wishlist & quick add', 'Smooth animations'],
    isPremium: true,
    price: 499,
    defaultColors: {
      primary: '#1a1a1a',
      secondary: '#be9f7e',
      accent: '#f8f6f3',
    },
  },
  {
    id: 'food',
    name: 'Food & Restaurant',
    tagline: 'Tasty & Fast',
    description: 'Vibrant food and restaurant template with online ordering, delivery info, and a mouth-watering design',
    color: 'from-orange-500 to-red-500',
    features: ['Online ordering', 'Delivery tracking', 'Menu categories', 'WhatsApp ordering'],
    isPremium: false,
    price: 0,
    defaultColors: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#fff7ed',
    },
  },
  {
    id: 'electro',
    name: 'Electro',
    tagline: 'Tech & Gadgets',
    description: 'Dark, futuristic electronics template with spec-driven product cards, flash deals, and a neon-accented design',
    color: 'from-gray-900 to-cyan-600',
    features: ['Spec-driven cards', 'Flash sale hero', 'Category icon bar', 'Dark tech theme'],
    isPremium: false,
    price: 0,
    defaultColors: {
      primary: '#0a0a0a',
      secondary: '#00d4ff',
      accent: '#0ea5e9',
    },
  },
  {
    id: 'boutique',
    name: 'Boutique',
    tagline: 'Elegant Fashion',
    description: 'Soft, editorial fashion template with lookbook-style product display, blush tones, and a luxurious shopping experience',
    color: 'from-rose-400 to-pink-600',
    features: ['Editorial lookbook', 'Quick add overlay', 'Blush & rose tones', 'Curated collections'],
    isPremium: true,
    price: 499,
    defaultColors: {
      primary: '#881337',
      secondary: '#f9a8d4',
      accent: '#fdf2f8',
    },
  },
  {
    id: 'grocer',
    name: 'Grocer',
    tagline: 'Fresh & Organic',
    description: 'Fresh grocery template with category-driven navigation, bulk pricing, freshness badges, and same-day delivery focus',
    color: 'from-green-500 to-emerald-600',
    features: ['Category navigation', 'Freshness badges', 'Same-day delivery', 'Bulk pricing'],
    isPremium: false,
    price: 0,
    defaultColors: {
      primary: '#16a34a',
      secondary: '#eab308',
      accent: '#fefce8',
    },
  },
  {
    id: 'salon',
    name: 'Salon & Beauty',
    tagline: 'Glamour & Style',
    description: 'Elegant salon and beauty template with service booking, stylist profiles, and a luxurious rose-gold aesthetic',
    color: 'from-rose-400 to-pink-600',
    features: ['Service booking', 'Stylist profiles', 'Gallery showcase', 'Appointment CTA'],
    isPremium: false,
    price: 0,
    defaultColors: {
      primary: '#be185d',
      secondary: '#f9a8d4',
      accent: '#fdf2f8',
    },
  },
  {
    id: 'tuition',
    name: 'Tuition & Education',
    tagline: 'Learn & Grow',
    description: 'Professional education template with course listings, tutor profiles, stats, and a clean academic design',
    color: 'from-blue-500 to-indigo-600',
    features: ['Course listings', 'Tutor profiles', 'Success stats', 'Enrollment CTA'],
    isPremium: false,
    price: 0,
    defaultColors: {
      primary: '#1d4ed8',
      secondary: '#60a5fa',
      accent: '#eff6ff',
    },
  },
  {
    id: 'clinic',
    name: 'Clinic & Healthcare',
    tagline: 'Care & Compassion',
    description: 'Trustworthy healthcare template with doctor profiles, services, testimonials, and a calming green aesthetic',
    color: 'from-emerald-500 to-teal-600',
    features: ['Doctor profiles', 'Service listings', 'Patient testimonials', 'Appointment booking'],
    isPremium: false,
    price: 0,
    defaultColors: {
      primary: '#059669',
      secondary: '#6ee7b7',
      accent: '#ecfdf5',
    },
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy & Wellness',
    tagline: 'Health & Healing',
    description: 'Clean pharmacy template with product categories, health tips, trust badges, and a professional teal design',
    color: 'from-teal-500 to-cyan-600',
    features: ['Product categories', 'Health tips', 'Trust badges', 'Prescription upload'],
    isPremium: false,
    price: 0,
    defaultColors: {
      primary: '#0d9488',
      secondary: '#5eead4',
      accent: '#f0fdfa',
    },
  },
  {
    id: 'corporate',
    name: 'Corporate & Business',
    tagline: 'Professional & Bold',
    description: 'Bold corporate template with team profiles, stats, timeline, and a strong navy-blue professional aesthetic',
    color: 'from-slate-700 to-blue-900',
    features: ['Team profiles', 'Company stats', 'Timeline section', 'Contact CTA'],
    isPremium: true,
    price: 999,
    defaultColors: {
      primary: '#1e3a5f',
      secondary: '#3b82f6',
      accent: '#eff6ff',
    },
  },
  {
    id: 'portfolio',
    name: 'Portfolio & Creative',
    tagline: 'Showcase & Inspire',
    description: 'Creative portfolio template with project showcase, skills, testimonials, and a minimalist dark aesthetic',
    color: 'from-gray-800 to-violet-700',
    features: ['Project showcase', 'Skills section', 'Client testimonials', 'Contact form'],
    isPremium: false,
    price: 0,
    defaultColors: {
      primary: '#7c3aed',
      secondary: '#a78bfa',
      accent: '#f5f3ff',
    },
  },
];

export function getStoreTemplate(templateId: string) {
  return templateComponents[templateId] || templateComponents.default;
}

export function getTemplateInfo(templateId: string): TemplateInfo | undefined {
  return templateList.find(t => t.id === templateId);
}

/**
 * Check if a template ID refers to a built-in React component template.
 * Custom/uploaded templates (stored in DB) will return false.
 */
export function isBuiltInTemplate(templateId: string): boolean {
  return builtInTemplateIds.has(templateId);
}

/**
 * Get the list of all built-in template IDs.
 */
export function getBuiltInTemplateIds(): string[] {
  return Object.keys(templateComponents);
}
