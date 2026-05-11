// In-memory store for demo purposes
// Replace with actual database in production

export type UserRole = "user" | "admin";

export enum ProductStatus {
  Active = "active",
  Draft = "draft",
  Archived = "archived",
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  description?: string;
  logo?: string;
  banner?: string;
  theme: StoreTheme;
  settings: StoreSettings;
  templateId?: string;
  createdAt: Date;
}

export interface StoreTheme {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export interface StoreSettings {
  currency?: string;
  heroImage?: string;
  heroHeadline?: string;
  heroSubtext?: string;
  footerText?: string;
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
  status: "active" | "draft" | "archived";
  variants: ProductVariant[];
  createdAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  stock?: number;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  previewUrl: string;
}

// In-memory storage
export const users: Map<string, User> = new Map();
export const stores: Map<string, Store> = new Map();
export const products: Map<string, Product> = new Map();
export const templates: Map<string, Template> = new Map();

// Seed a default admin account (first-time setup)
const adminId = generateId();
users.set(adminId, {
  id: adminId,
  email: "admin@bdesh.shop",
  password: "admin123",
  name: "Admin",
  role: "admin",
  createdAt: new Date(),
});

// Initialize with demo template
templates.set("koskii", {
  id: "koskii",
  name: "Koskii Ethnic Wear",
  slug: "koskii",
  description: "A beautiful e-commerce template for ethnic wear, fashion boutiques",
  thumbnail: "https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-ranipink-zariwork-puresilk-designer-saree-saus0035699_ranipink_1_1.jpg?v=1721373197",
  previewUrl: "/prebuilt-templates/koskii/index.html",
});

// Helper functions
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function createStore(name: string, ownerId: string, templateId?: string): Store {
  const id = generateId();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const store: Store = {
    id,
    name,
    slug,
    ownerId,
    description: "",
    logo: "",
    banner: "",
    theme: {},
    settings: {},
    templateId,
    createdAt: new Date(),
  };
  stores.set(id, store);

  // Seed default demo products into this new store so the product tables are not empty
  try {
    seedDemoProducts(id);
  } catch (e) {
    console.error("Failed to seed demo products:", e);
  }

  return store;
}

function seedDemoProducts(storeId: string) {
  const demoProducts = [
    {
      name: "Cotton Panjabi",
      price: 1200,
      description: "Handwoven premium cotton panjabi for everyday wear.",
      images: ["https://via.placeholder.com/400?text=Panjabi"],
      stock: 25,
      status: "active" as const,
      variants: [{ id: "v1", name: "M", price: 1200, stock: 10 }, { id: "v2", name: "L", price: 1200, stock: 15 }],
    },
    {
      name: "Silk Saree",
      price: 4500,
      description: "Elegant silk saree with traditional zari work.",
      images: ["https://via.placeholder.com/400?text=Saree"],
      stock: 12,
      status: "active" as const,
      variants: [{ id: "v3", name: "Red", price: 4500, stock: 5 }, { id: "v4", name: "Green", price: 4500, stock: 7 }],
    },
    {
      name: "Linen Kurta",
      price: 850,
      description: "Comfortable linen kurta perfect for casual occasions.",
      images: ["https://via.placeholder.com/400?text=Kurta"],
      stock: 30,
      status: "active" as const,
      variants: [{ id: "v5", name: "S", price: 850, stock: 10 }, { id: "v6", name: "M", price: 850, stock: 20 }],
    },
  ];

  for (const p of demoProducts) {
    try {
      createProduct(storeId, p);
    } catch (e) {
      console.error("Failed to create demo product:", e);
    }
  }
}

export function createProduct(storeId: string, data: Partial<Product>): Product {
  const id = generateId();
  const product: Product = {
    id,
    storeId,
    name: data.name || "New Product",
    description: data.description || "",
    price: data.price || 0,
    comparePrice: data.comparePrice,
    images: data.images || [],
    stock: data.stock || 0,
    status: data.status || "active",
    variants: data.variants || [],
    createdAt: new Date(),
  };
  products.set(id, product);
  return product;
}

export function getStoreByOwnerId(ownerId: string): Store | undefined {
  for (const store of stores.values()) {
    if (store.ownerId === ownerId) return store;
  }
  return undefined;
}

export function getProductsByStoreId(storeId: string): Product[] {
  return Array.from(products.values()).filter(p => p.storeId === storeId);
}