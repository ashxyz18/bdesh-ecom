"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Search, Eye, Truck, CheckCircle, Clock, XCircle, ShoppingBag } from "lucide-react";

interface Order {
  id: string;
  product: string;
  price: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  image: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    const storedStoreId = localStorage.getItem("storeId");
    setStoreId(storedStoreId);
  }, []);

  useEffect(() => {
    if (!storeId) return;

    async function fetchOrders() {
      try {
        const res = await fetch(`/api/stores/${storeId}`);
        const data = await res.json();
        const products = data.products || [];

        const sampleOrders: Order[] = products
          .filter((p: { price: number }) => p.price > 0)
          .slice(0, 5)
          .map((p: { id: string; name: string; price: number; images: string[] }, i: number) => ({
            id: `ORD-${String(i + 1).padStart(3, "0")}`,
            product: p.name,
            price: p.price,
            status: (["pending", "processing", "shipped", "delivered", "cancelled"] as const)[i % 5],
            date: new Date(Date.now() - (i * 86400000)).toISOString().split("T")[0],
            image: p.images?.[0] || "https://via.placeholder.com/100",
          }));

        setOrders(sampleOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [storeId]);

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "processing": return <Package className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "processing": return "bg-blue-100 text-blue-700";
      case "shipped": return "bg-purple-100 text-purple-700";
      case "delivered": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#1d4ed8]/30 border-t-[#1d4ed8] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">Manage and track your customer orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Orders will appear here when customers make purchases</p>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors"
          >
            <ShoppingBag size={18} />
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{orders.filter((o) => o.status === "pending").length}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{orders.filter((o) => o.status === "processing").length}</p>
                  <p className="text-sm text-gray-500">Processing</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{orders.filter((o) => o.status === "shipped").length}</p>
                  <p className="text-sm text-gray-500">Shipped</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{orders.filter((o) => o.status === "delivered").length}</p>
                  <p className="text-sm text-gray-500">Delivered</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No orders match your search</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={order.image} alt={order.product} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1d4ed8]">{order.id}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full capitalize ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 truncate mt-1">{order.product}</p>
                      <p className="text-xs text-gray-500">{order.date}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900">৳{order.price.toLocaleString()}</p>
                      <button className="text-xs text-[#1d4ed8] hover:underline mt-1">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}