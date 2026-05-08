"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package, ShoppingCart, DollarSign, TrendingUp, Plus, Store,
  ArrowRight, ExternalLink, BarChart3, Clock, CheckCircle2,
  XCircle, ChevronRight, Zap, Settings, Palette, Star,
  Truck, CreditCard, Globe, Sparkles, ArrowUpRight, ArrowDownRight,
  ShoppingBag, Eye, Wand2, MapPin, Box, Check,
} from "lucide-react";
import { useDashboard } from "./DashboardContext";
import "./dashboard.css";

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
function Sparkline({ data, color = "#3b82f6", width = 80, height = 32 }: { data: number[]; color?: string; width?: number; height?: number }) {
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
    <svg width={width} height={height} className="sparkline-svg overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sparkline-line" />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2} r="3" className="sparkline-dot" />
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
            <div className="w-full relative group" style={{ height: `${barHeight}%`, minHeight: 2 }}>
              <div
                className="w-full transition-all duration-300 hover:opacity-80 cursor-pointer rounded-t-sm"
                style={{
                  height: "100%",
                  background: "linear-gradient(to top, #2563eb, #3b82f6)",
                  borderRadius: "4px 4px 0 0",
                  boxShadow: "0 0 10px rgba(59, 130, 246, 0.3)"
                }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-[10px]"
                  style={{ background: "rgba(11, 17, 32, 0.95)", color: "#F9FAFB", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                  {formatBDT(value)}
                </div>
              </div>
            </div>
            {labels && labels[i] && <span className="text-[10px]" style={{ color: "#94A3B8" }}>{labels[i]}</span>}
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
    <div className="dark-onboarding fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="dark-card-icon" style={{ background: "rgba(59, 130, 246, 0.15)" }}>
            <Sparkles size={18} style={{ color: "#3b82f6" }} />
          </div>
          <div>
            <h3 className="dark-onboarding-title">Get Your Store Ready</h3>
            <p className="dark-onboarding-subtitle">{completed} of {steps.length} complete</p>
          </div>
        </div>
        <span className="text-sm font-bold" style={{ color: "#3b82f6" }}>{Math.round(progress)}%</span>
      </div>
      <div className="dark-progress-container">
        <div className="dark-progress-fill-gradient" style={{ width: `${progress}%` }} />
      </div>
      <div className="space-y-2.5 mt-5">
        {steps.map((step) => (
          <Link key={step.label} href={step.href} className={`flex items-center gap-3 text-sm transition-colors ${step.done ? "text-muted line-through" : "text-primary hover:text-blue-400"}`}>
            {step.done ? <CheckCircle2 size={16} style={{ color: "#10b981" }} /> : <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: "#94A3B8" }} />}
            <span className={step.done ? "line-through" : "font-medium"}>{step.label}</span>
            {!step.done && <ChevronRight size={14} style={{ color: "#94A3B8", marginLeft: "auto" }} />}
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
            cancelledOrders += orders.filter((o: any) => o.status === "CANCELED").length;
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
          <div className="dark-spinner" />
          <span className="text-sm" style={{ color: "#94A3B8" }}>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-24">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(to br, #2563eb, #3b82f6)", boxShadow: "0 8px 32px rgba(37, 99, 235, 0.3)" }}>
          <Store className="text-white" size={36} />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: "#F9FAFB" }}>Welcome to BdeshShop!</h1>
        <p className="mb-8 leading-relaxed" style={{ color: "#94A3B8" }}>Create your first store to start selling online.</p>
        <Link href="/dashboard/new-store" className="dark-btn-primary inline-flex items-center gap-2">
          <Plus size={18} /> Create Your Store
        </Link>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "there";
  const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

  const statCards = [
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "#3b82f6", sparkData: [2, 5, 8, 12, 15, 18, stats.totalProducts], sparkColor: "#3b82f6", trend: `${stats.totalProducts} items`, trendUp: true },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "#10b981", sparkData: [5, 12, 18, 25, 30, 42, stats.totalOrders], sparkColor: "#10b981", trend: `${stats.pendingOrders} pending`, trendUp: stats.pendingOrders === 0 },
    { label: "Revenue", value: formatBDT(stats.revenue), icon: DollarSign, color: "#f59e0b", sparkData: revenueData.length > 0 ? revenueData : [0, 0, 0, 0, 0, 0, 0], sparkColor: "#f59e0b", trend: "This period", trendUp: true },
    { label: "Shipped", value: stats.shippedOrders, icon: Truck, color: "#a855f7", sparkData: [8, 6, 10, 5, 7, 4, stats.shippedOrders], sparkColor: "#a855f7", trend: `${stats.deliveredOrders} delivered`, trendUp: true },
  ];

  const orderStatusBreakdown = [
    { label: "Pending", count: stats.pendingOrders, color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.15)" },
    { label: "Confirmed", count: stats.confirmedOrders, color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.15)" },
    { label: "Processing", count: stats.processingOrders, color: "#6366f1", bgColor: "rgba(99, 102, 241, 0.15)" },
    { label: "Shipped", count: stats.shippedOrders, color: "#a855f7", bgColor: "rgba(168, 85, 247, 0.15)" },
    { label: "Delivered", count: stats.deliveredOrders, color: "#10b981", bgColor: "rgba(16, 185, 129, 0.15)" },
    { label: "Cancelled", count: stats.cancelledOrders, color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.15)" },
  ];
  const maxStatusCount = Math.max(...orderStatusBreakdown.map((s) => s.count), 1);

  const quickActions = [
    { href: "/dashboard/products/new", icon: Package, label: "Add Product", gradient: "from-blue-500 to-blue-600" },
    { href: "/dashboard/orders", icon: ShoppingCart, label: "View Orders", gradient: "from-emerald-500 to-emerald-600" },
    { href: "/dashboard/ai-builder", icon: Wand2, label: "AI Builder", gradient: "from-purple-500 to-purple-600" },
    { href: "/dashboard/tracking", icon: MapPin, label: "Tracking", gradient: "from-amber-500 to-amber-600" },
    { href: "/dashboard/delivery", icon: Truck, label: "Delivery", gradient: "from-rose-500 to-rose-600" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings", gradient: "from-cyan-500 to-cyan-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="dark-welcome-title">{getGreeting()}, {firstName}! 👋</h1>
          <p className="dark-welcome-subtitle">Here's what's happening with your stores today.</p>
        </div>
        <Link href="/dashboard/new-store" className="dark-btn-primary inline-flex items-center gap-2">
          <Plus size={16} /> New Store
        </Link>
      </div>

      {/* Onboarding */}
      <OnboardingChecklist stores={stores} stats={stats} />

      {/* Stats Cards */}
      <div className="dark-grid-4">
        {statCards.map((card) => (
          <div key={card.label} className="dark-card fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="dark-card-title">{card.label}</span>
              <div className="dark-card-icon" style={{ background: `rgba(${card.color === "#3b82f6" ? "59, 130, 246" : card.color === "#10b981" ? "16, 185, 129" : "245, 158, 11"}, 0.15)` }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
            </div>
            <p className="dark-card-value">{card.value}</p>
            <div className="flex items-center justify-between mt-3">
              <div className={`flex items-center gap-1 text-xs font-medium ${card.trendUp ? "text-emerald-400" : "text-amber-400"}`}>
                {card.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {card.trend}
              </div>
              <Sparkline data={card.sparkData} color={card.sparkColor} />
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + Order Status */}
      <div className="dark-grid-3">
        <div className="dark-chart lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="dark-chart-title">Revenue Overview</h2>
              <p className="dark-chart-subtitle">Daily revenue for the past week</p>
            </div>
          </div>
          {revenueData.length > 0 ? (
            <MiniBarChart data={revenueData} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} height={160} />
          ) : (
            <div className="flex items-center justify-center h-40" style={{ color: "#94A3B8", fontSize: "14px" }}>No revenue data yet</div>
          )}
        </div>

        <div className="dark-chart">
          <div className="flex items-center justify-between mb-6">
            <h2 className="dark-chart-title">Order Status</h2>
            <Link href="/dashboard/orders" className="text-sm font-medium flex items-center gap-1" style={{ color: "#3b82f6" }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {orderStatusBreakdown.map((status) => (
              <div key={status.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium" style={{ color: "#F9FAFB" }}>{status.label}</span>
                  <span className="text-sm font-bold" style={{ color: "#F9FAFB" }}>{status.count}</span>
                </div>
                <div className="dark-progress-bg">
                  <div className="dark-progress-fill" style={{ width: `${Math.max((status.count / maxStatusCount) * 100, status.count > 0 ? 8 : 0)}%`, background: status.color, boxShadow: `0 0 10px ${status.color}50)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders + Quick Actions */}
      <div className="dark-grid-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: "#F9FAFB" }}>Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-sm font-medium flex items-center gap-1" style={{ color: "#3b82f6" }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="dark-card overflow-hidden">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart size={32} style={{ color: "rgba(148, 163, 184, 0.3)", margin: "0 auto 12px" }} />
                <p style={{ color: "#94A3B8", fontSize: "14px" }}>No orders yet</p>
              </div>
            ) : (
              <div>
                {recentOrders.map((order) => {
                  const statusMap: Record<string, { icon: any; color: string }> = {
                    PENDING: { icon: Clock, color: "#f59e0b" },
                    CONFIRMED: { icon: CheckCircle2, color: "#3b82f6" },
                    PROCESSING: { icon: Box, color: "#6366f1" },
                    SHIPPED: { icon: Truck, color: "#a855f7" },
                    DELIVERED: { icon: CheckCircle2, color: "#10b981" },
                    CANCELLED: { icon: XCircle, color: "#ef4444" },
                  };
                  const sm = statusMap[order.status] || statusMap.PENDING;
                  const Icon = sm.icon;
                  return (
                    <Link key={order.id} href="/dashboard/orders" className="dark-row">
                      <div className="flex items-center gap-3">
                        <Icon size={16} style={{ color: sm.color }} />
                        <div>
                          <span className="text-sm font-medium block" style={{ color: "#F9FAFB" }}>{order.orderNumber}</span>
                          <p className="text-xs" style={{ color: "#94A3B8" }}>{formatRelativeTime(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold block" style={{ color: "#F9FAFB" }}>{formatBDT(Number(order.total))}</span>
                        <span className={`dark-badge dark-badge-${order.status === "DELIVERED" ? "emerald" : order.status === "CANCELLED" ? "red" : order.status === "SHIPPED" ? "purple" : order.status === "CONFIRMED" ? "blue" : "amber"}`}>
                          {order.status}
                        </span>
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
          <h2 className="text-lg font-semibold mb-4" style={{ color: "#F9FAFB" }}>Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href} className="dark-action-card">
                <div className="dark-action-icon" style={{ background: `linear-gradient(to br, #2563eb, #3b82f6)` }}>
                  <action.icon size={18} style={{ color: "#F9FAFB" }} />
                </div>
                <span className="dark-action-label">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Store Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "#F9FAFB" }}>Your Stores</h2>
          <Link href="/dashboard/new-store" className="text-sm font-medium flex items-center gap-1" style={{ color: "#3b82f6" }}>
            <Plus size={14} /> Add Store
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div key={store.id} className="dark-store-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(to br, #2563eb, #3b82f6)", boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)" }}>
                    <Store size={20} style={{ color: "#F9FAFB" }} />
                  </div>
                  <div>
                    <h3 className="dark-store-name">{store.name}</h3>
                    <p className="dark-store-domain">{store.subdomain}.bdesh.shop</p>
                  </div>
                </div>
                <span className={`dark-badge ${store.status === "APPROVED" || store.status === "ACTIVE" ? "dark-badge-emerald" : store.status === "PENDING" ? "dark-badge-amber" : "dark-badge-blue"}`}>{store.status}</span>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard/products" className="flex-1 text-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ background: "rgba(17, 24, 39, 0.6)", color: "#F9FAFB", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Manage
                </Link>
                <a href={`/store?subdomain=${store.subdomain}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5" style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "#F9FAFB", boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)" }}>
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
