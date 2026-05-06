"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "../DashboardContext";
import {
  MapPin, Search, Package, Clock, CheckCircle2, Truck, XCircle, Box,
  ChevronDown, ChevronUp, Eye, ArrowRight, Copy, Check, Filter,
} from "lucide-react";

interface TrackingOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  shipping: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    trackingCode?: string;
    deliveredAt?: string;
  } | null;
  items: { id: string; name: string; quantity: number; price: number; image: string | null }[];
}

const STATUS_FLOW = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

const statusMeta: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  PENDING: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Pending" },
  CONFIRMED: { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", label: "Confirmed" },
  PROCESSING: { icon: Box, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200", label: "Processing" },
  SHIPPED: { icon: Truck, color: "text-purple-600", bg: "bg-purple-50 border-purple-200", label: "Shipped" },
  DELIVERED: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "Delivered" },
  CANCELLED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "Cancelled" },
};

function formatBDT(n: number) {
  return `৳${Math.round(n).toLocaleString()}`;
}

function TrackingTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_FLOW.indexOf(status);
  const isCancelled = status === "CANCELLED";

  return (
    <div className="flex items-center gap-0 w-full">
      {STATUS_FLOW.map((s, i) => {
        const meta = statusMeta[s];
        const Icon = meta.icon;
        const isCompleted = !isCancelled && i <= currentIdx;
        const isCurrent = !isCancelled && i === currentIdx;

        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCurrent
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110"
                    : isCompleted
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-white text-slate-300"
                }`}
              >
                <Icon size={16} />
              </div>
              <span className={`text-[10px] mt-1.5 font-medium ${isCurrent ? "text-emerald-700" : isCompleted ? "text-emerald-600" : "text-slate-400"}`}>
                {meta.label}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${isCompleted && i < currentIdx ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
      {isCancelled && (
        <div className="flex flex-col items-center ml-4">
          <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-red-500 bg-red-500 text-white shadow-lg shadow-red-500/30">
            <XCircle size={16} />
          </div>
          <span className="text-[10px] mt-1.5 font-medium text-red-600">Cancelled</span>
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  const { activeStore } = useDashboard();
  const storeId = activeStore?.id;
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!storeId) { setLoading(false); return; }
    fetch(`/api/${storeId}/orders`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId]);

  const handleAddTracking = async (orderId: string) => {
    const code = trackingInputs[orderId];
    if (!code?.trim() || !storeId) return;
    try {
      const res = await fetch(`/api/${storeId}/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode: code.trim(), status: "SHIPPED" }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: "SHIPPED", shipping: o.shipping ? { ...o.shipping, trackingCode: code.trim() } : null }
              : o
          )
        );
        setTrackingInputs((prev) => ({ ...prev, [orderId]: "" }));
      }
    } catch {}
  };

  const copyTrackingCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.shipping?.trackingCode?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || o.status === filter;
    return matchSearch && matchFilter;
  });

  const trackableOrders = orders.filter((o) => !["CANCELLED"].includes(o.status));
  const shippedCount = orders.filter((o) => o.status === "SHIPPED").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const needsTrackingCount = orders.filter((o) => ["CONFIRMED", "PROCESSING"].includes(o.status)).length;

  if (!storeId) {
    return (
      <div className="text-center py-24">
        <MapPin className="mx-auto text-slate-300 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Store Selected</h2>
        <p className="text-slate-500">Select a store to view order tracking.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin size={24} className="text-purple-600" /> Order Tracking
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage shipment status for all orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Trackable", value: trackableOrders.length, color: "text-blue-600", bg: "bg-blue-50", icon: Package },
          { label: "Needs Tracking", value: needsTrackingCount, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
          { label: "In Transit", value: shippedCount, color: "text-purple-600", bg: "bg-purple-50", icon: Truck },
          { label: "Delivered", value: deliveredCount, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              placeholder="Search by order number or tracking code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {["all", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filter === s ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {s === "all" ? "All" : statusMeta[s]?.label || s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200/80">
          <MapPin className="mx-auto text-slate-300 mb-4" size={40} />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No orders found</h3>
          <p className="text-sm text-slate-500">Orders will appear here when customers make purchases.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const isExpanded = expanded === order.id;
            const meta = statusMeta[order.status] || statusMeta.PENDING;
            const Icon = meta.icon;

            return (
              <div key={order.id} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden hover:shadow-md transition-all">
                <button
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.bg.split(" ")[0]}`}>
                      <Icon size={18} className={meta.color} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-slate-900">{order.orderNumber}</p>
                      <p className="text-xs text-slate-400">{order.shipping?.name || "—"} · {order.shipping?.district || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.shipping?.trackingCode && (
                      <span className="hidden sm:inline px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[11px] font-semibold border border-purple-200">
                        🚚 {order.shipping.trackingCode}
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${meta.bg}`}>
                      {meta.label}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{formatBDT(Number(order.total))}</span>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/30 space-y-5">
                    {/* Timeline */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                      <h4 className="text-sm font-semibold text-slate-700 mb-4">Order Progress</h4>
                      <TrackingTimeline status={order.status} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Shipping Info */}
                      {order.shipping && (
                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <MapPin size={14} className="text-slate-400" /> Delivery Address
                          </h4>
                          <div className="text-sm space-y-1">
                            <p className="font-medium text-slate-900">{order.shipping.name}</p>
                            <p className="text-slate-500">{order.shipping.phone}</p>
                            <p className="text-slate-500">{order.shipping.address}</p>
                            <p className="text-slate-500">{order.shipping.city}, {order.shipping.district}</p>
                          </div>
                        </div>
                      )}

                      {/* Tracking Code */}
                      <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <Truck size={14} className="text-slate-400" /> Tracking Info
                        </h4>
                        {order.shipping?.trackingCode ? (
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 bg-slate-100 rounded-lg text-sm font-mono text-slate-700">
                              {order.shipping.trackingCode}
                            </code>
                            <button
                              onClick={() => copyTrackingCode(order.shipping!.trackingCode!, order.id)}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                            >
                              {copied === order.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-slate-400">No tracking code yet</p>
                            {["CONFIRMED", "PROCESSING", "PENDING"].includes(order.status) && (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Enter tracking code..."
                                  value={trackingInputs[order.id] || ""}
                                  onChange={(e) => setTrackingInputs((p) => ({ ...p, [order.id]: e.target.value }))}
                                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                />
                                <button
                                  onClick={() => handleAddTracking(order.id)}
                                  disabled={!trackingInputs[order.id]?.trim()}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                >
                                  Ship
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
