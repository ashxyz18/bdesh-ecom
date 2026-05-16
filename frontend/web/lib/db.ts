import { prisma } from "@bdesh/database";
import type { Prisma } from "@bdesh/database";

export { prisma };

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateOrderNumber(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

// ========================
// STORE OPERATIONS
// ========================

export async function getStoreById(storeId: string) {
  return prisma.store.findFirst({ where: { id: storeId, deletedAt: null } });
}

export async function getStoreByOwnerId(ownerId: string) {
  return prisma.store.findFirst({ where: { ownerId, deletedAt: null } });
}

export async function createStore(name: string, ownerId: string, templateId?: string) {
  const slug = generateSlug(name);
  const subdomain = slug;
  const existing = await prisma.store.findFirst({
    where: { OR: [{ slug }, { subdomain }] },
  });
  const suffix = existing ? `-${generateId().slice(0, 6)}` : "";

  return prisma.store.create({
    data: {
      name,
      slug: slug + suffix,
      subdomain: subdomain + suffix,
      ownerId,
      templateId: templateId || "default",
      theme: "{}",
      settings: "{}",
      status: "APPROVED",
    },
  });
}

export async function getStoreWithProducts(storeId: string) {
  const store = await prisma.store.findFirst({ where: { id: storeId, deletedAt: null } });
  if (!store) return null;
  const products = await getProductsByStoreId(storeId);
  return { ...store, products };
}

// ========================
// PRODUCT OPERATIONS
// ========================

export async function getProductsByStoreId(storeId: string) {
  return prisma.product.findMany({
    where: { storeId, status: { notIn: ["archived", "deleted"] }, deletedAt: null },
  });
}

export async function getProductById(productId: string) {
  return prisma.product.findUnique({ where: { id: productId } });
}

export async function createProduct(storeId: string, data: {
  name: string;
  price: number;
  description?: string;
  images?: string[];
  stock?: number;
  categoryId?: string;
  category?: string;
  colors?: string[];
  tags?: string[];
  status?: string;
  comparePrice?: number | null;
  costPrice?: number | null;
  lowStockThreshold?: number;
  seo?: { title?: string | null; description?: string | null };
  slug?: string;
  attributes?: Record<string, unknown>;
}) {
  const attributes: Record<string, unknown> = { ...(data.attributes || {}) };
  if (data.category) attributes.category = data.category;
  if (data.colors && data.colors.length > 0) attributes.colors = data.colors;
  if (data.tags && data.tags.length > 0) attributes.tags = data.tags;

  return prisma.product.create({
    data: {
      storeId,
      name: data.name,
      slug: data.slug || generateSlug(data.name),
      price: data.price,
      description: data.description || "",
      images: JSON.stringify(data.images || []),
      quantity: data.stock || 0,
      status: data.status || "active",
      comparePrice: data.comparePrice || null,
      attributes: JSON.stringify(attributes),
      seoTitle: data.seo?.title || null,
      seoDesc: data.seo?.description || null,
    },
  });
}

export async function updateProduct(productId: string, data: Record<string, unknown>) {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) { updateData.name = data.name as string; if (data.slug === undefined) updateData.slug = generateSlug(data.name as string); }
  if (data.price !== undefined) updateData.price = data.price as number;
  if (data.comparePrice !== undefined) updateData.comparePrice = data.comparePrice as number | null;
  if (data.description !== undefined) updateData.description = data.description as string;
  if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
  if (data.stock !== undefined) updateData.quantity = data.stock as number;
  if (data.status !== undefined) updateData.status = data.status as string;
  if (data.slug !== undefined) updateData.slug = data.slug as string;

  // Merge category/colors into attributes
  const existing = await prisma.product.findUnique({ where: { id: productId }, select: { attributes: true } });
  const existingAttrs = safeJsonParse(existing?.attributes, {});
  const newAttrs = { ...existingAttrs, ...((data.attributes as Record<string, unknown>) || {}) };
  if (data.category !== undefined) newAttrs.category = data.category || undefined;
  if (data.colors !== undefined) newAttrs.colors = data.colors || [];
  if (Object.keys(newAttrs).length > 0) {
    updateData.attributes = JSON.stringify(newAttrs);
  }

  return prisma.product.update({ where: { id: productId }, data: updateData });
}

export async function deleteProduct(productId: string) {
  return prisma.product.update({
    where: { id: productId },
    data: { status: "archived", deletedAt: new Date() },
  });
}

// ========================
// CATEGORY OPERATIONS
// ========================

export async function getCategoriesByStoreId(storeId: string) {
  return prisma.collection.findMany({
    where: { storeId },
  });
}

export async function createCategory(storeId: string, name: string, options?: {
  description?: string;
  parentId?: string;
  image?: string;
  icon?: string;
  sortOrder?: number;
}) {
  return prisma.collection.create({
    data: {
      storeId,
      name,
      slug: generateSlug(name),
      description: options?.description,
      image: options?.image,
      isVisible: true,
    },
  });
}

export async function updateCategory(categoryId: string, data: Record<string, unknown>) {
  return prisma.collection.update({ where: { id: categoryId }, data });
}

export async function deleteCategory(categoryId: string) {
  return prisma.collection.delete({ where: { id: categoryId } });
}

// ========================
// ORDER OPERATIONS
// ========================

export async function getOrdersByStoreId(storeId: string) {
  return prisma.order.findMany({
    where: { storeId },
    include: { items: true, shipping: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, shipping: true },
  });
}

export async function createOrder(storeId: string, data: {
  customerInfo: { name: string; phone: string; email?: string };
  shippingAddress: { name: string; phone: string; addressLine1: string; city: string; district: string; postalCode?: string; area?: string; country?: string };
  items: { productId: string; name: string; price: number; quantity: number; image?: string }[];
  subtotal: number;
  discount?: number;
  deliveryFee?: number;
  total: number;
  paymentMethod: string;
  paymentStatus?: string;
  notes?: string;
  couponId?: string;
  couponCode?: string;
  storeCustomerId?: string;
}) {
  const order = await prisma.order.create({
    data: {
      storeId,
      orderNumber: generateOrderNumber(),
      customerId: null,
      storeCustomerId: data.storeCustomerId || null,
      status: "PENDING",
      paymentStatus: data.paymentStatus || "PENDING",
      paymentMethod: data.paymentMethod,
      subtotal: data.subtotal,
      shippingCost: data.deliveryFee || 0,
      discount: data.discount || 0,
      total: data.total,
      couponCode: data.couponCode,
      notes: data.notes || "",
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image ? JSON.stringify(item.image) : null,
        })),
      },
      shipping: {
        create: {
          name: data.shippingAddress.name,
          phone: data.shippingAddress.phone,
          address: data.shippingAddress.addressLine1,
          city: data.shippingAddress.city,
          district: data.shippingAddress.district,
          postalCode: data.shippingAddress.postalCode || "",
        },
      },
    },
    include: { items: true, shipping: true },
  });
  return order;
}

export async function updateOrderStatus(orderId: string, data: {
  status?: string;
  paymentStatus?: string;
  notes?: string;
  trackingId?: string;
  trackingUrl?: string;
  courier?: string;
}) {
  const updateData: Record<string, unknown> = {};
  if (data.status) updateData.status = data.status.toUpperCase().replace(/-/g, "_");
  if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus.toUpperCase();
  if (data.notes !== undefined) updateData.notes = data.notes;

  if (data.trackingId || data.trackingUrl) {
    await prisma.shipping.updateMany({
      where: { orderId },
      data: {
        trackingCode: data.trackingId,
      },
    });
  }

  return prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: { items: true, shipping: true },
  });
}

export async function deleteOrder(orderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });
}

// ========================
// COUPON OPERATIONS
// ========================

export async function getCouponsByStoreId(storeId: string) {
  return prisma.coupon.findMany({ where: { storeId } });
}

export async function createCoupon(storeId: string, data: {
  code: string;
  type: string;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  return prisma.coupon.create({
    data: {
      storeId,
      code: data.code,
      type: data.type === "percentage" ? "PERCENTAGE" : data.type === "fixed" ? "FIXED" : "FREE_SHIPPING",
      value: data.value,
      minOrder: data.minOrderAmount,
      maxUses: data.usageLimit,
      startsAt: data.startDate || new Date(),
      endsAt: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
}

// ========================
// ANALYTICS
// ========================

export async function getAnalytics(storeId: string) {
  return prisma.analytics.findMany({
    where: { storeId },
    orderBy: { date: "desc" },
  });
}

// ========================
// USERS
// ========================

export async function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function isAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.role === "ADMIN";
}

// ========================
// STORE CUSTOMERS
// ========================

export async function getStoreCustomerById(storeCustomerId: string) {
  return prisma.storeCustomer.findUnique({ where: { id: storeCustomerId } });
}

export async function getStoreCustomerByEmail(storeId: string, email: string) {
  return prisma.storeCustomer.findUnique({
    where: { storeId_email: { storeId, email } },
  });
}

// ========================
// JSON UTILS
// ========================

export function parseStoreJson<T extends { theme: string; settings: string; templateId?: string | null }>(store: T | null) {
  if (!store) return null;
  const theme = safeJsonParse(store.theme) as Record<string, unknown>;
  return {
    ...store,
    theme,
    settings: safeJsonParse(store.settings),
    templateId: store.templateId || (theme?.templateId as string) || "default",
  };
}

export function safeJsonParse(value: string | undefined | null, fallback: unknown = {}) {
  if (!value) return fallback as Record<string, unknown>;
  try {
    return JSON.parse(value);
  } catch {
    return fallback as Record<string, unknown>;
  }
}

// Product response serializer (maps Prisma fields to frontend-friendly format)
export function serializeProduct(p: {
  id: string; storeId: string; name: string; slug: string; description: string | null;
  images: string; price: number; comparePrice: number | null; sku: string | null;
  quantity: number; status: string; featured: boolean; attributes: string;
  seoTitle: string | null; seoDesc: string | null;
  createdAt: Date; updatedAt: Date;
}) {
  const attrs = safeJsonParse(p.attributes, {});
  const category = attrs.category || attrs.type || "";
  const colors = attrs.colors || [];
  const tags = category ? [category] : ([] as string[]);
  return {
    id: p.id,
    storeId: p.storeId,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    comparePrice: p.comparePrice,
    costPrice: null,
    images: safeJsonParse(p.images, []),
    categoryId: category || null,
    category,
    tags,
    colors,
    stock: p.quantity,
    lowStockThreshold: 5,
    status: p.status,
    variants: [] as unknown[],
    seo: { title: p.seoTitle, description: p.seoDesc },
    weight: null,
    dimensions: null,
    metadata: attrs as Record<string, string>,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export function serializeProductList(products: Array<Parameters<typeof serializeProduct>[0]>) {
  return products.map(serializeProduct);
}

// Order response serializer
export function serializeOrder(order: {
  id: string; storeId: string; orderNumber: string; customerId: string | null;
  status: string; paymentStatus: string; paymentMethod: string;
  subtotal: number; shippingCost: number; discount: number; total: number;
  couponCode: string | null; notes: string | null;
  createdAt: Date; updatedAt: Date;
  items?: { id: string; productId: string; name: string; price: number; quantity: number; image: string | null; sku: string | null }[];
  shipping?: { name: string; phone: string; address: string; city: string; district: string; postalCode: string; trackingCode: string | null } | null;
} | null) {
  if (!order) return null;

  const statusMap: Record<string, string> = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  };

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    storeId: order.storeId,
    customerId: order.customerId,
    customerInfo: {
      name: order.shipping?.name || "",
      phone: order.shipping?.phone || "",
    },
    shippingAddress: {
      name: order.shipping?.name || "",
      phone: order.shipping?.phone || "",
      addressLine1: order.shipping?.address || "",
      city: order.shipping?.city || "",
      district: order.shipping?.district || "",
      postalCode: order.shipping?.postalCode || "",
      country: "Bangladesh",
    },
    items: (order.items || []).map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      discount: 0,
      image: item.image ? safeJsonParse(item.image, null) : null,
      sku: item.sku,
    })),
    subtotal: order.subtotal,
    discount: order.discount,
    deliveryFee: order.shippingCost,
    total: order.total,
    paymentMethod: order.paymentMethod.toLowerCase(),
    paymentStatus: order.paymentStatus.toLowerCase(),
    status: statusMap[order.status] || order.status.toLowerCase(),
    courier: null as string | null,
    trackingId: order.shipping?.trackingCode || null,
    trackingUrl: null as string | null,
    couponId: null,
    couponCode: order.couponCode,
    notes: order.notes || "",
    source: "website" as const,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export function serializeOrderList(orders: Array<NonNullable<Parameters<typeof serializeOrder>[0]>>) {
  return orders.map(serializeOrder).filter(Boolean);
}
