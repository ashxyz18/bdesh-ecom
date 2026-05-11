"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package, Search, Filter, Eye, Truck, X, ChevronDown,
  Phone, MapPin, Clock, Download, RefreshCw, MoreHorizontal,
  CheckCircle, XCircle, Loader2, AlertTriangle, RefreshCw as SyncIcon
} from "lucide-react";
import Link from "next/link";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-gray-100 text-gray-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

interface Order {
  id: string;
  orderNumber: string;
  customerInfo: { name: string; phone: string; email?: string };
  shippingAddress: { city: string; district: string; addressLine1: string; area?: string };
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  courier?: string;
  trackingId?: string;
  trackingUrl?: string;
  source: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [bookingCourier, setBookingCourier] = useState<string | null>(null);
  const [courierProvider, setCourierProvider] = useState<string>("pathao");

  const storeId = typeof window !== "undefined" ? localStorage.getItem("storeId") : null;

  const fetchOrders = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/stores/${storeId}/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setStatusCounts(data.statusCounts);
        setTotalRevenue(data.totalRevenue);
        setTotalPending(data.totalPending);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [storeId, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedOrders.size === 0) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: Array.from(selectedOrders), status: newStatus }),
      });
      if (res.ok) {
        setSelectedOrders(new Set());
        fetchOrders();
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await fetch(`/api/stores/${storeId}/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchOrders();
  };

  const handleBookCourier = async (orderId: string) => {
    setBookingCourier(orderId);
    try {
      const res = await fetch(`/api/stores/${storeId}/orders/${orderId}/courier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courierProvider }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.error || "Failed to book courier");
      }
    } finally {
      setBookingCourier(null);
    }
  };

  const exportCSV = () => {
    const headers = ["Order #", "Customer", "Phone", "City", "Total", "Status", "Payment", "Date"];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.customerInfo.name,
      o.customerInfo.phone,
      o.shippingAddress.district,
      o.total,
      o.status,
      o.paymentStatus,
      new Date(o.createdAt).toLocaleDateString("en-BD"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedOrders);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedOrders(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o.id)));
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">
            {totalPending > 0 ? `${totalPending} pending orders` : "All orders"} &bull; ৳{totalRevenue.toLocaleString()} revenue
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            !statusFilter ? "bg-[#1d4ed8] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          All ({Object.values(statusCounts).reduce((a, b) => a + b, 0) || 0})
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === key
                ? "bg-[#1d4ed8] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label} ({statusCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Search + Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number, customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
          />
        </div>
        {selectedOrders.size > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-sm text-blue-700 font-medium">{selectedOrders.size} selected</span>
            <select
              onChange={(e) => e.target.value && handleBulkStatusChange(e.target.value)}
              className="text-sm border border-blue-300 rounded px-2 py-1 bg-white"
              defaultValue=""
            >
              <option value="">Change status...</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button onClick={() => setSelectedOrders(new Set())} className="text-blue-700 hover:text-blue-900">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">
            {search || statusFilter ? "Try adjusting your filters" : "Orders will appear here when customers place them"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === orders.length && orders.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <>
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => toggleSelect(order.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-mono text-sm font-semibold text-[#1d4ed8]">{order.orderNumber}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""} &bull; {order.source}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{order.customerInfo.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{order.customerInfo.phone}</p>
                          <p className="text-xs text-gray-400">{order.shippingAddress.district}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-3 py-1.5 border-0 cursor-pointer ${STATUS_COLORS[order.status]}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1 capitalize">{order.paymentMethod} &bull; {order.paymentStatus}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">৳{order.total.toLocaleString()}</p>
                        {order.trackingId && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#1d4ed8] hover:underline"
                          >
                            Track: {order.trackingId}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString("en-BD")}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="p-1.5 text-gray-500 hover:text-[#1d4ed8] hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {(order.status === "confirmed" || order.status === "processing") && !order.trackingId && (
                            <button
                              onClick={() => handleBookCourier(order.id)}
                              disabled={bookingCourier === order.id}
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Book Courier"
                            >
                              {bookingCourier === order.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Truck size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedOrder === order.id && (
                      <tr>
                        <td colSpan={7} className="bg-blue-50 px-8 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Customer Details</h4>
                              <p className="text-sm font-medium">{order.customerInfo.name}</p>
                              <p className="text-sm text-gray-600">{order.customerInfo.phone}</p>
                              {order.customerInfo.email && (
                                <p className="text-sm text-gray-500">{order.customerInfo.email}</p>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                              <p className="text-sm text-gray-600">{order.shippingAddress.addressLine1}</p>
                              <p className="text-sm text-gray-600">{order.shippingAddress.area}, {order.shippingAddress.district}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
                              {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm py-1">
                                  <span className="text-gray-600">{item.name} x{item.quantity}</span>
                                  <span className="font-medium">৳{item.price.toLocaleString()}</span>
                                </div>
                              ))}
                              <div className="border-t mt-2 pt-2 flex justify-between font-semibold text-sm">
                                <span>Total</span>
                                <span>৳{order.total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}