/**
 * Shared types for the native React storefront.
 *
 * These types are intentionally trimmed down vs. the raw Prisma types — the
 * storefront only needs a small slice of fields to render. Server components
 * call `loadStorefront()` and pass these objects to template renderers.
 */

export interface StorefrontStore {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  customDomain: string | null;
  description: string | null;
  logo: string | null;
  banner: string | null;
  templateId: string | null;
  theme: StoreTheme;
  settings: StoreSettings;
}

export interface StoreTheme {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  mutedColor?: string;
  fontFamilyHeading?: string;
  fontFamilyBody?: string;
  cornerRadius?: "none" | "small" | "medium" | "large";
}

export interface StoreSettings {
  brand?: {
    storeName?: string;
    tagline?: string;
    logo?: string;
    favicon?: string;
  };
  hero?: {
    headline?: string;
    subtext?: string;
    image?: string;
    mobileImage?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
  announcement?: {
    enabled?: boolean;
    message?: string;
    linkText?: string;
    linkUrl?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  delivery?: {
    freeDeliveryThreshold?: number;
    defaultDeliveryCharge?: number;
    deliveryPromise?: string;
  };
  social?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    whatsapp?: string;
  };
  checkout?: {
    enableCOD?: boolean;
    enableBkash?: boolean;
    enableNagad?: boolean;
    enableRocket?: boolean;
    requireEmail?: boolean;
    orderNotes?: boolean;
  };
  currency?: string;
  customDomain?: string;
  // Anything else stays available via index signature.
  [key: string]: unknown;
}

export interface StorefrontProduct {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  images: string[];
  stock: number;
  status: string;
  featured: boolean;
  category: string | null;
  colors: string[];
  tags: string[];
}

export interface StorefrontData {
  store: StorefrontStore;
  products: StorefrontProduct[];
  featured: StorefrontProduct[];
  categories: string[];
}

/** A single line item in the customer's cart. Persisted in localStorage. */
export interface CartLineItem {
  productId: string;
  storeId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  variantName?: string;
}

/** What we send to /api/stores/:storeId/orders when placing an order. */
export interface CheckoutPayload {
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  shippingAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    city: string;
    district: string;
    postalCode?: string;
    country?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  paymentMethod: "cod" | "bkash" | "nagad" | "rocket" | "card";
  notes?: string;
}
