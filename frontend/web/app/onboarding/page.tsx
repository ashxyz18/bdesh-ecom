"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle,
  Eye,
  FileText,
  Package,
  ArrowRight,
  Store,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  previewUrl: string;
  entryPoint?: string;
  sections?: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const storedStoreId = localStorage.getItem("storeId");

    if (!userData || !storedStoreId) {
      router.push("/signup");
      return;
    }

    setStoreId(storedStoreId);

    fetchTemplates();
  }, [router]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.success && data.templates?.length > 0) {
        setTemplates(data.templates);
      } else {
        setError("No templates available. Please try again later.");
      }
    } catch {
      setError("Failed to load templates. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async () => {
    if (!selectedId || !storeId) return;

    setApplying(true);
    setError(null);

    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedId }),
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#1d4ed8] animate-spin" />
          <p className="text-gray-500 text-sm">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1d4ed8] rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900 font-bold text-lg">BixelBD</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            Step 1 of 1
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Choose Your Store Template
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Select a template for your online store. You can always change it
            later from your dashboard.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2 max-w-2xl mx-auto">
            <Package size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Template Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {templates.map((template) => {
            const isSelected = selectedId === template.id;
            const isPreviewing = previewing === template.id;

            return (
              <div
                key={template.id}
                className={`relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer bg-white border ${
                  isSelected
                    ? "ring-2 ring-[#1d4ed8] border-[#1d4ed8] shadow-lg shadow-blue-500/10"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
                onClick={() => setSelectedId(template.id)}
              >
                {/* Preview Image */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {template.thumbnail ? (
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <FileText className="w-12 h-12 text-gray-300" />
                    </div>
                  )}

                  {/* Hover overlay with preview button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewing(isPreviewing ? null : template.id);
                      }}
                      className="px-4 py-2 bg-white/90 text-gray-700 rounded-lg text-sm font-medium hover:bg-white transition-colors flex items-center gap-2"
                    >
                      <Eye size={16} />
                      {isPreviewing ? "Close Preview" : "Preview"}
                    </button>
                  </div>

                  {/* Selected badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-[#1d4ed8] rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle size={18} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {template.description || "No description"}
                  </p>
                  {template.sections && template.sections.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {template.sections.slice(0, 4).map((section) => (
                        <span
                          key={section}
                          className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500"
                        >
                          {section}
                        </span>
                      ))}
                      {template.sections.length > 4 && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500">
                          +{template.sections.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Preview iframe (expandable) */}
                {isPreviewing && (
                  <div className="border-t border-gray-200">
                    <iframe
                      src={template.previewUrl}
                      className="w-full border-0"
                      style={{ height: "400px" }}
                      title={`Preview ${template.name}`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-4 sm:px-6 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedId ? (
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-gray-900 font-medium">
                    {
                      templates.find((t) => t.id === selectedId)?.name
                    }
                  </span>{" "}
                  selected
                </span>
              ) : (
                "Select a template to continue"
              )}
            </div>
            <button
              onClick={handleSelectTemplate}
              disabled={!selectedId || applying}
              className="px-6 py-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {applying ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Setting up your store...
                </>
              ) : (
                <>
                  Continue with Template
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Spacer for fixed bottom bar */}
        <div className="h-24" />
      </div>
    </div>
  );
}