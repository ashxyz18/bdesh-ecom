"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { StepIndicator } from "./StepIndicator";
import { TemplatePicker } from "./TemplatePicker";
import { CustomizationPanel } from "./CustomizationPanel";
import { BackgroundPreview } from "./BackgroundPreview";
import { SectionManager } from "./SectionManager";
import { templates } from "@/lib/marketing-data";
import type { TemplateColors, TemplateTypography, TemplateLayout } from "@/lib/store-templates/engine/types";
import { ArrowRight, ArrowLeft, Sparkles, Globe, ShoppingBag, Check, Loader2 } from "lucide-react";

export interface OnboardingStep {
  id: string;
  label: string;
  labelBn: string;
}

const STEPS: OnboardingStep[] = [
  { id: "business", label: "Business", labelBn: "ব্যবসা" },
  { id: "template", label: "Template", labelBn: "টেমপ্লেট" },
  { id: "customize", label: "Customize", labelBn: "কাস্টমাইজ" },
  { id: "products", label: "Products", labelBn: "প্রোডাক্ট" },
  { id: "domain", label: "Domain", labelBn: "ডোমেইন" },
  { id: "payment", label: "Payment", labelBn: "পেমেন্ট" },
];

interface OnboardingWizardProps {
  lang: "en" | "bn";
}

const businessTypes: { id: string; label: string; labelBn: string }[] = [
  { id: "fashion", label: "Fashion & Clothing", labelBn: "ফ্যাশন ও পোশাক" },
  { id: "electronics", label: "Electronics & Gadgets", labelBn: "ইলেকট্রনিক্স ও গ্যাজেট" },
  { id: "food", label: "Food & Restaurant", labelBn: "খাবার ও রেস্টুরেন্ট" },
  { id: "grocery", label: "Grocery & Essentials", labelBn: "মুদি ও নিত্যপ্রয়োজনীয়" },
  { id: "salon", label: "Salon & Beauty", labelBn: "সেলুন ও বিউটি" },
  { id: "tuition", label: "Tuition & Education", labelBn: "টিউশন ও শিক্ষা" },
  { id: "clinic", label: "Clinic & Healthcare", labelBn: "ক্লিনিক ও স্বাস্থ্যসেবা" },
  { id: "pharmacy", label: "Pharmacy", labelBn: "ফার্মেসি" },
  { id: "portfolio", label: "Portfolio", labelBn: "পোর্টফোলিও" },
  { id: "corporate", label: "Corporate", labelBn: "কর্পোরেট" },
];

export function OnboardingWizard({ lang }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [businessType, setBusinessType] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedTpl = templates.find((t) => t.id === selectedTemplate);

  const defaultColors: TemplateColors = {
    primary: "#006A4E",
    secondary: "#F42A41",
    accent: "#059669",
    background: "#ffffff",
    surface: "#f9fafb",
    text: "#111827",
    textMuted: "#6b7280",
    border: "#e5e7eb",
    success: "#22c55e",
    error: "#ef4444",
  };

  const defaultTypography: TemplateTypography = {
    headingFont: "Inter",
    bodyFont: "Inter",
    headingWeight: "700",
    borderRadius: "lg",
  };

  const defaultLayout: TemplateLayout = {
    maxWidth: "1280px",
    sectionSpacing: "normal",
    cardStyle: "shadowed",
    productColumns: 4,
  };

  const [colors, setColors] = useState(defaultColors);
  const [typography, setTypography] = useState(defaultTypography);
  const [layout, setLayout] = useState(defaultLayout);

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleCreateStore = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: storeName || lang === "bn" ? "আমার দোকান" : "My Store",
          subdomain: subdomain || storeName.toLowerCase().replace(/[^a-z0-9-]/g, ""),
          category: businessType,
          theme: JSON.stringify({
            templateId: selectedTemplate,
            primaryColor: colors.primary,
            secondaryColor: colors.secondary,
          }),
        }),
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      alert(lang === "bn" ? "স্টোর তৈরি করতে ব্যর্থ" : "Failed to create store");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#008060] focus:border-transparent outline-none text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <StepIndicator steps={STEPS} currentStep={step} lang={lang} />

      {step === 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === "bn" ? "আপনার ব্যবসার ধরন" : "What's your business type?"}
          </h2>
          <p className="text-gray-500 mb-8">
            {lang === "bn"
              ? "আমরা আপনার জন্য সেরা টেমপ্লেট এবং সেটিংস সুপারিশ করবো।"
              : "We'll recommend the best template and settings for you."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {businessTypes.map((bt) => (
              <button
                key={bt.id}
                onClick={() => {
                  setBusinessType(bt.id);
                  const recommended = templates.filter((t) => t.category.toLowerCase().includes(bt.id))[0];
                  if (recommended) setSelectedTemplate(recommended.id);
                  handleNext();
                }}
                className={`p-4 rounded-xl border-2 text-center hover:border-[#008060] hover:bg-[#008060]/5 transition-all ${
                  businessType === bt.id ? "border-[#008060] bg-[#008060]/5" : "border-gray-200"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#008060]/10 flex items-center justify-center mx-auto mb-2">
                  <ShoppingBag size={18} className="text-[#008060]" />
                </div>
                <span className="text-sm font-medium text-gray-900 block">
                  {lang === "bn" ? bt.labelBn : bt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <TemplatePicker
          selected={selectedTemplate}
          onSelect={setSelectedTemplate}
          lang={lang}
        />
      )}

      {step === 2 && (
        <div className="grid gap-8 lg:grid-cols-2">
          <CustomizationPanel
            colors={colors}
            typography={typography}
            layout={layout}
            onColorsChange={(c) => setColors((p) => ({ ...p, ...c }))}
            onTypographyChange={(t) => setTypography((p) => ({ ...p, ...t }))}
            onLayoutChange={(l) => setLayout((p) => ({ ...p, ...l }))}
            lang={lang}
          />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {lang === "bn" ? "প্রিভিউ" : "Preview"}
            </h3>
            <BackgroundPreview
              primaryColor={colors.primary}
              secondaryColor={colors.secondary}
              companyName={storeName || undefined}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === "bn" ? "প্রোডাক্ট যোগ করুন" : "Add Products"}
          </h2>
          <p className="text-gray-500 mb-8">
            {lang === "bn"
              ? "আপনি এখন বা পরে প্রোডাক্ট যোগ করতে পারবেন।"
              : "You can add products now or later from your dashboard."}
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {lang === "bn"
                ? "আপনার প্রোডাক্ট, দাম, এবং ছবি যোগ করুন।"
                : "Add your products with images, prices, and descriptions."}
            </p>
            <Button className="bg-[#008060] hover:bg-[#006A4E] text-white" onClick={handleNext}>
              {lang === "bn" ? "পরে যোগ করব" : "Add Later"} <ArrowRight size={16} className="ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === "bn" ? "আপনার স্টোরের নাম দিন" : "Name Your Store"}
          </h2>
          <p className="text-gray-500 mb-8">
            {lang === "bn"
              ? "আপনার স্টোরের নাম এবং ডোমেইন সেট করুন।"
              : "Set your store name and domain."}
          </p>
          <div className="max-w-md space-y-4">
            <div>
              <label className={labelClass}>
                {lang === "bn" ? "স্টোরের নাম" : "Store Name"}
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder={lang === "bn" ? "আমার দোকান" : "My Store"}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {lang === "bn" ? "সাবডোমেইন" : "Subdomain"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="mystore"
                  className={inputClass}
                />
                <span className="text-sm text-gray-400 whitespace-nowrap">.bdesh.shop</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === "bn" ? "পেমেন্ট সেটআপ" : "Payment Setup"}
          </h2>
          <p className="text-gray-500 mb-8">
            {lang === "bn"
              ? "আপনার পেমেন্ট পদ্ধতি সেট করুন।"
              : "Configure your payment methods."}
          </p>
          <div className="grid gap-4 max-w-lg">
            {[
              { id: "bkash", label: "bKash", icon: "৳" },
              { id: "nagad", label: "Nagad", icon: "৳" },
              { id: "rocket", label: "Rocket", icon: "৳" },
              { id: "cod", label: lang === "bn" ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery", icon: "৳" },
            ].map((pm) => (
              <label
                key={pm.id}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-[#008060]/50 transition-colors"
              >
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-[#008060] focus:ring-[#008060]" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#008060]/10 flex items-center justify-center text-[#008060] font-bold text-sm">
                    {pm.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{pm.label}</span>
                </div>
              </label>
            ))}
          </div>
          <Button className="mt-8 bg-[#008060] hover:bg-[#006A4E] text-white" onClick={handleCreateStore} disabled={loading}>
            {loading ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <Check size={16} className="mr-2" />
            )}
            {lang === "bn" ? "স্টোর তৈরি করুন" : "Create Store"}
          </Button>
        </div>
      )}

      {step > 0 && step < 5 && (
        <div className="flex justify-between mt-8">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft size={16} className="mr-1.5" />
            {lang === "bn" ? "পিছনে" : "Back"}
          </Button>
          <Button className="bg-[#008060] hover:bg-[#006A4E] text-white" onClick={handleNext}>
            {lang === "bn" ? "পরবর্তী" : "Continue"} <ArrowRight size={16} className="ml-1.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
