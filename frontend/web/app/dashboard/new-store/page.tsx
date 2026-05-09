"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles, ShoppingBag, Minimize2, Eye, Check, ArrowLeft, ArrowRight,
  Loader2, Globe, Flower2, Leaf, Cpu, UtensilsCrossed, Shirt,
  Scissors, BookOpen, Stethoscope, Pill, Briefcase, Blocks, Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useDashboard } from "../DashboardContext";
import { templateList } from "@/lib/store-templates/registry";
import type { TemplateInfo } from "@/lib/store-templates/registry";

// Map template IDs to their display icons
const templateIcons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  roseo: Sparkles,
  default: ShoppingBag,
  shopify: Minimize2,
  shopnest: Shirt,
  food: UtensilsCrossed,
  electro: Cpu,
  boutique: Flower2,
  grocer: Leaf,
  salon: Scissors,
  tuition: BookOpen,
  clinic: Stethoscope,
  pharmacy: Pill,
  corporate: Briefcase,
  portfolio: Blocks,
};

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="flex items-center gap-4 mb-8">
        <div className="h-10 w-40 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-px flex-1 bg-slate-200" />
        <div className="h-10 w-40 bg-slate-200 rounded-xl animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl border-2 border-slate-200 overflow-hidden">
            <div className="h-36 bg-slate-100 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Merge the registry template info with icons for the new-store page */
const templates: (TemplateInfo & { icon: React.ComponentType<{ className?: string; size?: number }> })[] = templateList.map(t => ({
  ...t,
  icon: templateIcons[t.id] || Blocks,
}));

export default function NewStorePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <NewStorePageInner />
    </Suspense>
  );
}

function NewStorePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshStores } = useDashboard();
  const preselectedTemplate = searchParams.get("template") || "";

  const [step, setStep] = useState<"template" | "details">(preselectedTemplate ? "details" : "template");
  const [selectedTemplate, setSelectedTemplate] = useState(preselectedTemplate || "");
  const [form, setForm] = useState({
    name: "",
    subdomain: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

  const checkSubdomain = async (subdomain: string) => {
    if (subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }
    setCheckingSubdomain(true);
    try {
      const res = await fetch(`/api/stores?check=${subdomain}`);
      if (res.ok) {
        const data = await res.json();
        setSubdomainAvailable(!data.exists);
      }
    } catch {
      // Ignore
    } finally {
      setCheckingSubdomain(false);
    }
  };

  const handleSubdomainChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
    setForm({ ...form, subdomain: sanitized });
    setSubdomainAvailable(null);
    const timer = setTimeout(() => checkSubdomain(sanitized), 500);
    return () => clearTimeout(timer);
  };

  const getTemplateTheme = (id: string) => {
    const tpl = templates.find(t => t.id === id);
    const colors = tpl?.defaultColors ?? {
      primary: "#006A4E",
      secondary: "#F42A41",
      accent: "#059669",
    };
    return colors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const theme = getTemplateTheme(selectedTemplate);
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category: selectedTemplate,
          theme: JSON.stringify({
            templateId: selectedTemplate,
            ...theme,
          }),
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {
        // Fallback if response isn't JSON
      }

      if (!res.ok) {
        setError(data.message || "Failed to create store. The store name or subdomain might already be taken.");
        return;
      }

      await refreshStores();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Store creation error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  const selectedTpl = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => step === "details" && setStep("template")}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            step === "template" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">1</span>
          Choose Template
        </button>
        <div className="h-px flex-1 bg-slate-200" />
        <div className="h-px flex-1 bg-slate-200" />
        <button
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            step === "details" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
          disabled={step !== "details"}
        >
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">2</span>
          Store Details
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Step 1: Template Selection */}
      {step === "template" && (
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Choose Your Store Design</h1>
            <p className="text-slate-500 mt-1">Pick a template that matches your brand. You can always change it later.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {templates.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                    selectedTemplate === tpl.id
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  {/* Preview */}
                  <div className={`h-36 bg-gradient-to-br ${tpl.color} p-5 flex flex-col justify-between relative`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-bold text-sm">{tpl.name}</span>
                      {tpl.isPremium && (
                        <span className="text-[10px] font-bold bg-amber-400/90 text-amber-900 px-2 py-0.5 rounded-full">PREMIUM</span>
                      )}
                    </div>
                    <p className="text-white/70 text-xs">{tpl.tagline}</p>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <a
                        href={`/preview/${tpl.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-7 h-7 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-white" />
                      </a>
                      {selectedTemplate === tpl.id && (
                        <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-sm text-slate-900 mb-1">{tpl.name}</h3>
                    <p className="text-xs text-slate-500 mb-3">{tpl.description}</p>
                    <div className="space-y-1.5">
                      {tpl.features.map((f) => (
                        <div key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={() => {
                if (selectedTemplate) setStep("details");
              }}
              disabled={!selectedTemplate}
              size="lg"
              className="px-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
            >
              Continue with {selectedTpl?.name || "Template"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Store Details */}
      {step === "details" && (
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Name Your Store</h1>
            <p className="text-slate-500 mt-1">Using the <span className="font-semibold text-slate-700">{selectedTpl?.name}</span> template</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 max-w-lg shadow-sm">
            {/* Selected template badge */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedTpl?.color} flex items-center justify-center`}>
                {selectedTpl && <selectedTpl.icon className="w-5 h-5 text-white" />}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{selectedTpl?.name}</p>
                <p className="text-xs text-slate-500">{selectedTpl?.tagline}</p>
              </div>
              <button onClick={() => setStep("template")} className="ml-auto text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                Change
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className={labelClass}>Store Name *</Label>
                <Input
                  value={form.name}
                  onSubmit={() => setForm({ ...form, name: form.name })}
                  placeholder="My Store"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <Label className={labelClass}>Subdomain *</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={form.subdomain}
                      onChange={(e) => handleSubdomainChange(e.target.value)}
                      placeholder="mystore"
                      className={inputClass + " pl-9"}
                      required
                    />
                  </div>
                  <span className="text-sm text-slate-400 whitespace-nowrap">.bdesh.shop</span>
                </div>
                {checkingSubdomain && (
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" /> Checking availability...
                  </p>
                )}
                {subdomainAvailable === true && (
                  <p className="text-xs text-emerald-600 mt-1.5 font-medium">Available!</p>
                )}
                {subdomainAvailable === false && (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">Already taken</p>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="outline" onClick={() => setStep("template")} className="px-6 border-slate-200 hover:bg-slate-50">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20" disabled={loading || subdomainAvailable === false}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Store
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
