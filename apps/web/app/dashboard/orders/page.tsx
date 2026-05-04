"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Package, Eye, ChevronDown, ChevronUp, MapPin, CreditCard, Clock, CheckCircle2, XCircle, Truck, Box } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDashboard } from "../DashboardContext";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

interface Shipping {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
}

interface Order {
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
  shipping: Shipping | null;
}

function formatBDT(amount: number): string {
  const num = Math.round(Number(amount));
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `৳${formatted}`;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  PENDING: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  CONFIRMED: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  PROCESSING: { color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Box },
  SHIPPED: { color: "bg-purple-50 text-purple-700 border-purple-200", icon: Truck },
  DELIVERED: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  CANCELLED: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  RETURNED: { color: "bg-orange-50 text-orange-700 border-orange-200", icon: Package },
};

const paymentColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-orange-50 text-orange-700 border-orange-200",
  PARTIAL: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function OrdersPage() {
  const { activeStore } = useDashboard();
  const storeId = activeStore?.id;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!storeId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/${storeId}/orders`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [storeId]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: string) => {
    const d = new Date(date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const h = hours % 12 || 12;
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${h}:${minutes} ${ampm}`;
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    if (!storeId) return;
    try {
      const res = await fetch(`/api/${storeId}/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch {
      // Handle error
    }
  };

  const statusCounts = {
    all: orders.length,
    PENDING: orders.filter(o => o.status === "PENDING").length,
    CONFIRMED: orders.filter(o => o.status === "CONFIRMED").length,
    PROCESSING: orders.filter(o => o.status === "PROCESSING").length,
    SHIPPED: orders.filter(o => o.status === "SHIPPED").length,
    DELIVERED: orders.filter(o => o.status === "DELIVERED").length,
    CANCELLED: orders.filter(o => o.status === "CANCELLED").length,
  };

  if (!storeId) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="text-slate-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Store Selected</h2>
        <p className="text-slate-500 mb-4">Select a store from the sidebar to view orders.</p>
        <Link href="/dashboard" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search by order number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {(["all", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {status === "all" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                <span className={`ml-1.5 text-xs ${statusFilter === status ? "text-emerald-200" : "text-slate-400"}`}>
                  {statusCounts[status]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/80">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No orders yet</h3>
          <p className="text-slate-500 text-sm">Orders will appear here when customers make purchases.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const sConfig = statusConfig[order.status] || statusConfig.PENDING;
            const StatusIcon = sConfig.icon;

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-md transition-all duration-200">
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${sConfig.color.split(" ")[0]}`}>
                      <StatusIcon size={18} className={sConfig.color.split(" ")[1]} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-slate-900">{order.orderNumber}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${sConfig.color}`}>
                      {order.status}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${paymentColors[order.paymentStatus] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                      {order.paymentStatus}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{formatBDT(Number(order.total))}</span>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/30">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Items */}
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
                          <Package size={14} className="text-slate-400" /> Order Items
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100">
                              <div className="w-11 h-11 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Package size={14} />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                                <p className="text-xs text-slate-400">Qty: {item.quantity} × {formatBDT(Number(item.price))}</p>
                              </div>
                              <span className="text-sm font-semibold text-slate-900">{formatBDT(Number(item.price) * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-sm space-y-1.5">
                          <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium text-slate-900">{formatBDT(Number(order.subtotal))}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span className="font-medium text-slate-900">{formatBDT(Number(order.shippingCost))}</span></div>
                          <div className="flex justify-between pt-2 border-t border-slate-200"><span className="font-bold text-slate-900">Total</span><span className="font-bold text-slate-900">{formatBDT(Number(order.total))}</span></div>
                        </div>
                      </div>

                      {/* Shipping & Actions */}
                      <div>
                        {order.shipping && (
                          <div className="mb-5">
                            <h4 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
                              <MapPin size={14} className="text-slate-400" /> Shipping Address
                            </h4>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 text-sm">
                              <p className="font-semibold text-slate-900">{order.shipping.name}</p>
                              <p className="text-slate-500 mt-0.5">{order.shipping.phone}</p>
                              <p className="text-slate-500">{order.shipping.address}</p>
                              <p className="text-slate-500">{order.shipping.city}, {order.shipping.district}</p>
                            </div>
                          </div>
                        )}

                        <div className="mb-5">
                          <h4 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
                            <CreditCard size={14} className="text-slate-400" /> Payment
                          </h4>
                          <div className="bg-white p-4 rounded-xl border border-slate-100 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-700 font-medium">{order.paymentMethod.replace(/_/g, " ")}</span>
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${paymentColors[order.paymentStatus] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm text-slate-900 mb-3">Update Status</h4>
                          <div className="flex flex-wrap gap-2">
                            {(["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const).map((s) => {
                              const cfg = statusConfig[s];
                              return (
                                <button
                                  key={s}
                                  onClick={() => handleUpdateStatus(order.id, s)}
                                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                                    order.status === s
                                      ? "bg-emerald-600 text-white shadow-sm"
                                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                                  }`}
                                >
                                  {s.charAt(0) + s.slice(1).toLowerCase()}
                                </button>
                              );
                            })}
                          </div>
                        </div>
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
