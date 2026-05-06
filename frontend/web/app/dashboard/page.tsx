"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package, ShoppingCart, DollarSign, TrendingUp, Plus, Store,
  ArrowRight, ExternalLink, BarChart3, Clock, CheckCircle2,
  XCircle, ChevronRight, Zap, Settings, Palette, Star,
  Truck, CreditCard, Globe, Sparkles, ArrowUpRight, ArrowDownRight,
  ShoppingBag, Eye, Wand2, MapPin, Box,
} from "lucide-react";
import { useDashboard } from "./DashboardContext";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  cancelledOrders: number;
}

function formatBDT(amount: number): string {
  return `৳${Math.round(Number(amount)).toLocaleString()}`;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-BD", { month: "short", day: "numeric" });
}

/* ─── Sparkline SVG Component ─── */
function Sparkline({ data, color = "#22c55e", width = 80, height = 32 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2} r="3" fill={color} />
    </svg>
  );
}

/* ─── Mini Bar Chart ─── */
function MiniBarChart({ data, labels, height = 120 }: { data: number[]; labels?: string[]; height?: number }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5 h-full" style={{ height }}>
      {data.map((value, i) => {
        const barHeight = (value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative group">
              <div
                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-300 hover:from-emerald-500 hover:to-emerald-300 cursor-pointer min-h-[2px]"
                style={{ height: `${barHeight}%`, minHeight: 2 }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {formatBDT(value)}
              </div>
            </div>
            {labels && labels[i] && <span className="text-[10px] text-slate-400">{labels[i]}</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Onboarding Checklist ─── */
function OnboardingChecklist({ stores, stats }: { stores: any[]; stats: DashboardStats }) {
  const steps = [
    { label: "Create your store", done: stores.length > 0, href: "/dashboard/new-store" },
    { label: "Add your first product", done: stats.totalProducts > 0, href: "/dashboard/products/new" },
    { label: "Customize your store design", done: false, href: "/dashboard/ai-builder" },
    { label: "Set up payment methods", done: false, href: "/dashboard/settings" },
    { label: "Add delivery partners", done: false, href: "/dashboard/delivery" },
  ];
  const completed = steps.filter((s) => s.done).length;
  const progress = (completed / steps.length) * 100;
  if (completed === steps.length) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Get Your Store Ready</h3>
            <p className="text-sm text-slate-500">{completed} of {steps.length} complete</p>
          </div>
        </div>
        <span className="text-sm font-bold text-emerald-600">{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-2 bg-emerald-100 rounded-full mb-5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="space-y-2.5">
        {steps.map((step) => (
          <Link key={step.label} href={step.href} className={`flex items-center gap-3 text-sm transition-colors ${step.done ? "text-slate-400" : "text-slate-700 hover:text-emerald-600"}`}>
            {step.done ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />}
            <span className={step.done ? "line-through" : "font-medium"}>{step.label}</span>
            {!step.done && <ChevronRight size={14} className="ml-auto text-slate-300" />}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function DashboardPage() {
  const { stores, activeStore, user } = useDashboard();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0, totalOrders: 0, revenue: 0, pendingOrders: 0,
    deliveredOrders: 0, confirmedOrders: 0, processingOrders: 0,
    shippedOrders: 0, cancelledOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (stores.length === 0) { setLoading(false); return; }
      let totalProducts = 0, totalOrders = 0, revenue = 0, pendingOrders = 0, deliveredOrders = 0, confirmedOrders = 0, processingOrders = 0, shippedOrders = 0, cancelledOrders = 0;
      const allOrders: any[] = [];

      for (const store of stores) {
        try {
          const prodRes = await fetch(`/api/${store.id}/products`);
          if (prodRes.ok) { const d = await prodRes.json(); totalProducts += d.products?.length || 0; }
          const orderRes = await fetch(`/api/${store.id}/orders`);
          if (orderRes.ok) {
            const d = await orderRes.json();
            const orders = d.orders || [];
            totalOrders += orders.length;
            revenue += orders.reduce((s: number, o: any) => o.status !== "CANCELLED" ? s + Number(o.total) : s, 0);
            pendingOrders += orders.filter((o: any) => o.status === "PENDING").length;
            deliveredOrders += orders.filter((o: any) => o.status === "DELIVERED").length;
            confirmedOrders += orders.filter((o: any) => o.status === "CONFIRMED").length;
            processingOrders += orders.filter((o: any) => o.status === "PROCESSING").length;
            shippedOrders += orders.filter((o: any) => o.status === "SHIPPED").length;
            cancelledOrders += orders.filter((o: any) => o.status === "CANCELLED").length;
            orders.slice(0, 5).forEach((o: any) => allOrders.push({ ...o, storeName: store.name }));
          }
        } catch {}
      }

      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const mockRevenue = Array.from({ length: 7 }, () => Math.floor(Math.random() * revenue * 0.3 + revenue * 0.05));
      setStats({ totalProducts, totalOrders, revenue, pendingOrders, deliveredOrders, confirmedOrders, processingOrders, shippedOrders, cancelledOrders });
      setRecentOrders(allOrders.slice(0, 5));
      setRevenueData(mockRevenue);
      setLoading(false);
    }
    fetchData();
  }, [stores]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-24">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-600/30">
          <Store className="text-white" size={36} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Welcome to BdeshShop!</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">Create your first store to start selling online.</p>
        <Link href="/dashboard/new-store" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/25">
          <Plus size={18} /> Create Your Store
        </Link>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "there";
  const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

  const statCards = [
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "text-blue-600", iconBg: "bg-blue-50", sparkData: [2, 5, 8, 12, 15, 18, stats.totalProducts], sparkColor: "#3b82f6", trend: `${stats.totalProducts} items`, trendUp: true },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-emerald-600", iconBg: "bg-emerald-50", sparkData: [5, 12, 18, 25, 30, 42, stats.totalOrders], sparkColor: "#22c55e", trend: `${stats.pendingOrders} pending`, trendUp: stats.pendingOrders === 0 },
    { label: "Revenue", value: formatBDT(stats.revenue), icon: DollarSign, color: "text-amber-600", iconBg: "bg-amber-50", sparkData: revenueData.length > 0 ? revenueData : [0, 0, 0, 0, 0, 0, 0], sparkColor: "#f59e0b", trend: "This period", trendUp: true },
    { label: "Shipped", value: stats.shippedOrders, icon: Truck, color: "text-purple-600", iconBg: "bg-purple-50", sparkData: [8, 6, 10, 5, 7, 4, stats.shippedOrders], sparkColor: "#a855f7", trend: `${stats.deliveredOrders} delivered`, trendUp: true },
  ];

  const orderStatusBreakdown = [
    { label: "Pending", count: stats.pendingOrders, color: "bg-amber-500", bgColor: "bg-amber-100" },
    { label: "Confirmed", count: stats.confirmedOrders, color: "bg-blue-500", bgColor: "bg-blue-100" },
    { label: "Processing", count: stats.processingOrders, color: "bg-indigo-500", bgColor: "bg-indigo-100" },
    { label: "Shipped", count: stats.shippedOrders, color: "bg-purple-500", bgColor: "bg-purple-100" },
    { label: "Delivered", count: stats.deliveredOrders, color: "bg-emerald-500", bgColor: "bg-emerald-100" },
    { label: "Cancelled", count: stats.cancelledOrders, color: "bg-red-500", bgColor: "bg-red-100" },
  ];
  const maxStatusCount = Math.max(...orderStatusBreakdown.map((s) => s.count), 1);

  const quickActions = [
    { href: "/dashboard/products/new", icon: Package, label: "Add Product", color: "from-blue-500 to-blue-600" },
    { href: "/dashboard/orders", icon: ShoppingCart, label: "View Orders", color: "from-emerald-500 to-emerald-600" },
    { href: "/dashboard/ai-builder", icon: Wand2, label: "AI Builder", color: "from-purple-500 to-purple-600" },
    { href: "/dashboard/tracking", icon: MapPin, label: "Tracking", color: "from-amber-500 to-amber-600" },
    { href: "/dashboard/delivery", icon: Truck, label: "Delivery", color: "from-rose-500 to-rose-600" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings", color: "from-cyan-500 to-cyan-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{getGreeting()}, {firstName}! 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's what's happening with your stores today.</p>
        </div>
        <Link href="/dashboard/new-store" className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
          <Plus size={16} /> New Store
        </Link>
      </div>

      {/* Onboarding */}
      <OnboardingChecklist stores={stores} stats={stats} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} group-hover:scale-110 transition-transform`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-2">{card.value}</p>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1 text-xs font-medium ${card.trendUp ? "text-emerald-600" : "text-amber-600"}`}>
                {card.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {card.trend}
              </div>
              <Sparkline data={card.sparkData} color={card.sparkColor} />
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + Order Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Revenue Overview</h2>
              <p className="text-sm text-slate-500">Daily revenue for the past week</p>
            </div>
          </div>
          {revenueData.length > 0 ? (
            <MiniBarChart data={revenueData} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} height={160} />
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No revenue data yet</div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Order Status</h2>
            <Link href="/dashboard/orders" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {orderStatusBreakdown.map((status) => (
              <div key={status.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">{status.label}</span>
                  <span className="text-sm font-bold text-slate-900">{status.count}</span>
                </div>
                <div className={`w-full h-2 rounded-full ${status.bgColor}`}>
                  <div className={`h-full rounded-full ${status.color} transition-all duration-500`} style={{ width: `${Math.max((status.count / maxStatusCount) * 100, status.count > 0 ? 8 : 0)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart className="mx-auto text-slate-300 mb-3" size={32} />
                <p className="text-sm text-slate-500">No orders yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentOrders.map((order) => {
                  const statusMap: Record<string, { icon: typeof Clock; color: string }> = {
                    PENDING: { icon: Clock, color: "text-amber-500" },
                    CONFIRMED: { icon: CheckCircle2, color: "text-blue-500" },
                    PROCESSING: { icon: Box, color: "text-indigo-500" },
                    SHIPPED: { icon: Truck, color: "text-purple-500" },
                    DELIVERED: { icon: CheckCircle2, color: "text-emerald-500" },
                    CANCELLED: { icon: XCircle, color: "text-red-500" },
                  };
                  const sm = statusMap[order.status] || statusMap.PENDING;
                  const Icon = sm.icon;
                  return (
                    <Link key={order.id} href="/dashboard/orders" className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={sm.color} />
                        <div>
                          <span className="text-sm font-medium text-slate-900">{order.orderNumber}</span>
                          <p className="text-xs text-slate-400">{formatRelativeTime(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-900">{formatBDT(Number(order.total))}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          order.status === "CANCELLED" ? "bg-red-50 text-red-700 border-red-200" :
                          order.status === "SHIPPED" ? "bg-purple-50 text-purple-700 border-purple-200" :
                          "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>{order.status}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href} className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300 group">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <action.icon size={18} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-900">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Store Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Your Stores</h2>
          <Link href="/dashboard/new-store" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            <Plus size={14} /> Add Store
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                    <Store size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{store.name}</h3>
                    <p className="text-xs text-slate-400">{store.subdomain}.bdesh.shop</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  store.status === "APPROVED" || store.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  store.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200"
                }`}>{store.status}</span>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard/products" className="flex-1 text-center px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  Manage
                </Link>
                <a href={`/store?subdomain=${store.subdomain}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-3 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5">
                  <ExternalLink size={13} /> View
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
