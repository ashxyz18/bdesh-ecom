// In-memory store for BixelBD e-commerce platform
// Replace with actual database in production

export type UserRole = "user" | "admin";

export enum ProductStatus {
  Active = "active",
  Draft = "draft",
  Archived = "archived",
}

export enum OrderStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Processing = "processing",
  Shipped = "shipped",
  Delivered = "delivered",
  Cancelled = "cancelled",
  Returned = "returned",
}

export type CouponType = "percentage" | "fixed";
export type CouponStatus = "active" | "expired" | "disabled";
export type CourierProvider = "pathao" | "redx" | "steadfast" | "paperfly";
export type SocialPlatform = "facebook" | "instagram" | "whatsapp";

// =====================
// USER & AUTH
// =====================

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

// =====================
// STORE
// =====================

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
  socialLinks?: SocialLinks;
  createdAt: Date;
}

export interface StoreTheme {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  buttonColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface StoreSettings {
  currency?: string;
  heroImage?: string;
  heroHeadline?: string;
  heroSubtext?: string;
  heroButtonText?: string;
  heroButtonLink?: string;
  footerText?: string;
  promotionalBanners?: PromotionalBanner[];
  featuredCategories?: string[];
}

export interface PromotionalBanner {
  id: string;
  image: string;
  link?: string;
  title?: string;
  active: boolean;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
}

// =====================
// PRODUCTS
// =====================

export interface Product {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  images: string[];
  categoryId?: string;
  tags: string[];
  stock: number;
  lowStockThreshold: number;
  status: "active" | "draft" | "archived";
  variants: ProductVariant[];
  seo: ProductSEO;
  weight?: number;
  dimensions?: ProductDimensions;
  metadata: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  comparePrice?: number;
  stock?: number;
  attributes: Record<string, string>;
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  url?: string;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: "cm" | "inch";
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  icon?: string;
  sortOrder: number;
  productCount: number;
  active: boolean;
  createdAt: Date;
}

// =====================
// ORDERS
// =====================

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  customerId?: string;
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "paid" | "unpaid" | "partial" | "refunded";
  status: OrderStatus;
  courier?: CourierProvider;
  trackingId?: string;
  trackingUrl?: string;
  notes: string;
  source: "website" | "facebook" | "instagram" | "whatsapp" | "phone";
  couponId?: string;
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  discount: number;
  image?: string;
  variantName?: string;
}

export interface CustomerInfo {
  name: string;
  email?: string;
  phone: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  area?: string;
  postalCode?: string;
  country: string;
}

export type PaymentMethod = "cod" | "bkash" | "nagad" | "rocket" | "card" | "sslcommerz";

// =====================
// CUSTOMERS
// =====================

export interface Customer {
  id: string;
  storeId: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  addresses: ShippingAddress[];
  notes?: string;
  tags: string[];
  createdAt: Date;
}

// =====================
// COUPONS & MARKETING
// =====================

export interface Coupon {
  id: string;
  storeId: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  startDate: Date;
  endDate: Date;
  status: CouponStatus;
  applicableProducts: string[];
  applicableCategories: string[];
  createdAt: Date;
}

export interface FlashSale {
  id: string;
  storeId: string;
  name: string;
  discountPercent: number;
  startDate: Date;
  endDate: Date;
  productIds: string[];
  status: "active" | "scheduled" | "ended";
  createdAt: Date;
}

export interface AbandonedCart {
  id: string;
  storeId: string;
  customerId?: string;
  cartData: CartData;
  recoveryUrl?: string;
  emailSent: boolean;
  createdAt: Date;
  lastNotified?: Date;
}

export interface CartData {
  items: { productId: string; variantId?: string; quantity: number; price: number; name: string }[];
  total: number;
}

// =====================
// COURIER INTEGRATION
// =====================

export interface CourierAccount {
  id: string;
  storeId: string;
  provider: CourierProvider;
  apiKey?: string;
  apiSecret?: string;
  storeId_: string;
  merchantName?: string;
  isDefault: boolean;
  active: boolean;
  createdAt: Date;
}

export interface CourierDeliveryRequest {
  orderId: string;
  courierProvider: CourierProvider;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  city: string;
  area?: string;
  postalCode?: string;
  parcelWeight?: number;
  deliveryType?: "standard" | "express" | "scheduled";
  specialInstructions?: string;
  items: string[];
  codAmount: number;
}

// =====================
// SOCIAL MEDIA
// =====================

export interface SocialAccount {
  id: string;
  storeId: string;
  platform: SocialPlatform;
  accessToken?: string;
  pageId?: string;
  pageName?: string;
  connected: boolean;
  autoPost: boolean;
  createdAt: Date;
}

export interface SocialPost {
  id: string;
  storeId: string;
  platform: SocialPlatform;
  content: string;
  imageUrl?: string;
  productId?: string;
  status: "pending" | "published" | "failed";
  postId?: string;
  scheduledAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
}

// =====================
// ANALYTICS
// =====================

export interface StoreAnalytics {
  storeId: string;
  period: string;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: { productId: string; name: string; quantity: number; revenue: number }[];
  ordersByStatus: Record<string, number>;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  courierPerformance: { provider: string; total: number; delivered: number; cancelled: number; rate: number }[];
  updatedAt: Date;
}

// =====================
// TEMPLATE (for prebuilt templates)
// =====================

export interface Template {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  previewUrl: string;
}

// =====================
// IN-MEMORY STORAGE
// =====================

export const users: Map<string, User> = new Map();
export const stores: Map<string, Store> = new Map();
export const products: Map<string, Product> = new Map();
export const templates: Map<string, Template> = new Map();
export const categories: Map<string, Category> = new Map();
export const orders: Map<string, Order> = new Map();
export const customers: Map<string, Customer> = new Map();
export const coupons: Map<string, Coupon> = new Map();
export const flashSales: Map<string, FlashSale> = new Map();
export const courierAccounts: Map<string, CourierAccount> = new Map();
export const socialAccounts: Map<string, SocialAccount> = new Map();
export const socialPosts: Map<string, SocialPost> = new Map();
export const abandonedCarts: Map<string, AbandonedCart> = new Map();

// =====================
// SEED DATA
// =====================

const adminId = generateId();
users.set(adminId, {
  id: adminId,
  email: "admin@bdesh.shop",
  password: "admin123",
  name: "Admin",
  role: "admin",
  createdAt: new Date(),
});

templates.set("koskii", {
  id: "koskii",
  name: "Koskii Ethnic Wear",
  slug: "koskii",
  description: "A beautiful e-commerce template for ethnic wear, fashion boutiques",
  thumbnail: "https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-ranipink-zariwork-puresilk-designer-saree-saus0035699_ranipink_1_1.jpg?v=1721373197",
  previewUrl: "/prebuilt-templates/koskii/index.html",
});

// =====================
// HELPER FUNCTIONS
// =====================

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function generateOrderNumber(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// =====================
// STORE OPERATIONS
// =====================

export function createStore(name: string, ownerId: string, templateId?: string): Store {
  const id = generateId();
  const slug = generateSlug(name);
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
    socialLinks: {},
    createdAt: new Date(),
  };
  stores.set(id, store);

  // Seed demo categories
  seedDemoCategories(id);

  // Seed demo products
  try {
    seedDemoProducts(id);
  } catch (e) {
    console.error("Failed to seed demo products:", e);
  }

  // Seed demo orders
  try {
    seedDemoOrders(id);
  } catch (e) {
    console.error("Failed to seed demo orders:", e);
  }

  return store;
}

function seedDemoCategories(storeId: string) {
  const cats = [
    { name: "Sarees", icon: "👗" },
    { name: "Salwar Suits", icon: "👚" },
    { name: "Lehengas", icon: "👘" },
    { name: "Gowns", icon: "🥻" },
    { name: "Dress Materials", icon: "🧵" },
    { name: "Blouses", icon: "👚" },
  ];

  cats.forEach((c, i) => {
    const catId = generateId();
    categories.set(catId, {
      id: catId,
      storeId,
      name: c.name,
      slug: generateSlug(c.name),
      icon: c.icon,
      sortOrder: i + 1,
      productCount: 0,
      active: true,
      createdAt: new Date(),
    });
  });
}

function seedDemoProducts(storeId: string) {
  const demoProducts = [
    {
      name: "Navy Blue Zariwork Soft Silk Designer Saree",
      price: 1992,
      comparePrice: 2490,
      description: "Beautiful navy blue silk saree with intricate zariwork. Perfect for festive occasions and weddings.",
      images: ["https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-navyblue-zariwork-softsilk-designer-saree-saus0040043_navy_blue_2_2.jpg?v=1767765016"],
      stock: 15,
      status: "active" as const,
      variants: [
        { id: "v1", name: "Free Size", price: 1992, stock: 15, attributes: {} },
      ],
      tags: ["saree", "silk", "designer", "navy blue"],
      seo: { title: "Navy Blue Zariwork Soft Silk Designer Saree", description: "Buy Navy Blue Zariwork Soft Silk Designer Saree online" },
    },
    {
      name: "Beige Chanderi Threadwork Salwar Suit",
      price: 2392,
      comparePrice: 2990,
      description: "Elegant beige chanderi suit with beautiful threadwork embroidery.",
      images: ["https://cdn.shopify.com/s/files/1/0049/3649/9315/products/koskii-beige-printed-semi-crepe-designer-salwar-suit-ssss0021855_beige_1.jpg?v=1669197907"],
      stock: 20,
      status: "active" as const,
      variants: [
        { id: "v2", name: "S", price: 2392, stock: 7, attributes: { size: "S" } },
        { id: "v3", name: "M", price: 2392, stock: 8, attributes: { size: "M" } },
        { id: "v4", name: "L", price: 2392, stock: 5, attributes: { size: "L" } },
      ],
      tags: ["salwar suit", "chanderi", "beige"],
      seo: { title: "Beige Chanderi Threadwork Salwar Suit", description: "Shop Beige Chanderi Salwar Suit online" },
    },
    {
      name: "Black Georgette Threadwork Designer Saree",
      price: 5192,
      comparePrice: 6490,
      description: "Stunning black georgette saree with premium threadwork. Perfect for evening events.",
      images: ["https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SAUS0044237_BLACK_6.jpg?v=1752822324"],
      stock: 8,
      status: "active" as const,
      variants: [{ id: "v5", name: "Free Size", price: 5192, stock: 8, attributes: {} }],
      tags: ["saree", "georgette", "black", "designer"],
      seo: { title: "Black Georgette Threadwork Designer Saree", description: "Buy Black Georgette Designer Saree" },
    },
    {
      name: "Sea Green Organza Zariwork Salwar Suit",
      price: 2622,
      comparePrice: 4370,
      description: "Fresh sea green organza suit with beautiful zariwork detailing.",
      images: ["https://cdn.shopify.com/s/files/1/0049/3649/9315/files/SSRM0046196_SEA_GREEN_1.jpg?v=1758522681"],
      stock: 12,
      status: "active" as const,
      variants: [
        { id: "v6", name: "S", price: 2622, stock: 4, attributes: { size: "S" } },
        { id: "v7", name: "M", price: 2622, stock: 8, attributes: { size: "M" } },
      ],
      tags: ["salwar suit", "organza", "sea green"],
      seo: { title: "Sea Green Organza Zariwork Salwar Suit", description: "Shop Sea Green Organza Salwar Suit" },
    },
    {
      name: "Mauve Swarovski Shimmer Designer Saree",
      price: 4792,
      comparePrice: 5990,
      description: "Gorgeous mauve saree with swarovski shimmer work. A showstopper for special occasions.",
      images: ["https://cdn.shopify.com/s/files/1/0049/3649/9315/products/koskii-mauve-swarovski-shimmer-designer-saree-saus0018647_mauve_8.jpg?v=1748424803"],
      stock: 6,
      status: "active" as const,
      variants: [{ id: "v8", name: "Free Size", price: 4792, stock: 6, attributes: {} }],
      tags: ["saree", "swarovski", "mauve", "designer"],
      seo: { title: "Mauve Swarovski Shimmer Designer Saree", description: "Buy Mauve Swarovski Designer Saree online" },
    },
    {
      name: "Wine Swarovski Semi Crepe Designer Saree",
      price: 2392,
      comparePrice: 2990,
      description: "Classic wine colored saree in semi crepe fabric with swarovski accents.",
      images: ["https://cdn.shopify.com/s/files/1/0049/3649/9315/files/koskii-wine-swarovski-semi-crepe-designer-saree-saus0017312_wine_5_f298f650-e441-4941-a069-61bbb73382d9.jpg?v=1748424814"],
      stock: 18,
      status: "active" as const,
      variants: [{ id: "v9", name: "Free Size", price: 2392, stock: 18, attributes: {} }],
      tags: ["saree", "wine", "semi crepe"],
      seo: { title: "Wine Swarovski Semi Crepe Designer Saree", description: "Shop Wine Semi Crepe Designer Saree" },
    },
  ];

  demoProducts.forEach((p) => {
    try {
      createProduct(storeId, p);
    } catch (e) {
      console.error("Failed to create demo product:", e);
    }
  });
}

function seedDemoOrders(storeId: string) {
  const districts = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur"];
  const statuses: OrderStatus[] = [OrderStatus.Pending, OrderStatus.Confirmed, OrderStatus.Processing, OrderStatus.Shipped, OrderStatus.Delivered];
  const paymentMethods: PaymentMethod[] = ["cod", "bkash", "nagad"];

  const customerNames = [
    "Rahim Ahmed", "Fatima Begum", "Karim Hassan", "Nusrat Jahan", "Sultan Ali",
    "Mithun Das", "Shapla Khatun", "Babul Miah", "Rina Begum", "Jahid Hasan",
  ];

  for (let i = 0; i < 12; i++) {
    const orderId = generateId();
    const customerName = customerNames[i % customerNames.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const price = Math.floor(Math.random() * 3000) + 500;
      const qty = Math.floor(Math.random() * 2) + 1;
      subtotal += price * qty;
      items.push({
        productId: `demo-p${j + 1}`,
        name: `Demo Product ${j + 1}`,
        price,
        quantity: qty,
        discount: 0,
        image: "https://via.placeholder.com/100",
      });
    }

    const discount = Math.random() > 0.7 ? Math.floor(subtotal * 0.1) : 0;
    const deliveryFee = subtotal > 1500 ? 0 : 120;
    const total = subtotal - discount + deliveryFee;

    const order: Order = {
      id: orderId,
      orderNumber: generateOrderNumber(),
      storeId,
      customerInfo: {
        name: customerName,
        phone: `01${Math.floor(Math.random() * 900000000) + 100000000}`,
        email: `${customerName.toLowerCase().replace(/ /g, ".")}@gmail.com`,
      },
      shippingAddress: {
        name: customerName,
        phone: `01${Math.floor(Math.random() * 900000000) + 100000000}`,
        addressLine1: `House ${Math.floor(Math.random() * 50) + 1}, Road ${Math.floor(Math.random() * 20) + 1}`,
        city: district,
        district,
        area: "Uttara",
        country: "Bangladesh",
      },
      items,
      subtotal,
      discount,
      deliveryFee,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "unpaid" : "paid",
      status,
      notes: "",
      source: "website",
      createdAt,
      updatedAt: createdAt,
    };

    if (status === OrderStatus.Shipped || status === OrderStatus.Delivered) {
      order.courier = "pathao";
      order.trackingId = `PTH${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      order.trackingUrl = `https://tracking.pathao.com/${order.trackingId}`;
    }

    orders.set(orderId, order);
  }
}

// =====================
// PRODUCT OPERATIONS
// =====================

export function createProduct(storeId: string, data: Partial<Product>): Product {
  const id = generateId();
  const product: Product = {
    id,
    storeId,
    name: data.name || "New Product",
    slug: data.slug || generateSlug(data.name || "new-product"),
    description: data.description || "",
    price: data.price || 0,
    comparePrice: data.comparePrice,
    costPrice: data.costPrice,
    images: data.images || [],
    categoryId: data.categoryId,
    tags: data.tags || [],
    stock: data.stock || 0,
    lowStockThreshold: data.lowStockThreshold || 5,
    status: data.status || "active",
    variants: data.variants || [],
    seo: data.seo || {},
    weight: data.weight,
    dimensions: data.dimensions,
    metadata: data.metadata || {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  products.set(id, product);
  return product;
}

export function getProductsByStoreId(storeId: string): Product[] {
  return Array.from(products.values()).filter((p) => p.storeId === storeId);
}

export function getCategoriesByStoreId(storeId: string): Category[] {
  return Array.from(categories.values()).filter((c) => c.storeId === storeId);
}

export function getOrdersByStoreId(storeId: string): Order[] {
  return Array.from(orders.values())
    .filter((o) => o.storeId === storeId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getCustomersByStoreId(storeId: string): Customer[] {
  return Array.from(customers.values()).filter((c) => c.storeId === storeId);
}

export function getCouponsByStoreId(storeId: string): Coupon[] {
  return Array.from(coupons.values()).filter((c) => c.storeId === storeId);
}

export function createCoupon(storeId: string, data: Partial<Coupon>): Coupon {
  const id = generateId();
  const coupon: Coupon = {
    id,
    storeId,
    code: data.code || generateId().toUpperCase().substring(0, 8),
    type: data.type || "percentage",
    value: data.value || 0,
    minOrderAmount: data.minOrderAmount,
    maxDiscount: data.maxDiscount,
    usageLimit: data.usageLimit || 100,
    usedCount: 0,
    perUserLimit: data.perUserLimit || 1,
    startDate: data.startDate || new Date(),
    endDate: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: data.status || "active",
    applicableProducts: data.applicableProducts || [],
    applicableCategories: data.applicableCategories || [],
    createdAt: new Date(),
  };
  coupons.set(id, coupon);
  return coupon;
}

export function createOrder(storeId: string, data: Partial<Order>): Order {
  const id = generateId();
  const order: Order = {
    id,
    orderNumber: generateOrderNumber(),
    storeId,
    customerInfo: data.customerInfo || { name: "", phone: "" },
    shippingAddress: data.shippingAddress || {
      name: "",
      phone: "",
      addressLine1: "",
      city: "",
      district: "",
      country: "Bangladesh",
    },
    billingAddress: data.billingAddress,
    items: data.items || [],
    subtotal: data.subtotal || 0,
    discount: data.discount || 0,
    deliveryFee: data.deliveryFee || 0,
    total: data.total || 0,
    paymentMethod: data.paymentMethod || "cod",
    paymentStatus: data.paymentStatus || "unpaid",
    status: data.status || OrderStatus.Pending,
    courier: data.courier,
    trackingId: data.trackingId,
    trackingUrl: data.trackingUrl,
    notes: data.notes || "",
    source: data.source || "website",
    couponId: data.couponId,
    couponCode: data.couponCode,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  orders.set(id, order);
  return order;
}

export function createFlashSale(storeId: string, data: Partial<FlashSale>): FlashSale {
  const id = generateId();
  const sale: FlashSale = {
    id,
    storeId,
    name: data.name || "Flash Sale",
    discountPercent: data.discountPercent || 20,
    startDate: data.startDate || new Date(),
    endDate: data.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    productIds: data.productIds || [],
    status: data.status || "active",
    createdAt: new Date(),
  };
  flashSales.set(id, sale);
  return sale;
}

export function createCourierAccount(storeId: string, data: Partial<CourierAccount>): CourierAccount {
  const id = generateId();
  const account: CourierAccount = {
    id,
    storeId,
    provider: data.provider || "pathao",
    apiKey: data.apiKey,
    apiSecret: data.apiSecret,
    storeId_: data.storeId_ || "",
    merchantName: data.merchantName,
    isDefault: data.isDefault ?? true,
    active: data.active ?? true,
    createdAt: new Date(),
  };
  courierAccounts.set(id, account);
  return account;
}

export function getCourierAccountsByStoreId(storeId: string): CourierAccount[] {
  return Array.from(courierAccounts.values()).filter((a) => a.storeId === storeId);
}

export function createSocialAccount(storeId: string, data: Partial<SocialAccount>): SocialAccount {
  const id = generateId();
  const account: SocialAccount = {
    id,
    storeId,
    platform: data.platform || "facebook",
    accessToken: data.accessToken,
    pageId: data.pageId,
    pageName: data.pageName,
    connected: data.connected ?? false,
    autoPost: data.autoPost ?? false,
    createdAt: new Date(),
  };
  socialAccounts.set(id, account);
  return account;
}

export function getSocialAccountsByStoreId(storeId: string): SocialAccount[] {
  return Array.from(socialAccounts.values()).filter((a) => a.storeId === storeId);
}

export function getStoreByOwnerId(ownerId: string): Store | undefined {
  for (const store of stores.values()) {
    if (store.ownerId === ownerId) return store;
  }
  return undefined;
}