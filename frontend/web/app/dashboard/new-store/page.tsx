"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles, ShoppingBag, Minimize2, Eye, Check, ArrowLeft, ArrowRight,
  Loader2, Globe, Flower2, Leaf, Cpu, UtensilsCrossed, Shirt,
  Scissors, BookOpen, Stethoscope, Pill, Briefcase, Blocks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useDashboard } from "../DashboardContext";

interface StoreTemplate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  features: string[];
  isPremium: boolean;
  defaultColors: { primary: string; secondary: string; accent: string };
}

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
  koskii: Sparkles,
};

const templateList: StoreTemplate[] = [
  { id: "default", name: "Modern Shop", tagline: "Clean & Professional", description: "Bright, modern layout perfect for any type of product store", color: "from-emerald-600 to-teal-700", features: ["Clean product grid", "Collection filters", "Fast checkout", "Mobile-first"], isPremium: false, defaultColors: { primary: "#006A4E", secondary: "#F42A41", accent: "#059669" } },
  { id: "roseo", name: "Roseo", tagline: "Premium & Luxurious", description: "Dark, elegant design for leather goods, fashion, and premium products", color: "from-stone-900 to-amber-900", features: ["Dark luxury aesthetic", "Product quick view", "Wishlist & cart", "Customer reviews"], isPremium: true, defaultColors: { primary: "#1c1917", secondary: "#b45309", accent: "#d97706" } },
  { id: "shopify", name: "Minimal", tagline: "Simple & Fast", description: "Minimalist design focused on speed and conversion for any store", color: "from-blue-600 to-indigo-700", features: ["Ultra-fast loading", "Minimal design", "One-page checkout", "SEO optimized"], isPremium: false, defaultColors: { primary: "#2563eb", secondary: "#4f46e5", accent: "#3b82f6" } },
  { id: "shopnest", name: "ShopNest", tagline: "Colorful & Fun", description: "Vibrant, colorful design for fashion and lifestyle brands", color: "from-pink-500 to-rose-600", features: ["Colorful design", "Instagram-style", "Size guide", "Wishlist"], isPremium: false, defaultColors: { primary: "#ec4899", secondary: "#f43f5e", accent: "#f97316" } },
  { id: "food", name: "Foodie", tagline: "Delicious & Appetizing", description: "Mouth-watering design for restaurants, bakeries, and food delivery", color: "from-orange-500 to-red-600", features: ["Menu display", "Online ordering", "Delivery tracking", "Reservation system"], isPremium: false, defaultColors: { primary: "#ea580c", secondary: "#dc2626", accent: "#f97316" } },
  { id: "grocer", name: "Grocer", tagline: "Fresh & Organized", description: "Clean, organized layout for grocery and everyday essentials", color: "from-green-500 to-emerald-600", features: ["Category navigation", "Bulk pricing", "Subscription options", "Quick reorder"], isPremium: false, defaultColors: { primary: "#16a34a", secondary: "#059669", accent: "#22c55e" } },
  { id: "salon", name: "Salon", tagline: "Elegant & Beautiful", description: "Sophisticated design for salons, spas, and beauty services", color: "from-purple-500 to-violet-600", features: ["Service booking", "Gallery showcase", "Team profiles", "Online payments"], isPremium: false, defaultColors: { primary: "#7c3aed", secondary: "#8b5cf6", accent: "#a855f7" } },
  { id: "pharmacy", name: "Pharmacy", tagline: "Trusted & Professional", description: "Clean, trustworthy design for pharmacies and health stores", color: "from-teal-500 to-cyan-600", features: ["Product search", "Upload prescription", "Health blog", "Delivery options"], isPremium: false, defaultColors: { primary: "#0d9488", secondary: "#0891b2", accent: "#14b8a6" } },
  { id: "koskii", name: "Koskii", tagline: "Women's Ethnic Fashion", description: "Elegant ethnic fashion e-commerce with silk sarees, salwar suits, lehengas, and gowns. Features product sliders, wishlists, and premium shopping experience.", color: "from-stone-800 to-amber-700", features: ["Product sliders with quick add", "Wishlist functionality", "Shopping cart drawer", "Search overlay", "Mobile bottom navigation", "Testimonials", "Newsletter signup"], isPremium: true, defaultColors: { primary: "#1a1a1a", secondary: "#d4af37", accent: "#d4af37" } },
];

const templates = templateList.map(t => ({
  ...t,
  icon: templateIcons[t.id] || Blocks,
}));

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

    const prebuiltWebsites = ["koskii"];
    const isPrebuilt = prebuiltWebsites.includes(selectedTemplate);

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
            prebuiltWebsiteId: isPrebuilt ? selectedTemplate : null,
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
          Choose Design
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
            <p className="text-slate-500 mt-1">Pick a design that matches your brand. You can always change it later.</p>
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
                    <div className="absolute top-3 right-3">
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
              Continue with {selectedTpl?.name || "Design"}
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
            <p className="text-slate-500 mt-1">Using the <span className="font-semibold text-slate-700">{selectedTpl?.name}</span> design</p>
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
