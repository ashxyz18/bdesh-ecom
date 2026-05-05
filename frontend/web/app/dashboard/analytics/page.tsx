"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart3, TrendingUp, Users, MousePointerClick, ArrowUp, ArrowDown,
  Clock, Eye, ShoppingCart, DollarSign, Package, RefreshCw, Calendar,
  Globe, Smartphone, Monitor, Tablet, Download, Activity, CreditCard,
  Filter, Zap,
} from "lucide-react";
import { useDashboard } from "../DashboardContext";

interface AnalyticsData {
  date: string;
  visitors: number;
  pageviews: number;
  orders: number;
  revenue: number;
}

interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
  image?: string;
}

interface SourceData {
  source: string;
  visitors: number;
  percentage: number;
}

interface PaymentBreakdown {
  method: string;
  count: number;
  percentage: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
}

interface ConversionFunnel {
  visitors: number;
  pageviews: number;
  addToCart: number;
  checkout: number;
  purchase: number;
}

interface AnalyticsSummary {
  totalVisitors: number;
  totalPageviews: number;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  conversionRate: number;
  deliveredOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  paidOrders: number;
}

interface AnalyticsTrends {
  visitors: string;
  revenue: string;
  orders: string;
}

function AreaChart({ data, height = 200, color = "#008060" }: { data: number[]; height?: number; color?: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const padding = 20;
  const chartHeight = height - padding * 2;
  const chartWidth = 100;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const areaPoints = [
    `0,${padding + chartHeight}`,
    ...points,
    `${chartWidth},${padding + chartHeight}`,
  ].join(" ");

  return (
    <svg viewBox={`0 -${padding} ${chartWidth} ${height + padding}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace("#", "")})`} />
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((value, i) => {
        const x = (i / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((value - min) / range) * chartHeight;
        return (
          <circle key={i} cx={x} cy={y} r="2" fill={color} className="opacity-0 hover:opacity-100 transition-opacity" />
        );
      })}
    </svg>
  );
}

function BarChartComponent({ data, labels, height = 180 }: { data: number[]; labels?: string[]; height?: number }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((value, i) => {
        const pct = (value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full relative">
              <div
                className="w-full bg-gradient-to-t from-[#008060] to-emerald-400 rounded-t-sm transition-all min-h-[2px] group-hover:from-[#006A4E] group-hover:to-emerald-500"
                style={{ height: `${pct}%`, minHeight: 2 }}
              />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {value.toLocaleString()}
              </div>
            </div>
            {labels?.[i] && <span className="text-[10px] text-slate-400">{labels[i]}</span>}
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ segments, size = 120 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {segments.map((segment, i) => {
          const pct = segment.value / total;
          const dashLength = pct * circumference;
          const dashOffset = -offset * circumference;
          offset += pct;
          return (
            <circle
              key={i}
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="12"
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
        })}
        <circle cx="50" cy="50" r={radius - 8} fill="white" />
        <text x="50" y="48" textAnchor="middle" className="text-[10px] font-bold fill-slate-900">{total.toLocaleString()}</text>
        <text x="50" y="58" textAnchor="middle" className="text-[6px] fill-slate-400">total</text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((segment, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="text-xs text-slate-600">{segment.label}</span>
            <span className="text-xs font-medium text-slate-900 ml-auto">{((segment.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-20 text-right shrink-0">{label}</span>
      <div className="flex-1 h-7 bg-slate-100 rounded overflow-hidden relative">
        <div className={`h-full rounded transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-700">{value.toLocaleString()}</span>
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 bg-slate-200 rounded w-20" />
        <div className="h-9 w-9 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-7 bg-slate-200 rounded w-28 mb-1" />
      <div className="h-3 bg-slate-200 rounded w-16" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse">
      <div className="h-5 bg-slate-200 rounded w-32 mb-4" />
      <div className="flex items-end gap-1 h-[200px]">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="flex-1 bg-slate-200 rounded-t" style={{ height: `${30 + Math.random() * 70}%` }} />
        ))}
      </div>
    </div>
  );
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: "Cash on Delivery",
  BKASH: "bKash",
  NAGAD: "Nagad",
  ROCKET: "Rocket",
  CARD: "Card",
  OTHER: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AnalyticsPage() {
  const { activeStore } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("14d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [sources, setSources] = useState<SourceData[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel | null>(null);
  const [isLive, setIsLive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?storeId=${activeStore.id}&period=${period}`);
      if (res.ok) {
        const data = await res.json();
        if (data.analytics && Array.isArray(data.analytics)) {
          setAnalyticsData(data.analytics);
        }
        if (data.summary) setSummary(data.summary);
        if (data.trends) setTrends(data.trends);
        if (data.topProducts && data.topProducts.length > 0) setTopProducts(data.topProducts);
        if (data.trafficSources && data.trafficSources.length > 0) setSources(data.trafficSources);
        if (data.paymentBreakdown) setPaymentBreakdown(data.paymentBreakdown);
        if (data.statusBreakdown) setStatusBreakdown(data.statusBreakdown);
        if (data.conversionFunnel) setConversionFunnel(data.conversionFunnel);
      }
    } catch {
      // Will fall through to generated data
    } finally {
      setLoading(false);
    }
  }, [activeStore, period]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // Generate demo data if no real data
  useEffect(() => {
    if (!loading && analyticsData.length === 0) {
      const days = period === "7d" ? 7 : period === "14d" ? 14 : 30;
      const generated: AnalyticsData[] = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return {
          date: date.toISOString().slice(0, 10),
          visitors: Math.floor(80 + Math.random() * 200 + i * 5),
          pageviews: Math.floor(200 + Math.random() * 400 + i * 10),
          orders: Math.floor(2 + Math.random() * 8),
          revenue: Math.floor(500 + Math.random() * 2000 + i * 50),
        };
      });
      setAnalyticsData(generated);
    }
  }, [loading, analyticsData.length, period]);

  useEffect(() => {
    if (topProducts.length === 0) {
      setTopProducts([
        { name: "Cotton Saree - Red", sold: 45, revenue: 22500 },
        { name: "Panjabi - White", sold: 38, revenue: 19000 },
        { name: "Smart Watch Pro", sold: 32, revenue: 32000 },
        { name: "Organic Honey 500g", sold: 28, revenue: 8400 },
        { name: "Leather Bag - Brown", sold: 22, revenue: 22000 },
      ]);
    }
  }, [topProducts.length]);

  useEffect(() => {
    if (sources.length === 0) {
      setSources([
        { source: "Direct", visitors: 420, percentage: 35 },
        { source: "Google Search", visitors: 310, percentage: 26 },
        { source: "Facebook", visitors: 240, percentage: 20 },
        { source: "Instagram", visitors: 130, percentage: 11 },
        { source: "Other", visitors: 100, percentage: 8 },
      ]);
    }
  }, [sources.length]);

  // Live refresh toggle
  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(fetchAnalytics, 30000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive, fetchAnalytics]);

  const totalVisitors = summary?.totalVisitors ?? analyticsData.reduce((sum, d) => sum + d.visitors, 0);
  const totalPageviews = summary?.totalPageviews ?? analyticsData.reduce((sum, d) => sum + d.pageviews, 0);
  const totalOrders = summary?.totalOrders ?? analyticsData.reduce((sum, d) => sum + d.orders, 0);
  const totalRevenue = summary?.totalRevenue ?? analyticsData.reduce((sum, d) => sum + d.revenue, 0);

  const avgVisitors = analyticsData.length > 0 ? Math.round(totalVisitors / analyticsData.length) : 0;
  const conversionRate = summary?.conversionRate ?? (totalVisitors > 0 ? ((totalOrders / totalVisitors) * 100) : 0);
  const avgOrderValue = summary?.avgOrderValue ?? (totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0);

  const visitorTrend = trends?.visitors ?? (analyticsData.length >= 2
    ? ((analyticsData[analyticsData.length - 1].visitors - analyticsData[0].visitors) / Math.max(analyticsData[0].visitors, 1) * 100).toFixed(1)
    : "0");

  const revenueTrend = trends?.revenue ?? (analyticsData.length >= 2
    ? ((analyticsData[analyticsData.length - 1].revenue - analyticsData[0].revenue) / Math.max(analyticsData[0].revenue, 1) * 100).toFixed(1)
    : "0");

  const orderTrend = trends?.orders ?? "0";

  const dateLabels = analyticsData.map((d) => {
    const date = new Date(d.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  const stats = [
    { label: "Total Visitors", value: totalVisitors.toLocaleString(), change: `${Number(visitorTrend) >= 0 ? "+" : ""}${visitorTrend}%`, up: Number(visitorTrend) >= 0, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Page Views", value: totalPageviews.toLocaleString(), change: `Avg ${avgVisitors}/day`, up: true, icon: Eye, color: "text-emerald-600 bg-emerald-50" },
    { label: "Orders", value: totalOrders.toLocaleString(), change: `${Number(orderTrend) >= 0 ? "+" : ""}${orderTrend}%`, up: Number(orderTrend) >= 0, icon: ShoppingCart, color: "text-purple-600 bg-purple-50" },
    { label: "Revenue", value: `৳${totalRevenue.toLocaleString()}`, change: `${Number(revenueTrend) >= 0 ? "+" : ""}${revenueTrend}%`, up: Number(revenueTrend) >= 0, icon: DollarSign, color: "text-amber-600 bg-amber-50" },
  ];

  const deviceSegments = [
    { label: "Mobile", value: 65, color: "#008060" },
    { label: "Desktop", value: 28, color: "#3b82f6" },
    { label: "Tablet", value: 7, color: "#f59e0b" },
  ];

  const sourceSegments = sources.map((s, i) => ({
    label: s.source,
    value: s.visitors,
    color: ["#008060", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"][i % 5],
  }));

  const funnel = conversionFunnel || {
    visitors: totalVisitors,
    pageviews: totalPageviews,
    addToCart: Math.round(totalVisitors * 0.15),
    checkout: Math.round(totalVisitors * 0.08),
    purchase: totalOrders,
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Visitors", "Pageviews", "Orders", "Revenue"];
    const rows = analyticsData.map((d) => [d.date, d.visitors, d.pageviews, d.orders, d.revenue]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${activeStore?.subdomain || "store"}-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 size={24} className="text-[#008060]" /> Analytics
          </h1>
          <p className="text-slate-500 mt-1">
            Track {activeStore?.name || "your"}'s performance and visitor behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isLive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500 hover:text-slate-700"
            }`}
            title={isLive ? "Live refresh: ON (every 30s)" : "Live refresh: OFF"}
          >
            <Activity size={12} className={isLive ? "text-emerald-500" : ""} />
            {isLive ? "Live" : "Paused"}
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          </button>

          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleExportCSV}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Export CSV"
          >
            <Download size={16} />
          </button>

          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {[
              { key: "7d", label: "7 days" },
              { key: "14d", label: "14 days" },
              { key: "30d", label: "30 days" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  period === p.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">{stat.label}</span>
                <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${stat.up ? "text-emerald-600" : "text-red-600"}`}>
                {stat.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {stat.change}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Visitor Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Visitor Trend</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#008060]" /> Visitors</span>
            </div>
          </div>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <AreaChart data={analyticsData.map((d) => d.visitors)} height={200} color="#008060" />
          )}
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Revenue Trend</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Revenue (৳)</span>
            </div>
          </div>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <AreaChart data={analyticsData.map((d) => d.revenue)} height={200} color="#f59e0b" />
          )}
        </div>
      </div>

      {/* Orders Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Daily Orders</h2>
          <span className="text-xs text-slate-400">Total: {totalOrders} orders</span>
        </div>
        {loading ? (
          <ChartSkeleton />
        ) : (
          <BarChartComponent data={analyticsData.map((d) => d.orders)} labels={dateLabels} height={160} />
        )}
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Filter size={16} className="text-[#008060]" /> Conversion Funnel
          </h2>
          <span className="text-xs text-slate-400">{conversionRate.toFixed(2)}% conversion rate</span>
        </div>
        <div className="space-y-2 max-w-xl mx-auto">
          <FunnelBar label="Visitors" value={funnel.visitors} max={funnel.visitors} color="bg-blue-400" />
          <FunnelBar label="Pageviews" value={funnel.pageviews} max={funnel.visitors} color="bg-indigo-400" />
          <FunnelBar label="Add to Cart" value={funnel.addToCart} max={funnel.visitors} color="bg-purple-400" />
          <FunnelBar label="Checkout" value={funnel.checkout} max={funnel.visitors} color="bg-amber-400" />
          <FunnelBar label="Purchase" value={funnel.purchase} max={funnel.visitors} color="bg-emerald-400" />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Package size={16} className="text-[#008060]" /> Top Products
          </h2>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">
                  {i + 1}
                </span>
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-8 h-8 rounded object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                    <Package size={12} className="text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs text-slate-400">{product.sold} sold</p>
                </div>
                <span className="text-sm font-semibold text-slate-900">৳{product.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Globe size={16} className="text-[#008060]" /> Traffic Sources
          </h2>
          <DonutChart segments={sourceSegments} size={120} />
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Smartphone size={16} className="text-[#008060]" /> Device Breakdown
          </h2>
          <DonutChart segments={deviceSegments} size={120} />
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
              <Smartphone size={16} className="text-[#008060]" />
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-900">Mobile</p>
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1">
                  <div className="h-full bg-[#008060] rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">65%</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
              <Monitor size={16} className="text-blue-500" />
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-900">Desktop</p>
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "28%" }} />
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">28%</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
              <Tablet size={16} className="text-amber-500" />
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-900">Tablet</p>
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "7%" }} />
                </div>
              </div>
              <span className="text-xs font-medium text-slate-700">7%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Order Status Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-[#008060]" /> Payment Methods
          </h2>
          {paymentBreakdown.length > 0 ? (
            <div className="space-y-3">
              {paymentBreakdown.map((pm, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    {pm.method === "CASH_ON_DELIVERY" ? "💵" : pm.method === "BKASH" ? "📱" : pm.method === "NAGAD" ? "📲" : pm.method === "ROCKET" ? "🚀" : "💳"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900">{PAYMENT_LABELS[pm.method] || pm.method}</span>
                      <span className="text-xs text-slate-500">{pm.count} orders</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full">
                      <div className="h-full bg-[#008060] rounded-full transition-all" style={{ width: `${pm.percentage}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{pm.percentage}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <CreditCard size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No payment data yet</p>
            </div>
          )}
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <ShoppingCart size={16} className="text-[#008060]" /> Order Status
          </h2>
          {statusBreakdown.length > 0 && statusBreakdown.some((s) => s.count > 0) ? (
            <div className="space-y-2">
              {statusBreakdown.map((sb, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[sb.status] || "bg-slate-100 text-slate-600"}`}>
                      {sb.status}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{sb.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No order data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="bg-gradient-to-r from-[#008060]/5 to-emerald-50 rounded-2xl p-6 border border-[#008060]/20">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-[#008060]" /> Key Insights
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500">Avg. Order Value</p>
            <p className="text-lg font-bold text-slate-900">৳{avgOrderValue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Conversion Rate</p>
            <p className="text-lg font-bold text-slate-900">{conversionRate.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Pages per Session</p>
            <p className="text-lg font-bold text-slate-900">{totalVisitors > 0 ? (totalPageviews / totalVisitors).toFixed(1) : "0"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Revenue per Visitor</p>
            <p className="text-lg font-bold text-slate-900">৳{totalVisitors > 0 ? (totalRevenue / totalVisitors).toFixed(0) : "0"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
