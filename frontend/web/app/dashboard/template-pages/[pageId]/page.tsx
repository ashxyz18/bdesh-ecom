"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2, AlertCircle, Maximize2, Minimize2 } from "lucide-react";

interface TemplatePageData {
  templateId: string;
  pageId: string;
  label: string;
  description?: string;
  iframeSrc: string;
}

export default function TemplatePageEmbed() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.pageId as string;

  const [pageData, setPageData] = useState<TemplatePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const storeId = localStorage.getItem("storeId");
    if (!storeId) {
      router.push("/login");
      return;
    }

    // Fetch store to get templateId, then fetch template manifest for page config
    fetch(`/api/stores/${storeId}`)
      .then((res) => res.json())
      .then(async (data) => {
        const templateId = data.store?.templateId;
        if (!templateId) {
          setError("No template assigned to this store.");
          setLoading(false);
          return;
        }

        // Fetch template manifest
        const tRes = await fetch(`/api/templates/${templateId}`);
        const tData = await tRes.json();
        const manifest = tData.template?.manifest;

        if (!manifest?.dashboard?.pages) {
          setError("This template does not have custom dashboard pages.");
          setLoading(false);
          return;
        }

        const page = manifest.dashboard.pages.find(
          (p: any) => p.id === pageId
        );

        if (!page) {
          setError(`Page "${pageId}" not found in template dashboard.`);
          setLoading(false);
          return;
        }

        if (page.href && !page.templatePath) {
          // This page links to a Bdesh platform page, redirect
          router.push(page.href);
          return;
        }

        if (!page.templatePath) {
          setError("This page does not have a template path configured.");
          setLoading(false);
          return;
        }

        // Build the iframe src — serve route injects platform config
        const iframeSrc = `/api/templates/serve?id=${templateId}&storeId=${storeId}&page=${encodeURIComponent(page.templatePath)}`;

        setPageData({
          templateId,
          pageId: page.id,
          label: page.label,
          description: page.description,
          iframeSrc,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load page configuration.");
        setLoading(false);
      });
  }, [pageId, router]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" />
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="p-6 lg:p-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          {error || "Page not found"}
        </div>
      </div>
    );
  }

  return (
    <div className={`${expanded ? "fixed inset-0 z-50 bg-white" : "p-6 lg:p-8"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${expanded ? "px-6 py-3 border-b border-gray-200" : "mb-4"}`}>
        <div className="flex items-center gap-3">
          {!expanded && (
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft size={18} />
            </Link>
          )}
          <div>
            <h1 className={`font-bold text-gray-900 ${expanded ? "text-lg" : "text-xl"}`}>
              {pageData.label}
            </h1>
            {pageData.description && !expanded && (
              <p className="text-sm text-gray-500 mt-0.5">{pageData.description}</p>
            )}
          </div>
          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-semibold uppercase tracking-wide">
            Template Page
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title={expanded ? "Exit fullscreen" : "Fullscreen"}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <a
            href={pageData.iframeSrc}
            target="_blank"
            rel="noreferrer"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title="Open in new tab"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Iframe */}
      <div
        className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${
          expanded ? "h-[calc(100vh-57px)]" : ""
        }`}
        style={expanded ? undefined : { height: "calc(100vh - 200px)", minHeight: "500px" }}
      >
        <iframe
          src={pageData.iframeSrc}
          className="w-full h-full border-0"
          title={pageData.label}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
}
