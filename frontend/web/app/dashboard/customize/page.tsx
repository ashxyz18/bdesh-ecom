"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Paintbrush, Save, Loader2, Eye, Check, ExternalLink, Palette, RotateCcw, Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboard } from "../DashboardContext";

export default function CustomizePage() {
  const { activeStore } = useDashboard();
  const storeId = activeStore?.id;
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [form, setForm] = useState({
    templateId: "default",
    primaryColor: "#006A4E",
    secondaryColor: "#F42A41",
    announcementText: "",
    heroTitle: "",
    heroSubtitle: "",
  });

  const fetchStore = useCallback(async () => {
    if (storeId) {
      try {
        const res = await fetch(`/api/stores/${storeId}`);
        if (res.ok) {
          const data = await res.json();
          const theme = typeof data.theme === "string" ? JSON.parse(data.theme) : data.theme || {};
          const settings = typeof data.settings === "string" ? JSON.parse(data.settings) : data.settings || {};
          setForm({
            templateId: theme.templateId || "default",
            primaryColor: theme.primaryColor || "#006A4E",
            secondaryColor: theme.secondaryColor || "#F42A41",
            announcementText: settings.announcementText || "",
            heroTitle: settings.heroTitle || "",
            heroSubtitle: settings.heroSubtitle || "",
          });
        }
      } catch {
        // Ignore
      }
    } else {
      // Demo mode — load from localStorage
      try {
        const saved = localStorage.getItem("customize-demo-form");
        if (saved) {
          setForm(JSON.parse(saved));
        }
      } catch {
        // Ignore
      }
    }
  }, [storeId]);

  useEffect(() => { fetchStore(); }, [fetchStore]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      if (storeId) {
        const themeRes = await fetch(`/api/stores/${storeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            theme: JSON.stringify({
              templateId: form.templateId,
              primaryColor: form.primaryColor,
              secondaryColor: form.secondaryColor,
            }),
            settings: JSON.stringify({
              announcementText: form.announcementText,
              heroTitle: form.heroTitle,
              heroSubtitle: form.heroSubtitle,
            }),
          }),
        });
        if (themeRes.ok) {
          setMessage({ type: "success", text: "Store customized successfully!" });
        } else {
          setMessage({ type: "error", text: "Failed to save changes" });
        }
      } else {
        // Demo mode — save to localStorage
        localStorage.setItem("customize-demo-form", JSON.stringify(form));
        setMessage({ type: "success", text: "Design saved locally! Create a store to publish." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(f => ({
      ...f,
      primaryColor: "#006A4E",
      secondaryColor: "#F42A41",
    }));
  };

  const isDemo = !activeStore;

  const previewWidth = previewDevice === "desktop" ? "100%" : previewDevice === "tablet" ? "768px" : "375px";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customize {isDemo ? "Website" : "Store"}
          </h1>
          <p className="text-slate-500 mt-1">
            {isDemo
              ? <span>Design your website in demo mode. <Link href="/dashboard/new-store" className="text-emerald-600 font-medium hover:underline">Create a store</Link> to publish.</span>
              : <>Personalize the look and feel of <span className="font-medium text-slate-700">{activeStore.name}</span></>
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeStore && (
            <a
              href={`/store?subdomain=${activeStore.subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <ExternalLink size={14} /> View Store
            </a>
          )}
          {isDemo && (
            <Link href="/dashboard/new-store">
              <Button variant="outline" className="text-emerald-600 border-emerald-300 hover:bg-emerald-50">Create Store to Publish</Button>
            </Link>
          )}
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isDemo ? "Save Demo" : "Save Changes"}
          </Button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Settings */}
        <div className="space-y-6">

          {/* Colors */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Paintbrush size={18} className="text-emerald-600" /> Colors
              </h2>
              <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                <RotateCcw size={12} /> Reset to default
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-1.5">Primary Color</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                  <Input value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} className="flex-1 font-mono text-sm" />
                </div>
              </div>
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-1.5">Secondary Color</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.secondaryColor} onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                  <Input value={form.secondaryColor} onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))} className="flex-1 font-mono text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">Content</h2>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-1.5">Announcement Bar Text</Label>
                <Input
                  value={form.announcementText}
                  onChange={e => setForm(f => ({ ...f, announcementText: e.target.value }))}
                  placeholder="e.g. Free delivery on orders over ৳1,000!"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-1.5">Hero Title</Label>
                <Input
                  value={form.heroTitle}
                  onChange={e => setForm(f => ({ ...f, heroTitle: e.target.value }))}
                  placeholder="Leave blank to use store name"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-1.5">Hero Subtitle</Label>
                <Input
                  value={form.heroSubtitle}
                  onChange={e => setForm(f => ({ ...f, heroSubtitle: e.target.value }))}
                  placeholder="Leave blank to use store description"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Eye size={18} className="text-emerald-600" /> Preview
            </h2>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button onClick={() => setPreviewDevice("desktop")} className={`p-1.5 rounded ${previewDevice === "desktop" ? "bg-white shadow-sm" : ""}`}><Monitor size={14} /></button>
              <button onClick={() => setPreviewDevice("tablet")} className={`p-1.5 rounded ${previewDevice === "tablet" ? "bg-white shadow-sm" : ""}`}><Tablet size={14} /></button>
              <button onClick={() => setPreviewDevice("mobile")} className={`p-1.5 rounded ${previewDevice === "mobile" ? "bg-white shadow-sm" : ""}`}><Smartphone size={14} /></button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50" style={{ width: previewWidth, maxWidth: "100%", transition: "width 0.3s" }}>
              {/* Mini preview */}
              <div style={{ backgroundColor: form.primaryColor }} className="h-6 flex items-center justify-center">
                <p className="text-white text-[9px] tracking-wider">{form.announcementText || "Announcement bar"}</p>
              </div>
              <div style={{ backgroundColor: form.primaryColor }} className="h-10 flex items-center px-3 gap-2">
                <div className="w-4 h-4 rounded bg-white/30" />
                <div className="flex-1" />
                <div className="w-3 h-3 rounded bg-white/20" />
                <div className="w-3 h-3 rounded bg-white/20" />
                <div className="w-3 h-3 rounded bg-white/20" />
              </div>
              <div className="p-4">
                <div className="h-20 rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: `${form.primaryColor}15` }}>
                  <div className="text-center">
                    <p className="text-xs font-bold" style={{ color: form.primaryColor }}>{form.heroTitle || activeStore?.name || "Your Website"}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{form.heroSubtitle || "Your store description here"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-lg border border-slate-200 p-2">
                      <div className="h-12 bg-slate-100 rounded mb-1.5" />
                      <div className="h-2 w-3/4 bg-slate-200 rounded mb-1" />
                      <div className="h-2 w-1/2 rounded" style={{ backgroundColor: form.secondaryColor }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-8" style={{ backgroundColor: form.primaryColor }} />
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center mt-3">This is a simplified preview. View your actual store for the full experience.</p>
        </div>
      </div>
    </div>
  );
}
