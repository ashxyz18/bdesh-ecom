"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function UseTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [templateName, setTemplateName] = useState<string>("Template");

  useEffect(() => {
    params.then((p) => setTemplateId(p.templateId));
  }, [params]);

  useEffect(() => {
    if (!templateId) return;

    const storedStoreId = localStorage.getItem("storeId");
    if (storedStoreId) {
      setStoreId(storedStoreId);
    }

    // Fetch template name
    fetch(`/api/templates`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const t = data.templates.find(
            (t: { id: string }) => t.id === templateId
          );
          if (t) setTemplateName(t.name);
        }
      })
      .catch(() => {});

    setLoading(false);
  }, [templateId]);

  const applyTemplate = async () => {
    if (!storeId || !templateId) {
      setError("No store found. Please create a store first.");
      return;
    }

    setApplying(true);
    setError(null);

    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      const data = await res.json();

      if (res.ok && data.store) {
        setApplied(true);
      } else {
        setError(data.error || "Failed to apply template");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  // Auto-apply template when we have both storeId and templateId
  useEffect(() => {
    if (storeId && templateId && !applied && !applying && !error && !loading) {
      applyTemplate();
    }
  }, [storeId, templateId, applied, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const actualStoreId = storeId || `preview-${templateId}`;
  const storeUrl = `/store/${actualStoreId}`;

  if (error && !storeId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Store Found
          </h1>
          <p className="text-gray-500 mb-6">
            You need to create a store before applying a template. Sign up or
            log in first.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/signup"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sign Up
            </Link>
            <Link
              href="/templates"
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something Went Wrong
          </h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={applyTemplate}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (applying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Applying {templateName} template...
          </h1>
          <p className="text-gray-500 text-sm">
            Setting up your store with the new design
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Your store is ready!
            </h1>
            <p className="text-white/70">
              You've applied the{" "}
              <strong className="text-white">{templateName}</strong> template.
              Your store is now live and ready for customization.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <p className="text-sm text-white/50 mb-2">Your store URL</p>
            <p className="text-xl font-mono text-white">{storeUrl}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={storeUrl}>
              <button className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2 font-medium">
                View Your Store
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 flex items-center justify-center gap-2 font-medium">
                Go to Dashboard
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          <p className="text-white/40 text-sm mt-8">
            Customize your store in the dashboard, then view it here.
          </p>
        </div>
      </div>
    </div>
  );
}
