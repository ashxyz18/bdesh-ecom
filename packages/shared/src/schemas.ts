import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "At least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(11, "Valid BD phone required"),
  password: z.string().min(6, "At least 6 characters"),
});

export const siteCreateSchema = z.object({
  name: z.string().min(2, "Site name required").max(100),
  subdomain: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  websiteType: z.enum(["ECOMMERCE", "PORTFOLIO", "BLOG", "CORPORATE", "RESTAURANT", "EDUCATION", "LANDING", "NONPROFIT", "REAL_ESTATE"]).default("ECOMMERCE"),
});

export const storeCreateSchema = z.object({
  name: z.string().min(2, "Store name required").max(100),
  subdomain: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name required").max(200),
  slug: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  comparePrice: z.number().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  quantity: z.number().int().min(0).default(0),
  trackStock: z.boolean().default(true),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  featured: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  attributes: z.array(z.any()).default([]),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
});

export const orderCreateSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  shipping: z.object({
    name: z.string().min(1),
    phone: z.string().min(11),
    address: z.string().min(1),
    city: z.string().min(1),
    district: z.string().min(1),
    postalCode: z.string().optional(),
  }),
  paymentMethod: z.enum(["BKASH", "NAGAD", "ROCKET", "CASH_ON_DELIVERY", "CARD"]),
  notes: z.string().optional(),
});

export const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.any().optional(),
  pageType: z.string().default("custom"),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SiteCreateInput = z.infer<typeof siteCreateSchema>;
export type StoreCreateInput = z.infer<typeof storeCreateSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type PageInput = z.infer<typeof pageSchema>;
