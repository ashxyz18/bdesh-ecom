"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings, Palette, Image, Type, Globe, Truck,
  Save, Loader2, Check, Plus, Eye, Trash2
} from "lucide-react";

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  theme: { primaryColor?: string; secondaryColor?: string; fontFamily?: string; buttonColor?: string };
  settings: {
    heroImage?: string;
    heroHeadline?: string;
    heroSubtext?: string;
    footerText?: string;
    currency?: string;
    promotionalBanners?: { id: string; image: string; link?: string; active: boolean }[];
  };
  socialLinks?: { facebook?: string; instagram?: string };
}

export default function SettingsPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const storeId = typeof window !== "undefined" ? localStorage.getItem("storeId") : null;

  useEffect(() => {
    if (!storeId) return;
    fetch(`/api/stores/${storeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.store) setStore(data.store);
      })
      .finally(() => setLoading(false));
  }, [storeId]);

  const handleSave = async (updates: Partial<Store>) => {
    if (!storeId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.store) {
        setStore(data.store);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "hero", label: "Hero & Banners", icon: Image },
    { id: "social", label: "Social Links", icon: Globe },
    { id: "delivery", label: "Delivery", icon: Truck },
  ];

  if (loading || !store) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-500 mt-1">Customize your store appearance and behavior</p>
      </div>

      <div className="flex gap-8">
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeTab === tab.id
                    ? "bg-[#1d4ed8] text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
                <input
                  type="text"
                  value={store.name}
                  onChange={(e) => setStore({ ...store, name: e.target.value })}
                  onBlur={() => handleSave({ name: store.name })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={store.description || ""}
                  onChange={(e) => setStore({ ...store, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                <select
                  value={store.settings?.currency || "BDT"}
                  onChange={(e) => handleSave({ settings: { ...store.settings, currency: e.target.value } })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                >
                  <option value="BDT">BDT (Taka)</option>
                  <option value="USD">USD (Dollar)</option>
                  <option value="INR">INR (Rupee)</option>
                </select>
              </div>
              <button
                onClick={() => handleSave({ name: store.name, description: store.description })}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Theme & Colors</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={store.theme?.primaryColor || "#1d4ed8"}
                      onChange={(e) => {
                        setStore({ ...store, theme: { ...store.theme, primaryColor: e.target.value } });
                        handleSave({ theme: { ...store.theme, primaryColor: e.target.value } });
                      }}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={store.theme?.primaryColor || "#1d4ed8"}
                      onChange={(e) => setStore({ ...store, theme: { ...store.theme, primaryColor: e.target.value } })}
                      onBlur={() => handleSave({ theme: store.theme })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={store.theme?.buttonColor || "#1d4ed8"}
                      onChange={(e) => {
                        setStore({ ...store, theme: { ...store.theme, buttonColor: e.target.value } });
                        handleSave({ theme: { ...store.theme, buttonColor: e.target.value } });
                      }}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={store.theme?.buttonColor || "#1d4ed8"}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Font Family</label>
                <select
                  value={store.theme?.fontFamily || "Inter"}
                  onChange={(e) => handleSave({ theme: { ...store.theme, fontFamily: e.target.value } })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                >
                  <option value="Inter">Inter</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Noto Sans Bengali">Noto Sans Bengali</option>
                  <option value="Hind Siliguri">Hind Siliguri</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo URL</label>
                <input
                  type="text"
                  value={store.logo || ""}
                  onChange={(e) => setStore({ ...store, logo: e.target.value })}
                  onBlur={() => handleSave({ logo: store.logo })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
                {store.logo && (
                  <img src={store.logo} alt="Logo" className="mt-2 h-12 object-contain" />
                )}
              </div>
            </div>
          )}

          {activeTab === "hero" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Hero Section</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hero Image URL</label>
                <input
                  type="text"
                  value={store.settings?.heroImage || ""}
                  onChange={(e) => setStore({ ...store, settings: { ...store.settings, heroImage: e.target.value } })}
                  onBlur={() => handleSave({ settings: store.settings })}
                  placeholder="https://example.com/hero.jpg"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
                {store.settings?.heroImage && (
                  <img src={store.settings.heroImage} alt="Hero" className="mt-2 rounded-lg max-h-48 object-cover" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hero Headline</label>
                <input
                  type="text"
                  value={store.settings?.heroHeadline || ""}
                  onChange={(e) => setStore({ ...store, settings: { ...store.settings, heroHeadline: e.target.value } })}
                  onBlur={() => handleSave({ settings: store.settings })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hero Subtext</label>
                <textarea
                  value={store.settings?.heroSubtext || ""}
                  onChange={(e) => setStore({ ...store, settings: { ...store.settings, heroSubtext: e.target.value } })}
                  onBlur={() => handleSave({ settings: store.settings })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>
            </div>
          )}

          {activeTab === "social" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Social Media Links</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Facebook Page URL</label>
                <input
                  type="text"
                  value={store.socialLinks?.facebook || ""}
                  onChange={(e) => setStore({ ...store, socialLinks: { ...store.socialLinks, facebook: e.target.value } })}
                  onBlur={() => handleSave({ socialLinks: store.socialLinks })}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram URL</label>
                <input
                  type="text"
                  value={store.socialLinks?.instagram || ""}
                  onChange={(e) => setStore({ ...store, socialLinks: { ...store.socialLinks, instagram: e.target.value } })}
                  onBlur={() => handleSave({ socialLinks: store.socialLinks })}
                  placeholder="https://instagram.com/yourpage"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>
            </div>
          )}

          {activeTab === "delivery" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Delivery Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Free Delivery Threshold (৳)</label>
                <input
                  type="number"
                  defaultValue={1500}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
                <p className="text-xs text-gray-500 mt-1">Orders above this amount get free delivery</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Delivery Charge (৳)</label>
                <input
                  type="number"
                  defaultValue={120}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>
              <Link
                href="/dashboard/couriers"
                className="inline-flex items-center gap-2 text-[#1d4ed8] hover:underline text-sm font-medium"
              >
                <Truck size={14} /> Manage Courier Integrations
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}