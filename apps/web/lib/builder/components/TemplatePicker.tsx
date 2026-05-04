"use client";

import { Check, Sparkles } from "lucide-react";
import { TemplatePreview } from "./TemplatePreview";
import type { Template } from "@/lib/marketing-data";
import { templates, templateCategories } from "@/lib/marketing-data";

interface TemplatePickerProps {
  selected: string;
  onSelect: (id: string) => void;
  lang: "en" | "bn";
  aiRecommendations?: string[];
}

export function TemplatePicker({
  selected,
  onSelect,
  lang,
  aiRecommendations = [],
}: TemplatePickerProps) {
  const categoryLabels: Record<string, { en: string; bn: string }> = {
    All: { en: "All", bn: "সব" },
    General: { en: "General", bn: "সাধারণ" },
    Fashion: { en: "Fashion", bn: "ফ্যাশন" },
    Food: { en: "Food", bn: "খাবার" },
    Electronics: { en: "Electronics", bn: "ইলেকট্রনিক্স" },
    Grocery: { en: "Grocery", bn: "মুদি" },
    Salon: { en: "Salon", bn: "সেলুন" },
    Clinic: { en: "Clinic", bn: "ক্লিনিক" },
    Tuition: { en: "Tuition", bn: "টিউশন" },
    Pharmacy: { en: "Pharmacy", bn: "ফার্মেসি" },
    Corporate: { en: "Corporate", bn: "কর্পোরেট" },
    Portfolio: { en: "Portfolio", bn: "পোর্টফোলিও" },
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {lang === "bn" ? "আপনার ডিজাইন নির্বাচন করুন" : "Choose Your Design"}
      </h2>
      <p className="text-gray-500 mb-6">
        {lang === "bn"
          ? "আপনার ব্যবসার জন্য একটি টেমপ্লেট বেছে নিন। পরে পরিবর্তন করতে পারবেন।"
          : "Pick a template that matches your business. You can change it anytime."}
      </p>

      {aiRecommendations.length > 0 && (
        <div className="mb-6 p-4 bg-[#008060]/5 border border-[#008060]/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-[#008060]" />
            <span className="text-sm font-semibold text-[#008060]">
              {lang === "bn" ? "AI প্রস্তাবিত" : "AI Recommended"}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {aiRecommendations.map((id) => {
              const tpl = templates.find((t) => t.id === id);
              if (!tpl) return null;
              return (
                <button
                  key={id}
                  onClick={() => onSelect(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selected === id
                      ? "bg-[#008060] text-white"
                      : "bg-white border border-[#008060]/30 text-[#008060] hover:bg-[#008060]/5"
                  }`}
                >
                  <Sparkles size={12} />
                  {tpl.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onSelect(tpl.id)}
            className={`text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
              selected === tpl.id
                ? "border-[#008060] ring-2 ring-[#008060]/20 shadow-lg"
                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
            }`}
          >
            <TemplatePreview templateId={tpl.id} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-sm text-gray-900">{tpl.name}</h3>
                <div className="flex items-center gap-1.5">
                  {tpl.isNew && (
                    <span className="px-2 py-0.5 bg-blue-500/90 text-white text-[10px] font-bold rounded-full">
                      NEW
                    </span>
                  )}
                  {tpl.isPopular && (
                    <span className="px-2 py-0.5 bg-[#ffc453]/90 text-black text-[10px] font-bold rounded-full">
                      POPULAR
                    </span>
                  )}
                  {selected === tpl.id && (
                    <div className="w-6 h-6 bg-[#008060] rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{tpl.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {tpl.features.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
