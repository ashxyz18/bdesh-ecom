"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Facebook,
  Instagram,
  Loader2,
  Megaphone,
  Plus,
  Send,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

interface FlashSale {
  id: string;
  name: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  productIds: string[];
  status: string;
}

interface SocialAccount {
  id: string;
  platform: "facebook" | "instagram" | "whatsapp";
  pageName?: string;
  connected: boolean;
  autoPost: boolean;
}

const saleDefaults = {
  name: "",
  discountPercent: 20,
  startDate: "",
  endDate: "",
};

const socialDefaults = {
  platform: "facebook" as "facebook" | "instagram" | "whatsapp",
  pageName: "",
  pageId: "",
  accessToken: "",
  autoPost: false,
};

export default function MarketingPage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showSocialForm, setShowSocialForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saleForm, setSaleForm] = useState(saleDefaults);
  const [socialForm, setSocialForm] = useState(socialDefaults);
  const [postContent, setPostContent] = useState("");
  const [postPlatform, setPostPlatform] = useState("facebook");
  const storeId = typeof window !== "undefined" ? localStorage.getItem("storeId") : null;

  const loadMarketing = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const [salesRes, socialRes] = await Promise.all([
        fetch(`/api/stores/${storeId}/flash-sales`),
        fetch(`/api/stores/${storeId}/social-accounts`),
      ]);
      const salesData = await salesRes.json();
      const socialData = await socialRes.json();
      setFlashSales(salesData.flashSales || []);
      setSocialAccounts(socialData.accounts || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketing();
  }, [storeId]);

  const connectedPlatforms = useMemo(
    () => socialAccounts.filter((account) => account.connected).map((account) => account.platform),
    [socialAccounts]
  );

  const createFlashSale = async (event: FormEvent) => {
    event.preventDefault();
    if (!storeId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/flash-sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...saleForm,
          discountPercent: Number(saleForm.discountPercent),
        }),
      });
      if (res.ok) {
        setShowSaleForm(false);
        setSaleForm(saleDefaults);
        loadMarketing();
      }
    } finally {
      setSaving(false);
    }
  };

  const connectSocial = async (event: FormEvent) => {
    event.preventDefault();
    if (!storeId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/social-accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socialForm),
      });
      if (res.ok) {
        setShowSocialForm(false);
        setSocialForm(socialDefaults);
        loadMarketing();
      }
    } finally {
      setSaving(false);
    }
  };

  const publishPost = async () => {
    if (!storeId || !postContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/social-posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: postPlatform, content: postContent }),
      });
      const data = await res.json();
      if (res.ok) {
        setPostContent("");
        alert(data.message || "Post published");
      } else {
        alert(data.error || "Post failed");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
          <p className="text-gray-500 mt-1">Run campaigns, flash sales, and social publishing from one place.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSaleForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] text-sm font-medium"
          >
            <Plus size={18} />
            Flash Sale
          </button>
          <button
            onClick={() => setShowSocialForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <Sparkles size={18} />
            Connect Channel
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Metric label="Flash Sales" value={flashSales.length.toString()} icon={Megaphone} />
        <Metric label="Connected Channels" value={connectedPlatforms.length.toString()} icon={Send} />
        <Metric label="Active Campaigns" value={flashSales.filter((sale) => sale.status === "active").length.toString()} icon={Tag} />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Flash Sales</h2>
                  <p className="text-sm text-gray-500">Time-limited discounts for campaigns and inventory pushes.</p>
                </div>
                <button onClick={() => setShowSaleForm(true)} className="text-sm text-[#1d4ed8] hover:underline">
                  Create sale
                </button>
              </div>

              {flashSales.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                  <CalendarClock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium text-gray-900">No flash sales yet</p>
                  <p className="text-sm text-gray-500 mt-1">Create an offer for Eid, payday, clearance, or launches.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flashSales.map((sale) => (
                    <div key={sale.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">{sale.name}</p>
                          <p className="text-sm text-gray-500 mt-1">{sale.discountPercent}% off selected products</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 capitalize">
                          {sale.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-3">
                        {new Date(sale.startDate).toLocaleDateString("en-BD")} to {new Date(sale.endDate).toLocaleDateString("en-BD")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Social Publisher</h2>
              <p className="text-sm text-gray-500 mb-5">Post campaign copy to connected channels.</p>
              <div className="space-y-4">
                <select
                  value={postPlatform}
                  onChange={(event) => setPostPlatform(event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <textarea
                  value={postContent}
                  onChange={(event) => setPostContent(event.target.value)}
                  rows={5}
                  placeholder="New arrivals just dropped. Shop today and get 20% off..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
                <button
                  onClick={publishPost}
                  disabled={saving || !postContent.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] disabled:opacity-50 text-sm font-medium"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Publish
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Channels</h2>
                  <p className="text-sm text-gray-500">Connected social accounts.</p>
                </div>
                <button onClick={() => setShowSocialForm(true)} className="text-sm text-[#1d4ed8] hover:underline">
                  Add
                </button>
              </div>
              <div className="space-y-3">
                {["facebook", "instagram", "whatsapp"].map((platform) => {
                  const account = socialAccounts.find((item) => item.platform === platform);
                  const Icon = platform === "instagram" ? Instagram : platform === "facebook" ? Facebook : Send;
                  return (
                    <div key={platform} className="rounded-lg border border-gray-200 p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Icon size={18} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{platform}</p>
                          <p className="text-xs text-gray-500">{account?.pageName || "Not connected"}</p>
                        </div>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full ${account?.connected ? "bg-green-500" : "bg-gray-300"}`} />
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Campaign Checklist</h2>
              <p className="text-sm text-gray-500 mb-4">Useful shortcuts before launching traffic.</p>
              <div className="space-y-2">
                <Link href="/dashboard/coupons" className="block rounded-lg border border-gray-200 p-3 text-sm hover:bg-gray-50">
                  Create coupon codes
                </Link>
                <Link href="/dashboard/products" className="block rounded-lg border border-gray-200 p-3 text-sm hover:bg-gray-50">
                  Review product stock
                </Link>
                <Link href="/dashboard/customize" className="block rounded-lg border border-gray-200 p-3 text-sm hover:bg-gray-50">
                  Update homepage banners
                </Link>
              </div>
            </section>
          </aside>
        </div>
      )}

      {showSaleForm && (
        <Modal title="Create Flash Sale" onClose={() => setShowSaleForm(false)}>
          <form onSubmit={createFlashSale} className="space-y-4">
            <TextInput label="Sale Name" value={saleForm.name} onChange={(value) => setSaleForm({ ...saleForm, name: value })} placeholder="Weekend Flash Sale" required />
            <TextInput label="Discount Percent" type="number" value={saleForm.discountPercent} onChange={(value) => setSaleForm({ ...saleForm, discountPercent: Number(value) })} required />
            <div className="grid grid-cols-2 gap-4">
              <TextInput label="Start Date" type="date" value={saleForm.startDate} onChange={(value) => setSaleForm({ ...saleForm, startDate: value })} />
              <TextInput label="End Date" type="date" value={saleForm.endDate} onChange={(value) => setSaleForm({ ...saleForm, endDate: value })} />
            </div>
            <FormActions saving={saving} onCancel={() => setShowSaleForm(false)} />
          </form>
        </Modal>
      )}

      {showSocialForm && (
        <Modal title="Connect Social Channel" onClose={() => setShowSocialForm(false)}>
          <form onSubmit={connectSocial} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform</label>
              <select
                value={socialForm.platform}
                onChange={(event) => setSocialForm({ ...socialForm, platform: event.target.value as typeof socialForm.platform })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
              >
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <TextInput label="Page Name" value={socialForm.pageName} onChange={(value) => setSocialForm({ ...socialForm, pageName: value })} placeholder="My Store Page" />
            <TextInput label="Page ID" value={socialForm.pageId} onChange={(value) => setSocialForm({ ...socialForm, pageId: value })} />
            <TextInput label="Access Token" value={socialForm.accessToken} onChange={(value) => setSocialForm({ ...socialForm, accessToken: value })} />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={socialForm.autoPost}
                onChange={(event) => setSocialForm({ ...socialForm, autoPost: event.target.checked })}
                className="rounded border-gray-300"
              />
              Auto-post new products
            </label>
            <FormActions saving={saving} onCancel={() => setShowSocialForm(false)} />
          </form>
        </Modal>
      )}
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Megaphone }) {
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

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
      />
    </div>
  );
}

function FormActions({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className="flex-1 px-4 py-2.5 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Save"}
      </button>
    </div>
  );
}
