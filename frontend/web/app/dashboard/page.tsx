"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  Plus,
  ExternalLink,
  Package,
  CheckCircle2,
  Circle,
  Palette,
  DollarSign,
  Users,
  Tag,
  Truck,
  BarChart3,
  UploadCloud,
  TrendingUp,
  Eye,
  Store,
  Rocket,
} from "lucide-react";
import { getRequirementStatus, getTemplateDashboard } from "@/lib/templates/adoption";
import type { DashboardRequirement, TemplateManifest } from "@/lib/templates/manifest";

interface StoreData {
  id: string;
  name: string;
  ownerId: string;
  templateId: string;
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  settings: Record<string, any>;
}

interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  images?: string[];
}

interface Order {
  id: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
}

interface OrderApiItem {
  id: string;
  orderNumber?: string;
  customerInfo?: { name?: string };
  total?: number;
  status?: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [templateManifest, setTemplateManifest] = useState<TemplateManifest | null>(null);
  const [setupChecklist, setSetupChecklist] = useState<DashboardRequirement[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const storeId = localStorage.getItem("storeId");

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }

    if (!storeId) {
      setLoading(false);
      return;
    }

    fetch(`/api/stores/${storeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.store) {
            setStore(data.store);
            if (data.store.templateId) {
              fetch(`/api/templates/${data.store.templateId}`)
                .then((res) => res.json())
                .then((templateData) => {
                  const manifest = templateData.template?.manifest || null;
                  const dashboard = getTemplateDashboard(manifest);
                  setTemplateName(templateData.template?.name || data.store.templateId);
                  setTemplateManifest(manifest);
                  setSetupChecklist(dashboard.setupChecklist);
                })
                .catch(console.error);
            }
          }
          setProducts(data.products || []);
        })
        .catch((err) => {
          console.error("Failed to fetch store:", err);
        })
        .finally(() => setLoading(false));

    Promise.allSettled([
      fetch(`/api/stores/${storeId}/orders?limit=5`).then((res) => res.json()),
      fetch(`/api/stores/${storeId}/customers?limit=1`).then((res) => res.json()),
    ]).then(([ordersResult, customersResult]) => {
      if (ordersResult.status === "fulfilled" && ordersResult.value?.success) {
        const orders = ordersResult.value.orders || [];
        setRevenue(ordersResult.value.totalRevenue || 0);
        setPendingOrders(ordersResult.value.totalPending || 0);
        setRecentOrders(
          orders.slice(0, 5).map((order: OrderApiItem) => ({
            id: order.orderNumber || order.id,
            customer: order.customerInfo?.name || "Customer",
            amount: `৳${(order.total || 0).toLocaleString()}`,
            status: order.status || "pending",
            date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "",
          }))
        );
      }
      if (customersResult.status === "fulfilled" && customersResult.value?.success) {
        setCustomerCount(customersResult.value.total || 0);
      }
    });
  }, []);

  const requirementRows = setupChecklist.map((requirement) => ({
    ...requirement,
    complete: getRequirementStatus(requirement, {
      productCount: products.length,
      store,
    }),
  }));
  const completedRequirements = requirementRows.filter((r) => r.complete).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#1d4ed8]/30 border-t-[#1d4ed8] rounded-full animate-spin" />
      </div>
    );
  }

  // Empty state when no store exists
  if (!store) {
    return (
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user ? `Welcome, ${user.name.split(" ")[0]}` : "Dashboard"}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Let&apos;s get your store set up.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#1d4ed8]/10 flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8 text-[#1d4ed8]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Create Your First Store</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            You don&apos;t have a store yet. Choose a template and launch your online business in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1d4ed8] text-white rounded-xl hover:bg-[#1e40af] transition-colors text-sm font-medium shadow-sm"
            >
              <Rocket size={16} />
              Browse Templates
            </Link>
            <Link
              href="/dashboard/upload-template"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <UploadCloud size={16} />
              Upload Custom Template
            </Link>
          </div>
        </div>

        {/* Quick Stats Placeholder */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Revenue", value: "৳0", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Orders Pending", value: "0", icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Products", value: "0", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Customers", value: "0", icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 opacity-60">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {store.name} — {templateName || "No template"}
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors text-sm font-medium shadow-sm"
          >
            <Plus size={16} />
            Add Product
          </Link>
          {store && (
            <Link
              href={`/store/${store.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Eye size={16} />
              View Store
            </Link>
          )}
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revenue", value: `৳${revenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Orders Pending", value: pendingOrders.toString(), icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Products", value: products.length.toString(), icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Customers", value: customerCount.toString(), icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg}`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <TrendingUp size={14} className="text-gray-300" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Main Grid ─── */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 mb-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Setup Checklist (only show if incomplete) */}
          {requirementRows.length > 0 && completedRequirements < requirementRows.length && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-gray-900">Setup Your Store</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {completedRequirements}/{requirementRows.length} tasks completed
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1d4ed8] rounded-full transition-all duration-500"
                      style={{ width: `${(completedRequirements / requirementRows.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    {Math.round((completedRequirements / requirementRows.length) * 100)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {requirementRows.map((req) => (
                  <Link
                    key={req.id}
                    href={req.href}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      req.complete
                        ? "border-green-100 bg-green-50/50"
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    {req.complete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${req.complete ? "text-green-800" : "text-gray-900"}`}>
                        {req.label}
                      </p>
                      {req.description && (
                        <p className="text-xs text-gray-500 truncate">{req.description}</p>
                      )}
                    </div>
                    {!req.complete && <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions Grid */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Products", href: "/dashboard/products", icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
                { label: "Orders", href: "/dashboard/orders", icon: Package, color: "text-indigo-600 bg-indigo-50" },
                { label: "Customize", href: "/dashboard/customize", icon: Palette, color: "text-pink-600 bg-pink-50" },
                { label: "Coupons", href: "/dashboard/coupons", icon: Tag, color: "text-purple-600 bg-purple-50" },
                { label: "Customers", href: "/dashboard/customers", icon: Users, color: "text-green-600 bg-green-50" },
                { label: "Couriers", href: "/dashboard/couriers", icon: Truck, color: "text-orange-600 bg-orange-50" },
                { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, color: "text-emerald-600 bg-emerald-50" },
                { label: "Templates", href: "/dashboard/upload-template", icon: UploadCloud, color: "text-gray-600 bg-gray-100" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                    <action.icon size={18} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/dashboard/orders" className="text-xs text-[#1d4ed8] hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No orders yet</p>
                <p className="text-xs text-gray-400 mt-1">Orders will appear here after customers check out.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-400 uppercase border-b border-gray-100">
                      <th className="pb-3 pr-4">Order</th>
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Amount</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 font-mono text-xs text-[#1d4ed8]">{order.id}</td>
                        <td className="py-3 pr-4 text-gray-900">{order.customer}</td>
                        <td className="py-3 pr-4 font-semibold text-gray-900">{order.amount}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            order.status === "delivered" ? "bg-green-50 text-green-700"
                            : order.status === "cancelled" ? "bg-red-50 text-red-700"
                            : "bg-blue-50 text-blue-700"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 text-xs">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Live Store Preview */}
          {store && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 text-sm">Live Preview</h2>
                <Link
                  href={`/store/${store.id}`}
                  target="_blank"
                  className="text-xs text-[#1d4ed8] hover:underline flex items-center gap-1"
                >
                  Open <ExternalLink size={12} />
                </Link>
              </div>
              <div className="aspect-[9/12] bg-gray-50 relative overflow-hidden rounded-b-xl">
                <iframe
                  src={`/store/${store.id}`}
                  title={`${store.name} preview`}
                  className="absolute left-0 top-0 h-[200%] w-[200%] origin-top-left scale-50 border-0 pointer-events-none"
                />
              </div>
            </div>
          )}

          {/* Recent Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-sm">Recent Products</h2>
              <Link href="/dashboard/products" className="text-xs text-[#1d4ed8] hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-6">
                <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 mb-2">No products yet</p>
                <Link href="/dashboard/products/new" className="text-xs text-[#1d4ed8] hover:underline">
                  Add your first product
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {products.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/products/${p.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {p.images && p.images[0] ? (
                      <img src={p.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-100" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                        <ShoppingBag size={14} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">Stock: {p.stock}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">৳{p.price.toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Store Info Card */}
          {store && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 text-sm mb-3">Store Info</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Template</span>
                  <span className="font-medium text-gray-900">{templateName || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Products</span>
                  <span className="font-medium text-gray-900">{products.length}</span>
                </div>
                {lowStock > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Low Stock</span>
                    <span className="font-medium text-orange-600">{lowStock} items</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
