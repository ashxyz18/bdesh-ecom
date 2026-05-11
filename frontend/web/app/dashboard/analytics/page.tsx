"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, ShoppingBag, DollarSign, Users, Package,
  RefreshCw, Loader2, BarChart3, ArrowUp, ArrowDown
} from "lucide-react";
import Link from "next/link";

interface Analytics {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  ordersByStatus: Record<string, number>;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  topProducts: { productId: string; name: string; quantity: number; revenue: number }[];
  courierPerformance: { provider: string; total: number; delivered: number; cancelled: number; rate: number }[];
  paymentMethods: Record<string, number>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [period, setPeriod] = useState("30days");
  const [loading, setLoading] = useState(true);
  const storeId = typeof window !== "undefined" ? localStorage.getItem("storeId") : null;

  const fetchAnalytics = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/analytics?period=${period}`);
      const data = await res.json();
      if (data.success) setAnalytics(data.analytics);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [storeId, period]);

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" />
      </div>
    );
  }

  const mainStats = [
    {
      label: "Total Revenue",
      value: `৳${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600 bg-green-50",
      change: null,
    },
    {
      label: "Total Orders",
      value: analytics.totalOrders.toString(),
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50",
      change: null,
    },
    {
      label: "Avg Order Value",
      value: `৳${analytics.averageOrderValue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-50",
      change: null,
    },
    {
      label: "Conversion Rate",
      value: `${analytics.conversionRate}%`,
      icon: BarChart3,
      color: "text-orange-600 bg-orange-50",
      change: null,
    },
  ];

  const maxRevenue = Math.max(...analytics.revenueByDay.map((d) => d.revenue), 1);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your store performance</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="year">Last year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mainStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        {[
          { label: "Pending", value: analytics.ordersByStatus.pending, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
          { label: "Processing", value: analytics.ordersByStatus.processing, color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Shipped", value: analytics.ordersByStatus.shipped, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
          { label: "Delivered", value: analytics.ordersByStatus.delivered, color: "bg-green-50 text-green-700 border-green-200" },
          { label: "Cancelled", value: analytics.ordersByStatus.cancelled, color: "bg-red-50 text-red-700 border-red-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          <div className="space-y-1">
            {analytics.revenueByDay.slice(-14).map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-20 shrink-0">
                  {new Date(day.date).toLocaleDateString("en-BD", { month: "short", day: "numeric" })}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-[#1d4ed8] h-full rounded-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${Math.max((day.revenue / maxRevenue) * 100, 2)}%` }}
                  >
                    <span className="text-xs text-white font-medium text-right">
                      {day.revenue > 0 ? `৳${(day.revenue / 1000).toFixed(1)}k` : ""}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{day.orders}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-3 pl-24">
            <span>Revenue (bar)</span>
            <span>Orders (number)</span>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
          {analytics.topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1d4ed8] text-white text-xs flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.quantity} sold</p>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">৳{p.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Courier Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Courier Performance</h2>
          {analytics.courierPerformance.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No courier data yet</p>
          ) : (
            <div className="space-y-4">
              {analytics.courierPerformance.map((c) => (
                <div key={c.provider} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium text-gray-700 capitalize">{c.provider}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{c.delivered}/{c.total} delivered</span>
                      <span className="font-medium text-green-600">{c.rate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${c.rate}%` }}
                      />
                    </div>
                    {c.cancelled > 0 && (
                      <p className="text-xs text-red-500 mt-0.5">{c.cancelled} cancelled</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
          <div className="space-y-3">
            {Object.entries(analytics.paymentMethods).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold uppercase">
                    {method === "cod" ? "COD" : method === "bkash" ? "bKash" : method === "nagad" ? "Nagad" : method}
                  </div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{method}</span>
                </div>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}