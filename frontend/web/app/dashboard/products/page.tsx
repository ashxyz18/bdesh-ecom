"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Search, Loader2, Package, Eye, Edit2, Trash2,
  Copy, MoreHorizontal, Filter, ChevronDown, X, ToggleLeft, ToggleRight
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: string[];
  stock: number;
  status: string;
  categoryId?: string;
  tags: string[];
  variants: { id: string; name: string; stock?: number; price?: number }[];
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  productCount: number;
  active: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const storeId = typeof window !== "undefined" ? localStorage.getItem("storeId") : null;

  const fetchProducts = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.all([
        fetch(`/api/products?storeId=${storeId}`),
        fetch(`/api/stores/${storeId}/categories`),
      ]);
      const prodsData = await prodsRes.json();
      const catsData = await catsRes.json();
      setProducts(prodsData.products || []);
      setCategories(catsData.categories || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    fetchProducts();
  };

  const handleToggleStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "draft" : "active";
    await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchProducts();
  };

  const filteredProducts = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (categoryFilter && p.categoryId !== categoryFilter) return false;
    return true;
  });

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      draft: "bg-yellow-100 text-yellow-700",
      archived: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${colors[status] || colors.draft}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">{filteredProducts.length} products</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2.5 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors font-medium"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">
            {search || statusFilter || categoryFilter ? "Try adjusting your filters" : "Add your first product to get started"}
          </p>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors font-medium"
          >
            <Plus size={18} /> Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package size={20} className="text-gray-300" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                          {product.tags.length > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {product.tags.slice(0, 3).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {categories.find((c) => c.id === product.categoryId)?.name || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(product.id, product.status)}
                        className="flex items-center gap-1.5"
                        title="Toggle status"
                      >
                        {product.status === "active" ? (
                          <ToggleRight size={20} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={20} className="text-gray-400" />
                        )}
                        {statusBadge(product.status)}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${
                        product.stock <= 0
                          ? "text-red-600"
                          : product.stock <= 5
                          ? "text-orange-600"
                          : "text-gray-900"
                      }`}>
                        {product.stock <= 0 ? "Out of stock" : `${product.stock} in stock`}
                      </span>
                      {product.variants.length > 1 && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({product.variants.length} variants)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">৳{product.price.toLocaleString()}</p>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <p className="text-xs text-gray-400 line-through">
                          ৳{product.comparePrice.toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/store/${storeId}/products/${product.id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="p-2 text-gray-400 hover:text-[#1d4ed8] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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