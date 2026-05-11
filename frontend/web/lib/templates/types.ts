export interface Store {
  id: string;
  name: string;
  ownerId: string;
  templateId: string;
  description?: string;
  logo?: string;
  banner?: string;
  theme: StoreTheme;
  settings: StoreSettings;
  createdAt: Date;
}

export interface StoreTheme {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export interface StoreSettings {
  heroImage?: string;
  heroHeadline?: string;
  heroSubtext?: string;
  footerText?: string;
  currency?: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  stock: number;
  status: 'active' | 'draft' | 'archived';
  variants: ProductVariant[];
  createdAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  stock?: number;
}

export interface TemplateConfig {
  id: string;
  name: string;
  thumbnail: string;
  description?: string;
}

export interface CartItem {
  productId: string;
  variantName?: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: Date;
}