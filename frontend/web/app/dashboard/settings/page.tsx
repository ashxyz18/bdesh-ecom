"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings, Palette, Image, Type, Globe, Truck,
  Save, Loader2, Check, Plus, Eye, Trash2, Link2, Copy, ExternalLink
} from "lucide-react";

interface Store {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
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
    customDomain?: string;
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

  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "hero", label: "Hero & Banners", icon: Image },
    { id: "domain", label: "Domain", icon: Link2 },
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

          {activeTab === "domain" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Domain Settings</h2>

              {/* Free Subdomain */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={16} className="text-blue-600" />
                  <h3 className="text-sm font-semibold text-blue-900">Your Free Subdomain</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-blue-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-800">
                    {store.subdomain || store.slug}.bdesh.com
                  </div>
                  <button
                    onClick={() => copyToClipboard(`https://${store.subdomain || store.slug}.bdesh.com`)}
                    className="px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-sm"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <a
                    href={`/store/${store.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2.5 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5 text-sm"
                  >
                    <ExternalLink size={14} />
                    Visit
                  </a>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  This subdomain is always available for free with your store.
                </p>
              </div>

              {/* Custom Domain */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 size={16} className="text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Custom Domain</h3>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pro Plan</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Custom Domain</label>
                  <input
                    type="text"
                    value={store.settings?.customDomain || ""}
                    onChange={(e) => setStore({ ...store, settings: { ...store.settings, customDomain: e.target.value } })}
                    placeholder="www.mystore.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>
                <button
                  onClick={() => handleSave({ settings: { ...store.settings, customDomain: store.settings?.customDomain } })}
                  disabled={saving}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors disabled:opacity-50 text-sm"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Domain
                </button>

                {/* DNS Instructions */}
                {store.settings?.customDomain && (
                  <div className="mt-5 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">DNS Configuration</h4>
                    <p className="text-xs text-gray-500 mb-3">
                      Add the following DNS records at your domain registrar:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-gray-500 border-b border-gray-200">
                            <th className="pb-2 pr-4">Type</th>
                            <th className="pb-2 pr-4">Name</th>
                            <th className="pb-2">Value</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono text-gray-800">
                          <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">CNAME</td>
                            <td className="py-2 pr-4">www</td>
                            <td className="py-2">{store.subdomain || store.slug}.bdesh.com</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-4">CNAME</td>
                            <td className="py-2 pr-4">@</td>
                            <td className="py-2">{store.subdomain || store.slug}.bdesh.com</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      DNS changes can take up to 48 hours to propagate.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}