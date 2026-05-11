"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, Upload, Image, Type, Palette, Globe, Eye, Check } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [storeName, setStoreName] = useState("My Store");
  const [storeLogo, setStoreLogo] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroSubtext, setHeroSubtext] = useState("");
  const [accentColor, setAccentColor] = useState("#1d4ed8");

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "hero", label: "Hero Section", icon: Image },
    { id: "footer", label: "Footer", icon: Type },
  ];

  useEffect(() => {
    const storedStoreId = localStorage.getItem("storeId");
    setStoreId(storedStoreId);
  }, []);

  useEffect(() => {
    if (!storeId) return;

    async function fetchStore() {
      try {
        const res = await fetch(`/api/stores/${storeId}`);
        const data = await res.json();
        if (data.store) {
          setStoreName(data.store.name || "My Store");
          setStoreLogo(data.store.logo || "");
          setStoreDescription(data.store.description || "");
          setAccentColor(data.store.theme?.primaryColor || "#1d4ed8");
          setHeroImage(data.store.settings?.heroImage || "");
          setHeroHeadline(data.store.settings?.heroHeadline || "");
          setHeroSubtext(data.store.settings?.heroSubtext || "");
        }
      } catch (error) {
        console.error("Failed to fetch store:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStore();
  }, [storeId]);

  const handleSave = async () => {
    if (!storeId) return;

    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: storeName,
          description: storeDescription,
          logo: storeLogo,
          theme: { primaryColor: accentColor },
          settings: {
            heroImage,
            heroHeadline,
            heroSubtext,
          },
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const getPreviewUrl = () => {
    if (!storeId) return "#";
    return `/store/${storeId}`;
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-500 mt-1">Customize your store appearance and settings</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-xl border border-gray-200 p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#1d4ed8] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-6 space-y-2">
            <Link
              href={getPreviewUrl()}
              target="_blank"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
            >
              <Eye size={14} /> Preview Store
            </Link>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === "general" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo URL</label>
                  <input
                    type="text"
                    value={storeLogo}
                    onChange={(e) => setStoreLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                  {storeLogo && (
                    <div className="mt-2">
                      <img src={storeLogo} alt="Logo preview" className="h-12 object-contain" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
                  <textarea
                    rows={3}
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Appearance</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Accent Color</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "hero" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Hero Section</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
                  <input
                    type="text"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="https://example.com/hero.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                  {heroImage && (
                    <div className="mt-2 rounded-lg overflow-hidden h-48">
                      <img src={heroImage} alt="Hero preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Headline</label>
                  <input
                    type="text"
                    value={heroHeadline}
                    onChange={(e) => setHeroHeadline(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtext</label>
                  <input
                    type="text"
                    value={heroSubtext}
                    onChange={(e) => setHeroSubtext(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "footer" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Footer Settings</h2>
              <p className="text-gray-500">Footer customization coming soon.</p>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-4">
            {saved && (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <Check size={16} /> Saved!
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}