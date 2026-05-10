"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { StepIndicator } from "./StepIndicator";
import { CustomizationPanel } from "./CustomizationPanel";
import { BackgroundPreview } from "./BackgroundPreview";
import { SectionManager } from "./SectionManager";
import { ArrowRight, ArrowLeft, Sparkles, Globe, ShoppingBag, Check, Loader2 } from "lucide-react";

export interface OnboardingStep {
  id: string;
  label: string;
  labelBn: string;
}

const STEPS: OnboardingStep[] = [
  { id: "business", label: "Type", labelBn: "ধরন" },
  { id: "details", label: "Details", labelBn: "বিস্তারিত" },
  { id: "goals", label: "Goals", labelBn: "লক্ষ্য" },
  { id: "style", label: "Style", labelBn: "স্টাইল" },
  { id: "finalize", label: "Finalize", labelBn: "চূড়ান্ত" },
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

interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  error: string;
}

interface CustomTypography {
  headingFont: string;
  bodyFont: string;
  headingWeight: string;
  borderRadius: string;
}

interface CustomLayout {
  maxWidth: string;
  sectionSpacing: string;
  cardStyle: string;
  productColumns: number;
}

export function OnboardingWizard({ lang }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [businessType, setBusinessType] = useState("");
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [referenceUrl, setReferenceUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiRecommending, setAiRecommending] = useState(false);

  const defaultColors: CustomColors = {
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

  const defaultTypography: CustomTypography = {
    headingFont: "Inter",
    bodyFont: "Inter",
    headingWeight: "700",
    borderRadius: "lg",
  };

  const defaultLayout: CustomLayout = {
    maxWidth: "1280px",
    sectionSpacing: "normal",
    cardStyle: "shadowed",
    productColumns: 4,
  };

  const [colors, setColors] = useState(defaultColors);
  const [typography, setTypography] = useState(defaultTypography);
  const [layout, setLayout] = useState(defaultLayout);

  const handleNext = async () => {
    if (step === 3) {
      setAiRecommending(true);
      try {
        const res = await fetch("/api/ai/recommend-template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessType,
            prompt,
            referenceUrl,
            goals,
          }),
        });
        const data = await res.json();
        if (data.colors) setColors(prev => ({ ...prev, ...data.colors }));
      } catch (err) {
        console.error("AI recommendation failed", err);
      } finally {
        setAiRecommending(false);
      }
    }
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
              ? "আমরা আপনার জন্য সেরা সেটিংস সুপারিশ করবো।"
              : "We'll recommend the best settings for you."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {businessTypes.map((bt) => (
              <button
                key={bt.id}
                onClick={() => {
                  setBusinessType(bt.id);
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
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === "bn" ? "ব্যবসার তথ্য" : "Business Details"}
          </h2>
          <div>
            <label className={labelClass}>{lang === "bn" ? "স্টোরের নাম" : "Store Name"}</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className={inputClass}
              placeholder="e.g. My Awesome Shop"
            />
          </div>
          <div>
            <label className={labelClass}>{lang === "bn" ? "লোকেশন" : "Location"}</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
              placeholder="e.g. Dhaka, Bangladesh"
            />
          </div>
          <div>
            <label className={labelClass}>{lang === "bn" ? "ফোন নম্বর" : "Phone Number"}</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="e.g. 01700000000"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === "bn" ? "আপনার লক্ষ্য কি?" : "What are your goals?"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {[
              { id: "sell", label: "Sell Products", icon: <ShoppingBag /> },
              { id: "leads", label: "Get Leads", icon: <Sparkles /> },
              { id: "info", label: "Share Info", icon: <Globe /> },
              { id: "booking", label: "Book Appointments", icon: <Check /> },
            ].map((goal) => (
              <button
                key={goal.id}
                onClick={() => {
                  setGoals(prev => prev.includes(goal.id) ? prev.filter(g => g !== goal.id) : [...prev, goal.id]);
                }}
                className={`p-6 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                  goals.includes(goal.id) ? "border-[#008060] bg-[#008060]/5 shadow-sm" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${goals.includes(goal.id) ? "bg-[#008060] text-white" : "bg-gray-50 text-gray-400"}`}>
                  {goal.icon}
                </div>
                <span className="font-semibold text-gray-900">{goal.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {lang === "bn" ? "ব্র্যান্ড ও স্টাইল" : "Brand & Style"}
          </h2>
          <div>
            <label className={labelClass}>{lang === "bn" ? "রেফারেন্স সাইট (ঐচ্ছিক)" : "Reference Site URL (Optional)"}</label>
            <input
              type="text"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              className={inputClass}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className={labelClass}>{lang === "bn" ? "আপনার ব্যবসার বর্ণনা দিন (AI এর জন্য)" : "Describe your business (for AI)"}</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={`${inputClass} h-32 resize-none`}
              placeholder="e.g. A premium leather goods store focusing on hand-crafted wallets..."
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {lang === "bn" ? "চূড়ান্ত পর্যালোচনা" : "Final Review"}
            </h2>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Store Name</span>
                <span className="text-gray-900 font-semibold">{storeName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Category</span>
                <span className="text-gray-900 font-semibold capitalize">{businessType}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Domain</span>
                <span className="text-gray-900 font-semibold">{subdomain || storeName.toLowerCase().replace(/[^a-z0-9-]/g, "")}.bdesh.shop</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="desired-subdomain"
                className={inputClass}
              />
              <span className="text-sm text-gray-400 font-medium">.bdesh.shop</span>
            </div>

            <Button className="w-full bg-[#008060] hover:bg-[#006A4E] text-white py-6 text-lg font-bold shadow-lg" onClick={handleCreateStore} disabled={loading}>
              {loading ? (
                <Loader2 size={20} className="animate-spin mr-2" />
              ) : (
                <Check size={20} className="mr-2" />
              )}
              {lang === "bn" ? "আমার স্টোর শুরু করুন" : "Launch My Store"}
            </Button>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {lang === "bn" ? "লাইভ প্রিভিউ" : "Live Preview"}
            </h3>
            <BackgroundPreview
              primaryColor={colors.primary}
              secondaryColor={colors.secondary}
              companyName={storeName || undefined}
            />
          </div>
        </div>
      )}

      {step > 0 && step < 4 && (
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
