"use client";

import { GripVertical, Eye, EyeOff, Trash2, ArrowUp, ArrowDown, Copy } from "lucide-react";

interface SectionConfig {
  type: string;
  visible?: boolean;
  [key: string]: unknown;
}

interface SectionManagerProps {
  sections: SectionConfig[];
  onReorder: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  onToggleVisibility: (index: number) => void;
  lang: "en" | "bn";
}

const sectionLabels: Record<string, { en: string; bn: string }> = {
  hero: { en: "Hero Banner", bn: "হিরো ব্যানার" },
  collections: { en: "Collections", bn: "কালেকশন" },
  featuredProducts: { en: "Featured Products", bn: "ফিচার্ড প্রোডাক্ট" },
  products: { en: "Products Grid", bn: "প্রোডাক্ট গ্রিড" },
  features: { en: "Features", bn: "ফিচার" },
  testimonials: { en: "Testimonials", bn: "টেস্টিমোনিয়াল" },
  newsletter: { en: "Newsletter", bn: "নিউজলেটার" },
  cta: { en: "Call to Action", bn: "কলে টু অ্যাকশন" },
  announcement: { en: "Announcement Bar", bn: "ঘোষণা বার" },
  stats: { en: "Statistics", bn: "পরিসংখ্যান" },
  banner: { en: "Banner", bn: "ব্যানার" },
  brandLogos: { en: "Brand Logos", bn: "ব্র্যান্ড লোগো" },
  countdown: { en: "Countdown Timer", bn: "কাউন্টডাউন" },
  faq: { en: "FAQ", bn: "সচরাচর জিজ্ঞাস্য" },
  team: { en: "Team", bn: "টিম" },
  pricing: { en: "Pricing", bn: "মূল্য তালিকা" },
  timeline: { en: "Timeline", bn: "টাইমলাইন" },
  categories: { en: "Categories", bn: "ক্যাটাগরি" },
  recentlyViewed: { en: "Recently Viewed", bn: "সম্প্রতি দেখা" },
  spacer: { en: "Spacer", bn: "স্পেসার" },
};

export function SectionManager({
  sections,
  onReorder,
  onRemove,
  onDuplicate,
  onToggleVisibility,
  lang,
}: SectionManagerProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {lang === "bn" ? "সেকশন লেআউট" : "Section Layout"}
      </h3>
      {sections.map((section, i) => {
        const label = sectionLabels[section.type] || { en: section.type, bn: section.type };
        return (
          <div
            key={`${section.type}-${i}`}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 group hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center gap-1">
              <button
                onClick={() => i > 0 && onReorder(i, i - 1)}
                disabled={i === 0}
                className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ArrowUp size={12} />
              </button>
              <button
                onClick={() => i < sections.length - 1 && onReorder(i, i + 1)}
                disabled={i === sections.length - 1}
                className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ArrowDown size={12} />
              </button>
            </div>
            <GripVertical size={14} className="text-gray-300 shrink-0" />
            <span className="flex-1 text-sm text-gray-700 font-medium">
              {lang === "bn" ? label.bn : label.en}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onToggleVisibility(i)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                {section.visible === false ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => onDuplicate(i)}
                className="p-1 text-gray-400 hover:text-[#008060] rounded"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={() => onRemove(i)}
                className="p-1 text-gray-400 hover:text-red-500 rounded"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
      {sections.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          {lang === "bn" ? "কোনো সেকশন নেই" : "No sections yet"}
        </p>
      )}
    </div>
  );
}
