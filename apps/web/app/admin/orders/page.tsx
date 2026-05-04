"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart, Search, ChevronLeft, ChevronRight, Loader2,
  Clock, CheckCircle2, XCircle, Truck, Box, Package,
  CreditCard, DollarSign, Store, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin } from "../AdminContext";

interface OrderStore {
  id: string;
  name: string;
  subdomain: string;
}

interface OrderCustomer {
  id: string;
  name: string;
  email: string;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  store: OrderStore;
  customer: OrderCustomer | null;
  _count: { items: number };
}

function formatBDT(amount: number): string {
  const num = Math.round(Number(amount));
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `৳${formatted}`;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Pending", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: CheckCircle2 },
  PROCESSING: { label: "Processing", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: Box },
  SHIPPED: { label: "Shipped", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-amber-500/10 text-amber-400" },
  PAID: { label: "Paid", color: "bg-emerald-500/10 text-emerald-400" },
  FAILED: { label: "Failed", color: "bg-red-500/10 text-red-400" },
  REFUNDED: { label: "Refunded", color: "bg-blue-500/10 text-blue-400" },
};

const orderStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const { stats } = useAdmin();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);
      if (paymentFilter) params.set("paymentStatus", paymentFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotal(data.total || 0);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch {
      // Handle error
    } finally {
      setUpdating(null);
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch {
      // Handle error
    } finally {
      setUpdating(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  // Calculate summary stats from current view
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === "PAID" ? o.total : 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Order Management</h1>
        <p className="text-slate-400 mt-1">View and manage all orders across stores</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Orders", value: total, icon: ShoppingCart, color: "text-amber-400" },
          { label: "Page Revenue", value: formatBDT(totalRevenue), icon: DollarSign, color: "text-emerald-400" },
          { label: "Pending", value: orders.filter(o => o.status === "PENDING").length, icon: Clock, color: "text-amber-400" },
          { label: "Delivered", value: orders.filter(o => o.status === "DELIVERED").length, icon: CheckCircle2, color: "text-emerald-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon size={20} className="text-slate-700" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number or store name..."
            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-amber-500/50"
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50"
        >
          <option value="">All Statuses</option>
          {orderStatuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50"
        >
          <option value="">All Payments</option>
          <option value="PENDING">Payment Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Order</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Store</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Payment</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm mt-2">Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Package className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-400">No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.PENDING;
                  const StatusIcon = status.icon;
                  const payment = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.PENDING;
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-white font-mono">#{order.orderNumber}</p>
                          <p className="text-xs text-slate-500">{order._count.items} item{order._count.items !== 1 ? "s" : ""}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Store size={12} className="text-slate-500" />
                          <span className="text-sm text-slate-300">{order.store.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {order.customer ? (
                          <div>
                            <p className="text-sm text-slate-300">{order.customer.name}</p>
                            <p className="text-xs text-slate-500">{order.customer.email}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Guest</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${payment.color}`}>
                          <CreditCard size={10} />
                          {payment.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-white">{formatBDT(order.total)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updating === order.id}
                            className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-white focus:border-amber-500/50 disabled:opacity-50"
                          >
                            {orderStatuses.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                            disabled={updating === order.id}
                            className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-white focus:border-amber-500/50 disabled:opacity-50"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="FAILED">Failed</option>
                            <option value="REFUNDED">Refunded</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <p className="text-sm text-slate-400">
              Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-sm text-slate-400">{page} / {totalPages}</span>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
