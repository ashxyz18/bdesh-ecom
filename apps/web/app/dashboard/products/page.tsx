"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Package, Edit2, Trash2, Eye, EyeOff, Filter, Grid3X3, List, MoreVertical, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard } from "../DashboardContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  status: string;
  featured: boolean;
  quantity: number;
  createdAt: string;
}

function formatBDT(amount: number): string {
  const num = Math.round(Number(amount));
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `৳${formatted}`;
}

export default function ProductsPage() {
  const { activeStore } = useDashboard();
  const storeId = activeStore?.id;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  useEffect(() => {
    async function fetchProducts() {
      if (!storeId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/${storeId}/products${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [storeId, statusFilter]);

  const filteredProducts = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    if (!storeId) return;

    try {
      const res = await fetch(`/api/${storeId}/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch {
      // Handle error
    }
  };

  const handleToggleStatus = async (product: Product) => {
    if (!storeId) return;
    const newStatus = product.status === "active" ? "draft" : "active";
    try {
      const res = await fetch(`/api/${storeId}/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
        );
      }
    } catch {
      // Handle error
    }
  };

  const statusCounts = {
    all: products.length,
    active: products.filter(p => p.status === "active").length,
    draft: products.filter(p => p.status === "draft").length,
    archived: products.filter(p => p.status === "archived").length,
  };

  if (!storeId) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Package className="text-slate-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Store Selected</h2>
        <p className="text-slate-500 mb-4">Select a store from the sidebar to manage products.</p>
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
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-0.5">{products.length} total products</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            <Plus size={16} /> Add Product
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "active", "draft", "archived"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className={`ml-1.5 text-xs ${statusFilter === status ? "text-emerald-200" : "text-slate-400"}`}>
                  {statusCounts[status]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Grid3X3 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Product List/Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/80">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Package className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No products yet</h3>
          <p className="text-slate-500 text-sm mb-6">Add your first product to start selling.</p>
          <Link href="/dashboard/products/new">
            <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus size={16} /> Add Product
            </Button>
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-md transition-all duration-200 group">
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={32} className="text-slate-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {product.featured && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">Featured</span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    product.status === "active" ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                  }`}>
                    {product.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-slate-900 truncate">{product.name}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-bold text-slate-900">{formatBDT(Number(product.price))}</span>
                  {product.comparePrice && (
                    <span className="text-xs text-slate-400 line-through">{formatBDT(Number(product.comparePrice))}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className={`text-xs font-medium ${product.quantity <= 5 ? "text-red-600" : "text-slate-500"}`}>
                    {product.quantity <= 5 ? `Low stock: ${product.quantity}` : `${product.quantity} in stock`}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggleStatus(product)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title={product.status === "active" ? "Hide" : "Activate"}>
                      {product.status === "active" ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <Link href={`/dashboard/products/${product.id}/edit`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                      <Edit2 size={14} />
                    </Link>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          {product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package size={16} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">{product.name}</p>
                          {product.featured && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-sm text-slate-900">{formatBDT(Number(product.price))}</span>
                      {product.comparePrice && (
                        <span className="text-xs text-slate-400 line-through ml-1.5">{formatBDT(Number(product.comparePrice))}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-medium ${product.quantity <= 5 ? "text-red-600" : "text-slate-700"}`}>
                        {product.quantity}
                      </span>
                      {product.quantity <= 5 && product.quantity > 0 && (
                        <span className="ml-1.5 text-[10px] text-red-500 font-medium">Low</span>
                      )}
                      {product.quantity === 0 && (
                        <span className="ml-1.5 text-[10px] text-red-600 font-bold">Out of stock</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        product.status === "active" ? "bg-emerald-50 text-emerald-700" :
                        product.status === "draft" ? "bg-slate-100 text-slate-600" :
                        "bg-amber-50 text-amber-700"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          title={product.status === "active" ? "Hide" : "Activate"}
                        >
                          {product.status === "active" ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <Link
                          href={`/dashboard/products/${product.id}/edit`}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
