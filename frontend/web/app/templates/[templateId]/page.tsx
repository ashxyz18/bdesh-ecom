"use client";

import { useState, useEffect, use } from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { ArrowLeft, Eye, Monitor, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  previewUrl: string;
  buildStatus: "pending" | "installing" | "building" | "ready" | "failed";
  buildLog?: string;
}

interface PageProps {
  params: Promise<{ templateId: string }>;
}

export default function TemplateDetailPage({ params }: PageProps) {
  const { templateId } = use(params);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/templates/${templateId}`);
      const data = await res.json();

      if (data.success && data.template) {
        setTemplate(data.template);
      } else {
        setError(data.error || "Template not found");
      }
    } catch {
      setError("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  const pollBuildStatus = async () => {
    try {
      const res = await fetch(`/api/site-admin/templates/${templateId}/status`);
      const data = await res.json();

      if (data.success && data.template) {
        setTemplate((prev) =>
          prev
            ? {
                ...prev,
                buildStatus: data.template.buildStatus,
                buildLog: data.template.buildLog,
              }
            : null
        );

        if (data.template.buildStatus === "ready") {
          fetch(`/api/templates/${templateId}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.template) {
                setTemplate((prev) =>
                  prev
                    ? {
                        ...prev,
                        previewUrl: data.template.previewUrl,
                      }
                    : null
                );
              }
            });
        }
      }
    } catch {
      console.error("Failed to poll build status");
    }
  };

  useEffect(() => {
    if (template && template.buildStatus !== "ready" && template.buildStatus !== "failed") {
      const interval = setInterval(pollBuildStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [template?.buildStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Template Not Found</h1>
          <p className="text-gray-500 mb-6">{error || "The template you're looking for doesn't exist."}</p>
          <Link href="/templates">
            <Button variant="outline">Back to Templates</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (template.buildStatus === "pending" || template.buildStatus === "installing" || template.buildStatus === "building") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <Link href="/templates" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft size={16} /> Back to Templates
          </Link>

          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Template is being built...</h1>
            <p className="text-gray-500 mb-4">
              {template.buildStatus === "pending" && "Preparing template..."}
              {template.buildStatus === "installing" && "Installing dependencies..."}
              {template.buildStatus === "building" && "Building React app..."}
            </p>
            <p className="text-sm text-gray-400">
              This page will automatically update when the build is complete.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (template.buildStatus === "failed") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <Link href="/templates" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft size={16} /> Back to Templates
          </Link>

          <div className="bg-white rounded-2xl border border-gray-200 p-12">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Build Failed</h1>
            </div>
            <p className="text-gray-500 mb-6">
              There was an error building this template. Please try uploading again.
            </p>

            {template.buildLog && (
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm font-mono overflow-auto max-h-64 mb-6">
                <pre className="whitespace-pre-wrap">{template.buildLog}</pre>
              </div>
            )}

            <div className="flex gap-4">
              <Link href="/admin/templates">
                <Button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white">
                  Try Again
                </Button>
              </Link>
              <Link href="/templates">
                <Button variant="outline">Back to Templates</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <Link href="/templates" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={16} /> Back to Templates
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
              <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <CheckCircle size={14} /> Ready
              </span>
            </div>
            <p className="text-gray-600 mb-6">{template.description || "React template"}</p>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200">
                <div className="flex gap-2">
                  <button className="p-2 rounded-md hover:bg-gray-200" title="Desktop">
                    <Monitor size={18} />
                  </button>
                </div>
                <span className="text-sm text-gray-500">Preview</span>
              </div>
              <iframe
                src={template.previewUrl}
                className="w-full h-[600px] border-0"
                title="Template Preview"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Start with this template</h2>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Features included:</p>
                <ul className="space-y-2">
                  {["Responsive Design", "Product Grid", "Shopping Cart", "Wishlist", "Search"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={`/templates/${templateId}/use`}>
                <Button className="w-full justify-center bg-[#1d4ed8] hover:bg-[#1e40af] text-white py-3 text-base">
                  Use This Template
                </Button>
              </Link>

              <p className="text-xs text-gray-500 text-center mt-4">
                Free to use. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}