export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Store {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  description?: string;
  logo?: string;
  theme?: any;
  settings?: any;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  quantity: number;
  status: string;
  featured: boolean;
  sku?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  shipping?: Shipping;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Shipping {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
}

export interface AnalyticsData {
  date: string;
  visitors: number;
  pageviews: number;
  orders: number;
  revenue: number;
}
