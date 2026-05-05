"use client";

import { useState, useEffect } from "react";
import { 
  Package, Search, Save, AlertTriangle, ArrowUpDown, 
  RefreshCw, Check, X, Minus, Plus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard } from "../DashboardContext";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  price: number;
  status: string;
}

export default function InventoryPage() {
  const { activeStore } = useDashboard();
  const storeId = activeStore?.id;
  const [products, setProducts] = useState<Product[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    async function fetchInventory() {
      if (!storeId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/${storeId}/products`);
        if (res.ok) {
          const data = await res.json();
          const pData = data.products || [];
          setProducts(pData);
          setOriginalProducts(JSON.parse(JSON.stringify(pData)));
        }
      } catch {
        // Error
      } finally {
        setLoading(false);
      }
    }
    fetchInventory();
  }, [storeId]);

  const handleQuantityChange = (id: string, newVal: number) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, quantity: Math.max(0, newVal) } : p
    );
    setProducts(updated);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!storeId) return;
    setSaving(true);
    
    // Find only changed products
    const changed = products.filter(p => {
      const orig = originalProducts.find(o => o.id === p.id);
      return orig && orig.quantity !== p.quantity;
    });

    try {
      // Bulk update (simplified for now as multiple individual requests)
      await Promise.all(changed.map(p => 
        fetch(`/api/${storeId}/products/${p.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: p.quantity }),
        })
      ));
      
      setOriginalProducts(JSON.parse(JSON.stringify(products)));
      setHasChanges(false);
      // Show success toast?
    } catch {
      // Error
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  if (!storeId) {
    return (
      <div className="text-center py-24">
        <Package className="mx-auto text-slate-300 mb-4" size={48} />
        <h2 className="text-xl font-bold">No Store Selected</h2>
        <p className="text-slate-500">Select a store to manage inventory.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor and update your stock levels</p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
            <Button variant="ghost" onClick={() => { setProducts(JSON.parse(JSON.stringify(originalProducts))); setHasChanges(false); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
              {saving ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search by name or SKU..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Product</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">SKU</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Current Stock</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-48" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                    <td className="px-6 py-4 flex justify-center"><div className="h-8 bg-slate-100 rounded w-24" /></td>
                    <td className="px-6 py-4 text-center"><div className="h-4 bg-slate-100 rounded w-16 mx-auto" /></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-500">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">৳{p.price.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {p.sku || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => handleQuantityChange(p.id, p.quantity - 1)}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <Input 
                          type="number"
                          value={p.quantity}
                          onChange={(e) => handleQuantityChange(p.id, parseInt(e.target.value) || 0)}
                          className="w-20 text-center font-bold"
                        />
                        <button 
                          onClick={() => handleQuantityChange(p.id, p.quantity + 1)}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.quantity === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                          <X size={10} /> Out of Stock
                        </span>
                      ) : p.quantity <= 5 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                          <AlertTriangle size={10} /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <Check size={10} /> In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
