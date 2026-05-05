"use client";

import { useState } from "react";
import { Palette, Type, Layout, Eye } from "lucide-react";
import type { TemplateColors, TemplateTypography, TemplateLayout } from "@/lib/store-templates/engine/types";

interface CustomizationPanelProps {
  colors: TemplateColors;
  typography: TemplateTypography;
  layout: TemplateLayout;
  onColorsChange: (colors: Partial<TemplateColors>) => void;
  onTypographyChange: (typography: Partial<TemplateTypography>) => void;
  onLayoutChange: (layout: Partial<TemplateLayout>) => void;
  lang: "en" | "bn";
}

export function CustomizationPanel({
  colors,
  typography,
  layout,
  onColorsChange,
  onTypographyChange,
  onLayoutChange,
  lang,
}: CustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "layout">("colors");

  const tabs = [
    {
      id: "colors" as const,
      icon: Palette,
      label: lang === "bn" ? "রঙ" : "Colors",
    },
    {
      id: "typography" as const,
      icon: Type,
      label: lang === "bn" ? "ফন্ট" : "Fonts",
    },
    {
      id: "layout" as const,
      icon: Layout,
      label: lang === "bn" ? "লেআউট" : "Layout",
    },
  ];

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#008060] focus:border-transparent outline-none";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Eye size={18} className="text-[#008060]" />
        {lang === "bn" ? "কাস্টমাইজেশন" : "Customization"}
      </h2>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-[#008060] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "colors" && (
        <div className="space-y-4">
          {[
            { key: "primary", label: lang === "bn" ? "প্রাথমিক রঙ" : "Primary Color" },
            { key: "secondary", label: lang === "bn" ? "দ্বিতীয় রঙ" : "Secondary Color" },
            { key: "accent", label: lang === "bn" ? "অ্যাকসেন্ট" : "Accent Color" },
            { key: "background", label: lang === "bn" ? "ব্যাকগ্রাউন্ড" : "Background" },
            { key: "surface", label: lang === "bn" ? "সারফেস" : "Surface" },
            { key: "text", label: lang === "bn" ? "টেক্সট" : "Text Color" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors[key as keyof TemplateColors]}
                  onChange={(e) => onColorsChange({ [key]: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={colors[key as keyof TemplateColors]}
                  onChange={(e) => onColorsChange({ [key]: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "typography" && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>
              {lang === "bn" ? "হেডিং ফন্ট" : "Heading Font"}
            </label>
            <select
              value={typography.headingFont}
              onChange={(e) => onTypographyChange({ headingFont: e.target.value })}
              className={inputClass}
            >
              {["Inter", "Playfair Display", "Poppins", "Merriweather", "Noto Sans Bengali"].map(
                (f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label className={labelClass}>
              {lang === "bn" ? "বডি ফন্ট" : "Body Font"}
            </label>
            <select
              value={typography.bodyFont}
              onChange={(e) => onTypographyChange({ bodyFont: e.target.value })}
              className={inputClass}
            >
              {["Inter", "Noto Sans", "Noto Sans Bengali", "Lato", "Source Sans Pro"].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>
              {lang === "bn" ? "হেডিং ওজন" : "Heading Weight"}
            </label>
            <select
              value={typography.headingWeight}
              onChange={(e) => onTypographyChange({ headingWeight: e.target.value })}
              className={inputClass}
            >
              {["400", "500", "600", "700", "800", "900"].map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>
              {lang === "bn" ? "বর্ডার রেডিয়াস" : "Border Radius"}
            </label>
            <select
              value={typography.borderRadius}
              onChange={(e) =>
                onTypographyChange({
                  borderRadius: e.target.value as TemplateTypography["borderRadius"],
                })
              }
              className={inputClass}
            >
              {[
                { value: "none", label: lang === "bn" ? "কোনো না" : "None" },
                { value: "sm", label: lang === "bn" ? "ছোট" : "Small" },
                { value: "md", label: lang === "bn" ? "মাঝারি" : "Medium" },
                { value: "lg", label: lang === "bn" ? "বড়" : "Large" },
                { value: "xl", label: lang === "bn" ? "বড়+" : "Extra Large" },
                { value: "2xl", label: lang === "bn" ? "2XL" : "2XL" },
                { value: "full", label: lang === "bn" ? "পূর্ণ" : "Full" },
              ].map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {activeTab === "layout" && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>
              {lang === "bn" ? "সর্বোচ্চ প্রস্থ" : "Max Width"}
            </label>
            <input
              type="text"
              value={layout.maxWidth}
              onChange={(e) => onLayoutChange({ maxWidth: e.target.value })}
              className={inputClass}
              placeholder="1280px"
            />
          </div>
          <div>
            <label className={labelClass}>
              {lang === "bn" ? "সেকশন স্পেসিং" : "Section Spacing"}
            </label>
            <select
              value={layout.sectionSpacing}
              onChange={(e) =>
                onLayoutChange({
                  sectionSpacing: e.target.value as TemplateLayout["sectionSpacing"],
                })
              }
              className={inputClass}
            >
              <option value="compact">
                {lang === "bn" ? "সংকুচিত" : "Compact"}
              </option>
              <option value="normal">
                {lang === "bn" ? "স্বাভাবিক" : "Normal"}
              </option>
              <option value="spacious">
                {lang === "bn" ? "প্রশস্ত" : "Spacious"}
              </option>
            </select>
          </div>
          <div>
            <label className={labelClass}>
              {lang === "bn" ? "কার্ড স্টাইল" : "Card Style"}
            </label>
            <select
              value={layout.cardStyle}
              onChange={(e) =>
                onLayoutChange({
                  cardStyle: e.target.value as TemplateLayout["cardStyle"],
                })
              }
              className={inputClass}
            >
              <option value="flat">{lang === "bn" ? "ফ্ল্যাট" : "Flat"}</option>
              <option value="bordered">{lang === "bn" ? "বর্ডারযুক্ত" : "Bordered"}</option>
              <option value="shadowed">{lang === "bn" ? "শ্যাডো" : "Shadowed"}</option>
              <option value="elevated">{lang === "bn" ? "উঁচু" : "Elevated"}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>
              {lang === "bn" ? "প্রোডাক্ট কলাম" : "Product Columns"}
            </label>
            <select
              value={layout.productColumns}
              onChange={(e) =>
                onLayoutChange({
                  productColumns: Number(e.target.value) as TemplateLayout["productColumns"],
                })
              }
              className={inputClass}
            >
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
