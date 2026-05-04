"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Save, Store, Loader2, Palette, Eye, Check, ExternalLink, Globe, Phone, Clock, Info, FileJson, ArrowRight, CreditCard, Shield, ToggleLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboard } from "../DashboardContext";
import { templateList } from "@/lib/store-templates/registry";

interface CustomTemplateItem {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  isPremium: boolean
}

export default function SettingsPage() {
  const { activeStore } = useDashboard();
  const storeId = activeStore?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplateItem[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    subdomain: "",
    phone: "",
    whatsapp: "",
    address: "",
    hours: "",
    primaryColor: "#006A4E",
    secondaryColor: "#F42A41",
    templateId: "default",
  });
  const [gateway, setGateway] = useState({
    stripe: { enabled: false, publicKey: "", secretKey: "", webhookSecret: "" },
    bkash: { enabled: false, username: "", password: "", appKey: "", appSecret: "", sandbox: true },
    nagad: { enabled: false, merchantId: "", publicKey: "", privateKey: "", sandbox: true },
    rocket: { enabled: false, merchantId: "", username: "", password: "", sandbox: true },
    cod: { enabled: true, instructions: "Pay when you receive your order" },
  });
  const [whiteLabel, setWhiteLabel] = useState({
    enabled: false,
    brandName: "",
    hidePoweredBy: false,
    customDomain: "",
  });
  const [gatewaySaving, setGatewaySaving] = useState(false);
  const [gatewayMessage, setGatewayMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCustomTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/templates?includeConfig=false")
      if (res.ok) {
        const data = await res.json()
        setCustomTemplates((data.templates || []).map((t: any) => ({
          id: t.slug || t.id,
          name: t.name,
          slug: t.slug,
          description: t.description,
          category: t.category,
          isPremium: t.isPremium,
        })))
      }
    } catch {}
  }, [])

  useEffect(() => {
    async function fetchStore() {
      if (!storeId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/stores/${storeId}`);
        if (res.ok) {
          const data = await res.json();
          const store = data.store;
          const settings = store.settings || {};
          const theme = store.theme || {};
          setForm({
            name: store.name || "",
            description: store.description || "",
            subdomain: store.subdomain || "",
            phone: (settings as Record<string, string>).phone || "",
            whatsapp: (settings as Record<string, string>).whatsapp || "",
            address: (settings as Record<string, string>).address || "",
            hours: (settings as Record<string, string>).hours || "",
            primaryColor: (theme as Record<string, string>).primaryColor || "#006A4E",
            secondaryColor: (theme as Record<string, string>).secondaryColor || "#F42A41",
            templateId: (theme as Record<string, string>).templateId || "default",
          });
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    fetchStore();
    fetchCustomTemplates();

    // Fetch payment gateway config
    if (storeId) {
      fetch(`/api/payments/gateway?storeId=${storeId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.gateway) {
            setGateway(prev => ({
              stripe: { ...prev.stripe, ...data.gateway.stripe },
              bkash: { ...prev.bkash, ...data.gateway.bkash },
              nagad: { ...prev.nagad, ...data.gateway.nagad },
              rocket: { ...prev.rocket, ...data.gateway.rocket },
              cod: { ...prev.cod, ...data.gateway.cod },
            }));
          }
        })
        .catch(() => {});
    }
  }, [storeId, fetchCustomTemplates]);

  const handleTemplateChange = (templateId: string) => {
    const tpl = templateList.find(t => t.id === templateId);
    if (tpl) {
      setForm(prev => ({
        ...prev,
        templateId,
        primaryColor: tpl.defaultColors.primary,
        secondaryColor: tpl.defaultColors.secondary,
      }));
    } else {
      setForm(prev => ({ ...prev, templateId }));
    }
  };

  const handleGatewaySave = async () => {
    if (!storeId) return;
    setGatewaySaving(true);
    setGatewayMessage(null);
    try {
      const res = await fetch("/api/payments/gateway", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, ...gateway }),
      });
      if (res.ok) {
        setGatewayMessage({ type: "success", text: "Payment settings saved!" });
      } else {
        const data = await res.json();
        setGatewayMessage({ type: "error", text: data.message || "Failed to save" });
      }
    } catch {
      setGatewayMessage({ type: "error", text: "Network error" });
    } finally {
      setGatewaySaving(false);
    }
  };

  const handleSave = async () => {
    if (!storeId) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          theme: {
            templateId: form.templateId,
            primaryColor: form.primaryColor,
            secondaryColor: form.secondaryColor,
          },
          settings: {
            phone: form.phone,
            whatsapp: form.whatsapp,
            address: form.address,
            hours: form.hours,
          },
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.message || "Failed to save settings" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (!storeId) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Store className="text-slate-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Store Selected</h2>
        <p className="text-slate-500">Select a store from the sidebar to manage settings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  const storePreviewUrl = `/?store=${form.subdomain}`;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Store Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your store appearance and information</p>
        </div>
        <div className="flex items-center gap-3">
          <a href={storePreviewUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="flex items-center gap-2 text-sm border-slate-200 hover:bg-slate-50">
              <ExternalLink size={15} /> Preview
            </Button>
          </a>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save Changes
          </Button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
          message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {message.type === "success" ? <Check size={16} /> : <Info size={16} />}
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* General */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Globe size={16} className="text-blue-600" />
            </div>
            <h2 className="font-semibold text-slate-900">General</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className={labelClass}>Store Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <Label className={labelClass}>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className={inputClass + " resize-none"}
                placeholder="Tell customers about your store..."
              />
            </div>
            <div>
              <Label className={labelClass}>Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input value={form.subdomain} disabled className={inputClass + " bg-slate-50 text-slate-500"} />
                <span className="text-sm text-slate-400 whitespace-nowrap">.bdesh.shop</span>
              </div>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Palette size={16} className="text-purple-600" />
              </div>
              <h2 className="font-semibold text-slate-900">Store Template</h2>
            </div>
            <Link href="/dashboard/templates" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              Manage Templates <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-sm text-slate-500 mb-5 ml-10">Choose a template for your store. Switching templates will update your store's design instantly.</p>
          <div className="grid gap-3">
            {/* Built-in templates */}
            {templateList.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => handleTemplateChange(tpl.id)}
                className={`relative flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  form.templateId === tpl.id
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                {form.templateId === tpl.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}
                <div
                  className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${tpl.defaultColors.primary}, ${tpl.defaultColors.secondary})` }}
                >
                  <span className="text-white font-bold text-lg">{tpl.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{tpl.name}</h3>
                    {tpl.isPremium && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">PREMIUM</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{tpl.tagline}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tpl.features.slice(0, 3).map(f => (
                      <span key={f} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}

            {/* Custom templates */}
            {customTemplates.length > 0 && (
              <>
                <div className="flex items-center gap-2 pt-3 pb-1">
                  <FileJson size={14} className="text-purple-500" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Custom Templates</span>
                </div>
                {customTemplates.map(tpl => (
                  <button
                    key={tpl.slug}
                    onClick={() => handleTemplateChange(tpl.slug)}
                    className={`relative flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      form.templateId === tpl.slug
                        ? "border-emerald-500 bg-emerald-50/50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    {form.templateId === tpl.slug && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                    <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm bg-gradient-to-br from-purple-100 to-indigo-100">
                      <FileJson size={24} className="text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{tpl.name}</h3>
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{tpl.category}</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{tpl.description || "Custom template"}</p>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Palette size={16} className="text-emerald-600" />
            </div>
            <h2 className="font-semibold text-slate-900">Appearance</h2>
          </div>
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Label className={labelClass}>Primary Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <Input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <Label className={labelClass}>Secondary Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <Input value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} className={inputClass} />
                </div>
              </div>
            </div>
            {/* Color preview */}
            <div>
              <Label className={labelClass}>Preview</Label>
              <div className="flex rounded-xl overflow-hidden h-12 border border-slate-200 shadow-sm">
                <div className="flex-1 flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: form.primaryColor }}>
                  Primary
                </div>
                <div className="flex-1 flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: form.secondaryColor }}>
                  Secondary
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Phone size={16} className="text-amber-600" />
            </div>
            <h2 className="font-semibold text-slate-900">Contact Information</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className={labelClass}>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" className={inputClass} />
            </div>
            <div>
              <Label className={labelClass}>WhatsApp</Label>
              <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="01XXXXXXXXX" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <Label className={labelClass}>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House #, Road, Area, City" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <Label className={labelClass}>Business Hours</Label>
              <Input value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="Sat-Thu: 10AM-10PM, Fri: 3PM-10PM" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                <CreditCard size={16} className="text-pink-600" />
              </div>
              <h2 className="font-semibold text-slate-900">Payment Gateways</h2>
            </div>
            <Button
              onClick={handleGatewaySave}
              disabled={gatewaySaving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-sm"
            >
              {gatewaySaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              Save Payments
            </Button>
          </div>

          {gatewayMessage && (
            <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
              gatewayMessage.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {gatewayMessage.type === "success" ? <Check size={14} /> : <Info size={14} />}
              {gatewayMessage.text}
            </div>
          )}

          <div className="space-y-6">
            {/* bKash */}
            <div className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white text-[10px] font-bold">b</div>
                  <span className="font-medium text-slate-900">bKash</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-slate-500">{gateway.bkash.enabled ? "Enabled" : "Disabled"}</span>
                  <input
                    type="checkbox"
                    checked={gateway.bkash.enabled}
                    onChange={e => setGateway({ ...gateway, bkash: { ...gateway.bkash, enabled: e.target.checked } })}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>
              {gateway.bkash.enabled && (
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <Input value={gateway.bkash.username} onChange={e => setGateway({ ...gateway, bkash: { ...gateway.bkash, username: e.target.value } })} placeholder="Username" className={inputClass} />
                  <Input value={gateway.bkash.password} onChange={e => setGateway({ ...gateway, bkash: { ...gateway.bkash, password: e.target.value } })} placeholder="Password" type="password" className={inputClass} />
                  <Input value={gateway.bkash.appKey} onChange={e => setGateway({ ...gateway, bkash: { ...gateway.bkash, appKey: e.target.value } })} placeholder="App Key" className={inputClass} />
                  <Input value={gateway.bkash.appSecret} onChange={e => setGateway({ ...gateway, bkash: { ...gateway.bkash, appSecret: e.target.value } })} placeholder="App Secret" type="password" className={inputClass} />
                  <label className="flex items-center gap-2 sm:col-span-2">
                    <input type="checkbox" checked={gateway.bkash.sandbox} onChange={e => setGateway({ ...gateway, bkash: { ...gateway.bkash, sandbox: e.target.checked } })} className="w-4 h-4 rounded border-slate-300 text-emerald-600" />
                    <span className="text-sm text-slate-600">Sandbox mode</span>
                  </label>
                </div>
              )}
            </div>

            {/* Nagad */}
            <div className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">N</div>
                  <span className="font-medium text-slate-900">Nagad</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-slate-500">{gateway.nagad.enabled ? "Enabled" : "Disabled"}</span>
                  <input
                    type="checkbox"
                    checked={gateway.nagad.enabled}
                    onChange={e => setGateway({ ...gateway, nagad: { ...gateway.nagad, enabled: e.target.checked } })}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>
              {gateway.nagad.enabled && (
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <Input value={gateway.nagad.merchantId} onChange={e => setGateway({ ...gateway, nagad: { ...gateway.nagad, merchantId: e.target.value } })} placeholder="Merchant ID" className={inputClass} />
                  <Input value={gateway.nagad.publicKey} onChange={e => setGateway({ ...gateway, nagad: { ...gateway.nagad, publicKey: e.target.value } })} placeholder="Public Key" className={inputClass} />
                  <Input value={gateway.nagad.privateKey} onChange={e => setGateway({ ...gateway, nagad: { ...gateway.nagad, privateKey: e.target.value } })} placeholder="Private Key" type="password" className={inputClass} />
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={gateway.nagad.sandbox} onChange={e => setGateway({ ...gateway, nagad: { ...gateway.nagad, sandbox: e.target.checked } })} className="w-4 h-4 rounded border-slate-300 text-emerald-600" />
                    <span className="text-sm text-slate-600">Sandbox mode</span>
                  </label>
                </div>
              )}
            </div>

            {/* Rocket */}
            <div className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold">R</div>
                  <span className="font-medium text-slate-900">Rocket</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-slate-500">{gateway.rocket.enabled ? "Enabled" : "Disabled"}</span>
                  <input
                    type="checkbox"
                    checked={gateway.rocket.enabled}
                    onChange={e => setGateway({ ...gateway, rocket: { ...gateway.rocket, enabled: e.target.checked } })}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>
              {gateway.rocket.enabled && (
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <Input value={gateway.rocket.merchantId} onChange={e => setGateway({ ...gateway, rocket: { ...gateway.rocket, merchantId: e.target.value } })} placeholder="Merchant ID" className={inputClass} />
                  <Input value={gateway.rocket.username} onChange={e => setGateway({ ...gateway, rocket: { ...gateway.rocket, username: e.target.value } })} placeholder="Username" className={inputClass} />
                  <Input value={gateway.rocket.password} onChange={e => setGateway({ ...gateway, rocket: { ...gateway.rocket, password: e.target.value } })} placeholder="Password" type="password" className={inputClass} />
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={gateway.rocket.sandbox} onChange={e => setGateway({ ...gateway, rocket: { ...gateway.rocket, sandbox: e.target.checked } })} className="w-4 h-4 rounded border-slate-300 text-emerald-600" />
                    <span className="text-sm text-slate-600">Sandbox mode</span>
                  </label>
                </div>
              )}
            </div>

            {/* Stripe */}
            <div className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">S</div>
                  <span className="font-medium text-slate-900">Stripe (Card Payments)</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-slate-500">{gateway.stripe.enabled ? "Enabled" : "Disabled"}</span>
                  <input
                    type="checkbox"
                    checked={gateway.stripe.enabled}
                    onChange={e => setGateway({ ...gateway, stripe: { ...gateway.stripe, enabled: e.target.checked } })}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>
              {gateway.stripe.enabled && (
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <Input value={gateway.stripe.publicKey} onChange={e => setGateway({ ...gateway, stripe: { ...gateway.stripe, publicKey: e.target.value } })} placeholder="Publishable Key (pk_...)" className={inputClass} />
                  <Input value={gateway.stripe.secretKey} onChange={e => setGateway({ ...gateway, stripe: { ...gateway.stripe, secretKey: e.target.value } })} placeholder="Secret Key (sk_...)" type="password" className={inputClass} />
                  <Input value={gateway.stripe.webhookSecret} onChange={e => setGateway({ ...gateway, stripe: { ...gateway.stripe, webhookSecret: e.target.value } })} placeholder="Webhook Secret (whsec_...)" type="password" className={inputClass} />
                </div>
              )}
            </div>

            {/* Cash on Delivery */}
            <div className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">$</div>
                  <span className="font-medium text-slate-900">Cash on Delivery</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-slate-500">{gateway.cod.enabled ? "Enabled" : "Disabled"}</span>
                  <input
                    type="checkbox"
                    checked={gateway.cod.enabled}
                    onChange={e => setGateway({ ...gateway, cod: { ...gateway.cod, enabled: e.target.checked } })}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>
              {gateway.cod.enabled && (
                <div className="mt-3">
                  <Label className={labelClass}>Instructions</Label>
                  <textarea
                    value={gateway.cod.instructions}
                    onChange={e => setGateway({ ...gateway, cod: { ...gateway.cod, instructions: e.target.value } })}
                    rows={2}
                    className={inputClass + " resize-none"}
                    placeholder="Payment instructions for customers..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* White-Label / Branding */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Shield size={16} className="text-violet-600" />
            </div>
            <h2 className="font-semibold text-slate-900">White-Label & Branding</h2>
            <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">ENTERPRISE</span>
          </div>
          <p className="text-sm text-slate-500 mb-4">Remove Bdesh branding and use your own brand name, logo, and domain. Available on Enterprise plan.</p>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={whiteLabel.enabled}
                onChange={e => setWhiteLabel({ ...whiteLabel, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Enable White-Label</span>
                <p className="text-xs text-slate-400">Remove "Powered by Bdesh" from your store</p>
              </div>
            </label>
            {whiteLabel.enabled && (
              <>
                <div>
                  <Label className={labelClass}>Brand Name</Label>
                  <Input
                    value={whiteLabel.brandName}
                    onChange={e => setWhiteLabel({ ...whiteLabel, brandName: e.target.value })}
                    placeholder="Your brand name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Custom Domain</Label>
                  <Input
                    value={whiteLabel.customDomain}
                    onChange={e => setWhiteLabel({ ...whiteLabel, customDomain: e.target.value })}
                    placeholder="shop.yourdomain.com"
                    className={inputClass}
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whiteLabel.hidePoweredBy}
                    onChange={e => setWhiteLabel({ ...whiteLabel, hidePoweredBy: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Hide "Powered by Bdesh" footer</span>
                </label>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
