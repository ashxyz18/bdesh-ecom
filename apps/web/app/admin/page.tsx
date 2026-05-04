"use client";

import { useAdmin } from "./AdminContext";
import {
  Users, Store, ShoppingCart, Package, Palette, TrendingUp,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";

export default function AdminOverviewPage() {
  const { stats, loading, refreshStats } = useAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback stats if API failed
  const s = stats || { totalUsers: 0, totalStores: 0, totalOrders: 0, totalProducts: 0, totalTemplates: 0, totalRevenue: 0, recentUsers: 0, recentOrders: 0 };

  const statCards = [
    {
      label: "Total Users",
      value: s.totalUsers.toLocaleString(),
      change: s.recentUsers > 0 ? `+${s.recentUsers} this month` : "No new users",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
      up: s.recentUsers > 0,
    },
    {
      label: "Total Stores",
      value: s.totalStores.toLocaleString(),
      change: "Active stores",
      icon: Store,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      up: true,
    },
    {
      label: "Total Orders",
      value: s.totalOrders.toLocaleString(),
      change: s.recentOrders > 0 ? `+${s.recentOrders} this month` : "No new orders",
      icon: ShoppingCart,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400",
      up: s.recentOrders > 0,
    },
    {
      label: "Total Revenue",
      value: `৳${s.totalRevenue.toLocaleString()}`,
      change: "From paid orders",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
      up: true,
    },
    {
      label: "Total Products",
      value: s.totalProducts.toLocaleString(),
      change: "Across all stores",
      icon: Package,
      color: "from-rose-500 to-red-500",
      bgColor: "bg-rose-500/10",
      textColor: "text-rose-400",
      up: true,
    },
    {
      label: "Templates",
      value: s.totalTemplates.toLocaleString(),
      change: "Available templates",
      icon: Palette,
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-indigo-500/10",
      textColor: "text-indigo-400",
      up: true,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
        <p className="text-slate-400 mt-1">Monitor your e-commerce platform at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                <card.icon size={20} className={card.textColor} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {card.up ? (
                <ArrowUpRight size={14} className="text-emerald-400" />
              ) : (
                <ArrowDownRight size={14} className="text-slate-500" />
              )}
              <span className={`text-xs ${card.up ? "text-emerald-400" : "text-slate-500"}`}>
                {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Upload Template", href: "/admin/templates", desc: "Add a new template" },
            { label: "Manage Stores", href: "/admin/stores", desc: "View all stores" },
            { label: "View Users", href: "/admin/users", desc: "User management" },
            { label: "View Orders", href: "/admin/orders", desc: "All platform orders" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-amber-500/50 hover:bg-slate-900/80 transition-all group"
            >
              <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
