"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check, X } from "lucide-react";

type Tone = "professional" | "friendly" | "luxury" | "casual" | "bangla";
type ContentType = "product_description" | "store_tagline" | "hero_text" | "meta_description" | "marketing_copy";

interface AIContentGeneratorProps {
  type: ContentType;
  productName?: string;
  businessType?: string;
  storeName?: string;
  onGenerated: (content: string) => void;
  lang?: "en" | "bn";
}

const toneOptions: { value: Tone; label: string; labelBn: string }[] = [
  { value: "professional", label: "Professional", labelBn: "পেশাদার" },
  { value: "friendly", label: "Friendly", labelBn: "বন্ধুত্বপূর্ণ" },
  { value: "luxury", label: "Luxury", labelBn: "বিলাসবহুল" },
  { value: "casual", label: "Casual", labelBn: "ক্যাজুয়াল" },
  { value: "bangla", label: "Bangla", labelBn: "বাংলা" },
];

const labelMap: Record<ContentType, { en: string; bn: string }> = {
  product_description: { en: "Product Description", bn: "প্রোডাক্ট বর্ণনা" },
  store_tagline: { en: "Store Tagline", bn: "স্টোর ট্যাগলাইন" },
  hero_text: { en: "Hero Text", bn: "হিরো টেক্সট" },
  meta_description: { en: "SEO Description", bn: "এসইও বর্ণনা" },
  marketing_copy: { en: "Marketing Copy", bn: "মার্কেটিং কপি" },
};

export function AIContentGenerator({
  type,
  productName,
  businessType,
  storeName,
  onGenerated,
  lang = "en",
}: AIContentGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tone, setTone] = useState<Tone>("professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          productName,
          businessType: businessType || "general",
          storeName: storeName || "My Store",
          tone,
          lang,
        }),
      });
      const data = await res.json();
      setResult(data.content);
    } catch {
      setResult(
        lang === "bn"
          ? "কন্টেন্ট তৈরি করা যায়নি। আবার চেষ্টা করুন।"
          : "Could not generate content. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onGenerated(result);
      setIsOpen(false);
      setResult(null);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm"
      >
        <Sparkles size={12} />
        {lang === "bn" ? "AI দিয়ে জেনারেট" : "Generate with AI"}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl p-4 right-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-500" />
              {lang === "bn" ? labelMap[type].bn : labelMap[type].en}
            </h4>
            <button
              onClick={() => { setIsOpen(false); setResult(null); }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">
              {lang === "bn" ? "টোন" : "Tone"}
            </label>
            <div className="flex flex-wrap gap-1">
              {toneOptions.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                    tone === t.value
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {lang === "bn" ? t.labelBn : t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-xs font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {loading
              ? lang === "bn" ? "তৈরি হচ্ছে..." : "Generating..."
              : lang === "bn" ? "AI কন্টেন্ট তৈরি করুন" : "Generate AI Content"}
          </button>

          {result && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-700 max-h-32 overflow-y-auto">
              {result}
            </div>
          )}

          {result && (
            <button
              onClick={handleApply}
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700 transition-all"
            >
              <Check size={14} />
              {lang === "bn" ? "প্রয়োগ করুন" : "Apply"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
