"use client";

import { useState, useCallback } from "react";
import { Sparkles, Upload, ImageIcon, RefreshCw, X, Loader2, Eye, Globe, Zap } from "lucide-react";
import { Button } from "@/components/shared/Button";

interface GeneratedDesign {
  analysis: {
    websiteType?: string;
    detectedColors: { primary: string; secondary: string; accent: string; background: string; text: string; palette: string[] };
    detectedStyle: { vibe: string; typography: string[]; layout: string; mood: string[] };
    detectedIndustry: string;
    detectedElements: string[];
    suggestedTemplateId: string;
    aiPrompt: string;
  };
  templateConfig: any;
  previewColors: string[];
  marketingTips: string[];
}

const WEBSITE_TYPES = [
  { value: "ecommerce", label: "E-Commerce Store", icon: "🛒" },
  { value: "portfolio", label: "Portfolio", icon: "🎨" },
  { value: "corporate", label: "Corporate", icon: "🏢" },
  { value: "blog", label: "Blog", icon: "📝" },
  { value: "restaurant", label: "Restaurant", icon: "🍽️" },
  { value: "education", label: "Education", icon: "🎓" },
  { value: "landing", label: "Landing Page", icon: "🚀" },
  { value: "realestate", label: "Real Estate", icon: "🏠" },
  { value: "nonprofit", label: "Non-Profit", icon: "❤️" },
];

export function AIWebsiteBuilder() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [websiteType, setWebsiteType] = useState("ecommerce");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedDesign | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const handleFile = useCallback((file: File) => {
    setImageFile(file);
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleGenerate = async () => {
    if (!image) return;
    setLoading(true);
    setError("");
    setResult(null);

    // Note: The AI generation API has been removed from this demo.
    // Showing a mock successful generation for UX demonstration.
    setTimeout(() => {
      setResult({
        analysis: {
          websiteType,
          detectedColors: { primary: "#006A4E", secondary: "#F42A41", accent: "#059669", background: "#ffffff", text: "#111827", palette: ["#006A4E", "#F42A41", "#059669", "#ffffff"] },
          detectedStyle: { vibe: "modern", typography: ["Inter", "Noto Sans"], layout: "centered", mood: ["professional", "clean"] },
          detectedIndustry: "general",
          detectedElements: [],
          suggestedTemplateId: "modern-store",
          aiPrompt: "Generated from uploaded image",
        },
        templateConfig: {},
        previewColors: ["#006A4E", "#F42A41", "#059669", "#ffffff"],
        marketingTips: websiteType === "ecommerce" 
          ? ["Set up bKash and Nagad payments", "Add high-quality product photos"]
          : ["Promote your site on social media", "Add engaging content tailored to your audience"],
      });
      setLoading(false);
    }, 2000);
  };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!result && (
        <>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-sm font-medium text-purple-400 mb-4">
              <Sparkles size={14} /> AI-Powered Design
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Upload a Photo &mdash; Get a Website
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Upload any image (logo, product photo, mood board) and our AI will analyze colors, style, and industry to build a complete {websiteType} site for you.
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-2xl p-8 transition-all text-center ${
              dragOver
                ? "border-[#008060] bg-[#008060]/5"
                : image
                ? "border-white/20 bg-white/5"
                : "border-white/10 hover:border-white/20 bg-white/[0.02]"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {image ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={image}
                    alt="Uploaded reference"
                    className="max-h-64 rounded-xl mx-auto object-contain shadow-2xl"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-sm text-white/60">
                  {imageFile?.name || "Reference image"} &mdash; {Math.round((imageFile?.size || 0) / 1024)}KB
                </p>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                  <Upload size={24} className="text-purple-400" />
                </div>
                <p className="text-white font-medium mb-1">
                  Drop an image here, or click to browse
                </p>
                <p className="text-white/40 text-sm">
                  Logo, product photo, mood board, or any reference image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="mt-6 max-w-md mx-auto space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Website Type</label>
                <select
                  value={websiteType}
                  onChange={(e) => setWebsiteType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-[#008060] focus:border-transparent outline-none"
                >
                  {WEBSITE_TYPES.map((type) => (
                    <option key={type.value} value={type.value} className="bg-gray-900 text-white">
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={!image || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3.5 justify-center text-base font-semibold shadow-lg shadow-purple-600/20"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin mr-2" /> Analyzing &amp; Building...</>
              ) : (
                <><Sparkles size={18} className="mr-2" /> Generate Website from Image</>
              )}
            </Button>
          </div>
        </>
      )}

      {result && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-400" /> Your AI-Generated {result.analysis.websiteType || "E-Commerce"} Design
            </h3>
            <button onClick={handleReset} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
              <RefreshCw size={14} /> Try Again
            </button>
          </div>

          {/* Color Palette */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Globe size={16} className="text-purple-400" /> Color Palette
            </h4>
            <div className="flex gap-3 flex-wrap">
              {result.previewColors.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-14 h-14 rounded-xl border border-white/10 shadow-lg"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[10px] text-white/50 font-mono">{color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Design Analysis */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold mb-2">Website Type</p>
              <p className="text-lg font-bold text-white capitalize">{result.analysis.websiteType || "ecommerce"}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold mb-2">Industry</p>
              <p className="text-lg font-bold text-white capitalize">{result.analysis.detectedIndustry}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold mb-2">Style</p>
              <p className="text-lg font-bold text-white capitalize">{result.analysis.detectedStyle.vibe}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold mb-2">Typography</p>
              <p className="text-lg font-bold text-white">{result.analysis.detectedStyle.typography[0]}</p>
            </div>
          </div>

          {/* Marketing Tips */}
          <div className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Zap size={16} className="text-amber-400" /> Marketing Tips
            </h4>
            <ul className="space-y-2">
              {result.marketingTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                  <span className="text-emerald-400 mt-0.5">&bull;</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
