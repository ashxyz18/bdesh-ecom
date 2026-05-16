"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Copy,
  Loader2,
  Plus,
  Tag,
  TicketPercent,
  X,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder?: number | null;
  maxUses?: number | null;
  usedCount?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt?: string;
}

const defaultForm = {
  code: "",
  type: "percentage",
  value: 10,
  minOrderAmount: 0,
  usageLimit: 100,
  endDate: "",
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const storeId = typeof window !== "undefined" ? localStorage.getItem("storeId") : null;

  const fetchCoupons = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/coupons`);
      const data = await res.json();
      setCoupons(data.coupons || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [storeId]);

  const activeCoupons = useMemo(() => {
    const now = Date.now();
    return coupons.filter((coupon) => !coupon.endsAt || new Date(coupon.endsAt).getTime() >= now);
  }, [coupons]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!storeId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: Number(form.value),
          minOrderAmount: Number(form.minOrderAmount || 0),
          usageLimit: Number(form.usageLimit || 0),
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm(defaultForm);
        fetchCoupons();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create coupon");
      }
    } finally {
      setSaving(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500 mt-1">Create discounts, free shipping offers, and launch codes.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] text-sm font-medium"
        >
          <Plus size={18} />
          New Coupon
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Metric label="Total Coupons" value={coupons.length.toString()} icon={Tag} />
        <Metric label="Active Offers" value={activeCoupons.length.toString()} icon={TicketPercent} />
        <Metric
          label="Total Redemptions"
          value={coupons.reduce((sum, coupon) => sum + (coupon.usedCount || 0), 0).toString()}
          icon={Calendar}
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <TicketPercent className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">No coupons yet</h2>
          <p className="text-gray-500 mt-2 mb-6">Create your first discount code for campaigns and returning customers.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af]"
          >
            <Plus size={18} />
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-lg font-bold text-gray-900">{coupon.code}</p>
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className="p-1.5 text-gray-400 hover:text-[#1d4ed8] hover:bg-blue-50 rounded"
                      title="Copy coupon code"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCouponValue(coupon)} {coupon.minOrder ? `on orders over ৳${coupon.minOrder}` : ""}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isExpired(coupon) ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>
                  {isExpired(coupon) ? "Expired" : "Active"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-400 text-xs">Used</p>
                  <p className="font-semibold text-gray-900">{coupon.usedCount || 0}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-400 text-xs">Limit</p>
                  <p className="font-semibold text-gray-900">{coupon.maxUses || "Unlimited"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-400 text-xs">Ends</p>
                  <p className="font-semibold text-gray-900">
                    {coupon.endsAt ? new Date(coupon.endsAt).toLocaleDateString("en-BD") : "Never"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Create Coupon</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Coupon Code</label>
                <input
                  value={form.code}
                  onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
                  required
                  placeholder="EID20"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={(event) => setForm({ ...form, type: event.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Value</label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(event) => setForm({ ...form, value: Number(event.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Order</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(event) => setForm({ ...form, minOrderAmount: Number(event.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Usage Limit</label>
                  <input
                    type="number"
                    value={form.usageLimit}
                    onChange={(event) => setForm({ ...form, usageLimit: Number(event.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Tag }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function isExpired(coupon: Coupon) {
  return Boolean(coupon.endsAt && new Date(coupon.endsAt).getTime() < Date.now());
}

function formatCouponValue(coupon: Coupon) {
  const type = coupon.type.toLowerCase();
  if (type.includes("percentage")) return `${coupon.value}% off`;
  if (type.includes("shipping")) return "Free shipping";
  return `৳${coupon.value.toLocaleString()} off`;
}
