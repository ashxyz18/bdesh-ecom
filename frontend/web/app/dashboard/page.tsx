"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, DollarSign, Users, TrendingUp, ArrowRight, Plus, Settings, ExternalLink, Package, Clock } from "lucide-react";

interface StoreData {
  id: string;
  name: string;
  ownerId: string;
  templateId: string;
  settings: { heroHeadline?: string; heroImage?: string };
}

interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  stock: number;
  status: string;
}

interface Order {
  id: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const storeId = localStorage.getItem("storeId");

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }

    if (storeId) {
      fetch(`/api/stores/${storeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.store) {
            setStore(data.store);
          }
          const prods = data.products || [];
          setProducts(prods);
          setRecentOrders(
            prods.filter((p: Product) => p.status === "active").slice(0, 3).map((p: Product) => ({
              id: `ORD-${p.id.slice(0, 6).toUpperCase()}`,
              customer: "Pending Order",
              amount: `৳${p.price.toLocaleString()}`,
              status: "Processing",
              date: new Date().toISOString().split("T")[0],
            }))
          );
        })
        .catch((err) => {
          console.error("Failed to fetch store:", err);
        });
    }

    setLoading(false);
  }, []);

  const stats = [
    {
      label: "Total Products",
      value: products.length.toString(),
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Active Products",
      value: products.filter((p) => p.status === "active").length.toString(),
      icon: TrendingUp,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Low Stock",
      value: products.filter((p) => p.stock > 0 && p.stock <= 5).length.toString(),
      icon: Package,
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "Total Stock",
      value: products.reduce((sum, p) => sum + p.stock, 0).toString(),
      icon: Clock,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#1d4ed8]/30 border-t-[#1d4ed8] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-gray-500 mt-1">
            {store ? `Managing: ${store.name}` : "Loading your store..."}
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors"
          >
            <Plus size={18} />
            Add Product
          </Link>
          {store && (
            <Link
              href={`/store/${store.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={18} />
              View Store
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
            <Link href="/dashboard/products" className="text-sm text-[#1d4ed8] hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No products yet</p>
              <Link href="/dashboard/products/new" className="text-sm text-[#1d4ed8] hover:underline">
                Add your first product
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/products/${p.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${
                    p.status === "active" ? "bg-green-500" : p.status === "draft" ? "bg-yellow-500" : "bg-gray-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-sm text-gray-500">Stock: {p.stock}</p>
                  </div>
                  <span className="font-semibold text-gray-900">৳{p.price.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Store Overview</h2>
          </div>
          
          <div className="space-y-4">
            {store && (
              <>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Store Name</span>
                  <span className="font-medium text-gray-900">{store.name}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Template</span>
                  <span className="font-medium text-gray-900 capitalize">{store.templateId || "Not selected"}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Store ID</span>
                  <span className="font-medium text-gray-900 font-mono text-xs">{store.id.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Products</span>
                  <span className="font-medium text-gray-900">{products.length}</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/dashboard/products/new"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-[#1d4ed8]/10 rounded-full flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-[#1d4ed8]" />
                </div>
                <span className="text-sm font-medium text-gray-900">Add Product</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Store Settings</span>
              </Link>
              {store && (
                <Link
                  href={`/store/${store.id}`}
                  target="_blank"
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <ExternalLink className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">View Store</span>
                </Link>
              )}
              <Link
                href="/onboarding"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                  <ShoppingBag className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Change Template</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}