"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Tag, Plus, Copy, Trash2, Calendar, MoreHorizontal, X,
  Check, Clock, AlertCircle, Percent, DollarSign, Truck,
  Edit, ToggleLeft, ToggleRight,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useDashboard } from "../../DashboardContext";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Percent> = {
  PERCENTAGE: Percent,
  FIXED: DollarSign,
  FREE_SHIPPING: Truck,
};

const typeLabels: Record<string, string> = {
  PERCENTAGE: "Percentage",
  FIXED: "Fixed Amount",
  FREE_SHIPPING: "Free Shipping",
};

export default function DiscountsPage() {
  const { activeStore } = useDashboard();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "PERCENTAGE",
    value: 10,
    minOrder: 0,
    maxUses: 100,
    startsAt: "",
    endsAt: "",
  });

  const fetchCoupons = useCallback(async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/marketing/coupons?storeId=${activeStore.id}`);
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch {
      // Use empty array on error
    } finally {
      setLoading(false);
    }
  }, [activeStore]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setNewCoupon((prev) => ({ ...prev, code }));
  };

  const handleCreate = async () => {
    if (!newCoupon.code.trim() || !activeStore) return;
    setCreating(true);
    try {
      const res = await fetch("/api/marketing/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: activeStore.id,
          code: newCoupon.code.toUpperCase(),
          type: newCoupon.type,
          value: newCoupon.value,
          minOrder: newCoupon.minOrder || undefined,
          maxUses: newCoupon.maxUses || undefined,
          startsAt: newCoupon.startsAt || undefined,
          endsAt: newCoupon.endsAt || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons((prev) => [data.coupon, ...prev]);
        setShowCreateModal(false);
        setNewCoupon({ code: "", type: "PERCENTAGE", value: 10, minOrder: 0, maxUses: 100, startsAt: "", endsAt: "" });
      }
    } catch {
      // Silently fail
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch("/api/marketing/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !isActive } : c))
        );
      }
    } catch {
      // Silently fail
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      const res = await fetch(`/api/marketing/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      // Silently fail
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isExpired = (endsAt: string | null) => {
    if (!endsAt) return false;
    return new Date(endsAt) < new Date();
  };

  const formatDiscount = (type: string, value: number) => {
    if (type === "PERCENTAGE") return `${value}%`;
    if (type === "FIXED") return `৳${value}`;
    return "Free Shipping";
  };

  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.isActive && !isExpired(c.endsAt)).length,
    totalUsed: coupons.reduce((sum, c) => sum + c.usedCount, 0),
    expired: coupons.filter((c) => isExpired(c.endsAt)).length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Tag size={24} className="text-[#008060]" /> Discounts & Coupons
          </h1>
          <p className="text-slate-500 mt-1">Create coupon codes and manage promotions</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#008060] hover:bg-[#006A4E] text-white"
        >
          <Plus size={16} className="mr-2" /> Create Coupon
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Coupons", value: stats.total, icon: Tag, color: "text-blue-600 bg-blue-50" },
          { label: "Active", value: stats.active, icon: Check, color: "text-emerald-600 bg-emerald-50" },
          { label: "Total Redemptions", value: stats.totalUsed.toLocaleString(), icon: Percent, color: "text-purple-600 bg-purple-50" },
          { label: "Expired", value: stats.expired, icon: Clock, color: "text-amber-600 bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                <s.icon size={14} />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#008060] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Tag size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No coupons yet</h3>
            <p className="text-slate-500 mb-1">Create coupon codes to boost sales</p>
            <p className="text-xs text-slate-400 mb-6">
              Offer percentage discounts, fixed amounts, or free shipping
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#008060] hover:bg-[#006A4E] text-white"
            >
              <Plus size={16} className="mr-2" /> Create Coupon
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Code</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Discount</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Min. Order</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Usage</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Expires</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.endsAt);
                  const TypeIcon = typeIcons[coupon.type] || Tag;
                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/50 border-b border-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <code className="px-2.5 py-1 bg-slate-100 rounded-md text-sm font-mono font-medium text-slate-800">
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => copyCode(coupon.code, coupon.id)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Copy code"
                          >
                            {copiedId === coupon.id ? (
                              <Check size={14} className="text-emerald-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <TypeIcon size={14} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">
                            {formatDiscount(coupon.type, coupon.value)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {coupon.minOrder ? `৳${coupon.minOrder}` : "None"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700">
                          {coupon.usedCount}
                          {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                        </div>
                        {coupon.maxUses && (
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1">
                            <div
                              className="h-full bg-[#008060] rounded-full transition-all"
                              style={{ width: `${Math.min((coupon.usedCount / coupon.maxUses) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {coupon.endsAt
                          ? new Date(coupon.endsAt).toLocaleDateString()
                          : "No expiry"}
                      </td>
                      <td className="px-5 py-4">
                        {expired ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            Expired
                          </span>
                        ) : coupon.isActive ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            title={coupon.isActive ? "Deactivate" : "Activate"}
                          >
                            {coupon.isActive ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Create Coupon</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm font-mono uppercase"
                    placeholder="EID2026"
                  />
                  <Button variant="outline" onClick={generateCode} className="text-sm shrink-0">
                    Generate
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Discount Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "PERCENTAGE", label: "Percentage", icon: Percent },
                    { value: "FIXED", label: "Fixed Amount", icon: DollarSign },
                    { value: "FREE_SHIPPING", label: "Free Shipping", icon: Truck },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setNewCoupon({ ...newCoupon, type: t.value })}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-colors ${
                        newCoupon.type === t.value
                          ? "border-[#008060] bg-[#008060]/5 text-[#008060]"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <t.icon size={18} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              {newCoupon.type !== "FREE_SHIPPING" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {newCoupon.type === "PERCENTAGE" ? "Discount Percentage" : "Discount Amount (৳)"}
                  </label>
                  <input
                    type="number"
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                    min={1}
                    max={newCoupon.type === "PERCENTAGE" ? 100 : undefined}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Min. Order (৳)</label>
                  <input
                    type="number"
                    value={newCoupon.minOrder || ""}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Uses</label>
                  <input
                    type="number"
                    value={newCoupon.maxUses || ""}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Starts At</label>
                  <input
                    type="datetime-local"
                    value={newCoupon.startsAt}
                    onChange={(e) => setNewCoupon({ ...newCoupon, startsAt: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Expires At</label>
                  <input
                    type="datetime-local"
                    value={newCoupon.endsAt}
                    onChange={(e) => setNewCoupon({ ...newCoupon, endsAt: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 outline-none text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="text-sm">
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating || !newCoupon.code.trim()}
                className="bg-[#008060] hover:bg-[#006A4E] text-white text-sm"
              >
                {creating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Plus size={14} className="mr-1.5" />
                )}
                Create Coupon
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
