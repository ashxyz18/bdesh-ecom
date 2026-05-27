"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, CheckCircle, Palette, Upload, Eye, ArrowRight, ArrowLeft,
  Store as StoreIcon, Type, Image as ImageIcon, Layers
} from "lucide-react";

// ── Step 1: Brand Identity ──
interface BrandInfo {
  storeName: string;
  description: string;
  logo: string;
  businessType: string;
  primaryColor: string;
  accentColor: string;
}

// ── Step 2: Template Selection ──
interface TemplateOption {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  previewUrl?: string;
  isUploaded?: boolean;
  category?: string;
  websiteType?: string;
  buildStatus?: string;
}

const BUSINESS_TYPES = [
  { value: "ECOMMERCE", label: "🛍️ E-Commerce Store", desc: "Sell physical or digital products online" },
  { value: "RESTAURANT", label: "🍕 Restaurant & Cafe", desc: "Menu, orders, reservations" },
  { value: "PORTFOLIO", label: "💼 Portfolio / Agency", desc: "Showcase your work and services" },
  { value: "BLOG", label: "📝 Blog / Magazine", desc: "Content-driven website" },
  { value: "CORPORATE", label: "🏢 Corporate / SaaS", desc: "Business website with landing pages" },
  { value: "EDUCATION", label: "📚 Education / Courses", desc: "Online courses, tutorials" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [uploadedTemplates, setUploadedTemplates] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);

  // Step 1: Brand Identity
  const [brand, setBrand] = useState<BrandInfo>({
    storeName: "",
    description: "",
    logo: "",
    businessType: "ECOMMERCE",
    primaryColor: "#1d4ed8",
    accentColor: "#f97316",
  });

  // Step 2: Template Selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const storedStoreId = localStorage.getItem("storeId");

    if (!userData || !storedStoreId) {
      router.push("/signup");
      return;
    }

    setStoreId(storedStoreId);

    // Fetch existing store data to pre-fill
    fetch(`/api/stores/${storedStoreId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.store?.name) {
          setBrand((prev) => ({ ...prev, storeName: data.store.name }));
        }
      })
      .catch(console.error);

    // Fetch all templates (built-in + uploaded). The API now returns the
    // first-party templates inline so we don't need a hardcoded fallback.
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.templates)) {
          const all = data.templates
            .filter((t: any) => t.buildStatus === "ready")
            .map((t: any) => ({
              id: t.slug || t.id,
              name: t.name,
              description: t.description,
              thumbnail: t.thumbnail,
              previewUrl: t.previewUrl || `/templates/${t.slug || t.id}`,
              isUploaded: !t.isBuiltIn,
              category: t.category,
              websiteType: t.websiteType,
            }));
          setUploadedTemplates(all);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const allTemplates = uploadedTemplates;

  // Filter templates by selected business type
  const filteredTemplates = allTemplates.filter((t) => {
    if (!t.websiteType) return true;
    return t.websiteType === brand.businessType;
  });

  // Show all if filtered is empty
  const displayTemplates = filteredTemplates.length > 0 ? filteredTemplates : allTemplates;

  const handleLogoUpload = async (file: File) => {
    if (!storeId) return;
    setLogoUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/stores/${storeId}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setBrand((prev) => ({ ...prev, logo: data.url }));
      } else {
        setError(data.error || "Failed to upload logo");
      }
    } catch {
      setError("Network error during logo upload");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSaveBrand = async () => {
    if (!storeId || !brand.storeName.trim()) {
      setError("Please enter a store name");
      return;
    }
    setError(null);
    setApplying(true);

    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: brand.storeName,
          description: brand.description,
          logo: brand.logo,
          websiteType: brand.businessType,
          theme: {
            primaryColor: brand.primaryColor,
            accentColor: brand.accentColor,
          },
        }),
      });

      if (res.ok) {
        setStep(2);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save brand info");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const handleSelectTemplate = async () => {
    if (!selectedTemplateId || !storeId) return;
    setApplying(true);
    setError(null);

    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplateId }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to apply template");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <StoreIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900 font-bold text-lg">Set Up Your Store</span>
          </div>
          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            <StepDot active={step === 1} done={step > 1} label="1" />
            <div className={`w-8 h-0.5 ${step > 1 ? "bg-blue-600" : "bg-gray-300"}`} />
            <StepDot active={step === 2} done={false} label="2" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* STEP 1: Brand Identity */}
        {/* ═══════════════════════════════════════════════════ */}
        {step === 1 && (
          <div>
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Tell us about your brand
              </h1>
              <p className="text-gray-500 max-w-xl mx-auto">
                This information will be used to personalize your store and template.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
              {/* Store Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Store Name *
                </label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={brand.storeName}
                    onChange={(e) => setBrand({ ...brand, storeName: e.target.value })}
                    placeholder="e.g. Urban Kicks, Chai & Co."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Type *
                </label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BUSINESS_TYPES.map((bt) => (
                    <button
                      key={bt.value}
                      onClick={() => setBrand({ ...brand, businessType: bt.value })}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        brand.businessType === bt.value
                          ? "border-blue-600 bg-blue-50 ring-1 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-sm">{bt.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{bt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={brand.description}
                  onChange={(e) => setBrand({ ...brand, description: e.target.value })}
                  placeholder="Briefly describe what your store sells..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Store Logo
                </label>
                <div className="flex items-center gap-4">
                  {brand.logo ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white">
                      <img src={brand.logo} alt="Logo preview" className="w-full h-full object-contain" />
                      <button
                        onClick={() => setBrand((prev) => ({ ...prev, logo: "" }))}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                        title="Remove logo"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <label className={`flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer text-sm text-gray-600 transition-colors ${logoUploading ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}>
                    {logoUploading ? (
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                    ) : (
                      <Upload size={16} />
                    )}
                    {logoUploading ? "Uploading..." : brand.logo ? "Change Logo" : "Upload Logo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={logoUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file);
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Recommended: square image, PNG or JPG, max 5MB
                </p>
              </div>

              {/* Brand Colors */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand Colors
                </label>
                <div className="flex gap-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brand.primaryColor}
                      onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Primary</p>
                      <p className="text-xs text-gray-400 font-mono">{brand.primaryColor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brand.accentColor}
                      onChange={(e) => setBrand({ ...brand, accentColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Accent</p>
                      <p className="text-xs text-gray-400 font-mono">{brand.accentColor}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={handleSaveBrand}
                disabled={!brand.storeName.trim() || applying}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {applying ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Continue to Templates
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* STEP 2: Template Selection */}
        {/* ═══════════════════════════════════════════════════ */}
        {step === 2 && (
          <div>
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Choose Your Template
              </h1>
              <p className="text-gray-500 max-w-xl mx-auto">
                Pick a design that matches your brand. Your dashboard will adapt automatically.
              </p>
            </div>

            {/* Recommended for your business type */}
            {filteredTemplates.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Layers size={18} className="text-blue-600" />
                  Recommended for {BUSINESS_TYPES.find((b) => b.value === brand.businessType)?.label || "your business"}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template, index) => (
                    <TemplateCard
                      key={`rec-${template.id}-${index}`}
                      template={template}
                      isSelected={selectedTemplateId === template.id}
                      onSelect={() => setSelectedTemplateId(template.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Templates */}
            {filteredTemplates.length < allTemplates.length && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">All Templates</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allTemplates
                    .filter((t) => !filteredTemplates.some((f) => f.id === t.id))
                    .map((template, index) => (
                      <TemplateCard
                        key={`all-${template.id}-${index}`}
                        template={template}
                        isSelected={selectedTemplateId === template.id}
                        onSelect={() => setSelectedTemplateId(template.id)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Import CTA */}
            <div className="mt-8 p-6 border-2 border-dashed border-gray-300 rounded-xl text-center">
              <p className="text-gray-500 mb-4">
                Have a website built externally? Import it as a ZIP file.
              </p>
              <a
                href="/dashboard/upload-template"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <Upload size={18} />
                Import Your Template
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-4 sm:px-6 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                <ArrowLeft size={16} />
                Back to Brand Info
              </button>
            )}
            {step === 1 && (
              <div className="text-sm text-gray-400">Step 1 of 2</div>
            )}
          </div>

          {step === 2 && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {selectedTemplateId ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-gray-900 font-medium">
                      {allTemplates.find((t) => t.id === selectedTemplateId)?.name}
                    </span>
                    selected
                  </span>
                ) : (
                  "Select a template to continue"
                )}
              </div>
              <button
                onClick={handleSelectTemplate}
                disabled={!selectedTemplateId || applying}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {applying ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Launch My Store
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Components ──

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
        done
          ? "bg-blue-600 text-white"
          : active
          ? "bg-blue-600 text-white ring-4 ring-blue-100"
          : "bg-gray-200 text-gray-500"
      }`}
    >
      {done ? <CheckCircle size={16} /> : label}
    </div>
  );
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
}: {
  template: TemplateOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const previewUrl = template.previewUrl || `/templates/${template.id}/index.html`;

  return (
    <div
      className={`relative rounded-xl overflow-hidden cursor-pointer bg-white border-2 transition-all ${
        isSelected
          ? "border-blue-600 shadow-lg ring-2 ring-blue-100"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      }`}
      onClick={onSelect}
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
        {template.thumbnail ? (
          <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
        ) : template.isUploaded ? (
          <div className="absolute inset-0 bg-white overflow-hidden pointer-events-none">
            <iframe
              src={previewUrl}
              className="border-0 bg-white"
              style={{
                width: "400%",
                height: "400%",
                transform: "scale(0.25)",
                transformOrigin: "0 0",
                pointerEvents: "none",
              }}
              scrolling="no"
              tabIndex={-1}
              loading="lazy"
              title={`Preview of ${template.name}`}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
            <span className="text-4xl">🎨</span>
          </div>
        )}
        {isSelected && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle size={18} className="text-white" />
          </div>
        )}
        {template.isUploaded && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-purple-600 text-white text-xs rounded font-medium">
            Custom
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{template.name}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {template.description || "Custom template"}
        </p>
      </div>
    </div>
  );
}
