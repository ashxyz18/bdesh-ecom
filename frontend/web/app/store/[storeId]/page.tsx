"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  description?: string;
  logo?: string;
  banner?: string;
  templateId?: string;
  theme: Record<string, any>;
  settings: Record<string, any>;
  websiteType: string;
}

function StoreLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-16 bg-gray-100 animate-pulse" />
      <div className="h-[400px] bg-gray-200 animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-[300px] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templateSlug, setTemplateSlug] = useState<string | null>(null);
  // Captured once when store loads — prevents iframe re-loading on every re-render
  const [iframeTs, setIframeTs] = useState<number | null>(null);


  useEffect(() => {
    if (!storeId) return;

    fetch(`/api/stores/${storeId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Store not found");
        return res.json();
      })
      .then(async (data) => {
        setStore(data.store);

        const tid = data.store?.templateId;
        if (!tid) {
          setLoading(false);
          return;
        }

        // Look up the slug from the DB template record
        try {
          const tRes = await fetch(`/api/templates/${tid}`);
          const tData = await tRes.json();
          setTemplateSlug(tData.template?.slug || tid);
        } catch {
          setTemplateSlug(tid);
        }

        setIframeTs(Date.now());
        setLoading(false);

      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [storeId]);

  if (loading) {
    return <StoreLoadingSkeleton />;
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h1>
          <p className="text-gray-500">This store does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (!store.templateId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{store.name}</h1>
          <p className="text-gray-500">This store hasn&apos;t selected a template yet.</p>
        </div>
      </div>
    );
  }

  // All templates are rendered via the serve route which injects platform config + API interceptors
  const slug = templateSlug || store.templateId;
  const ts = iframeTs ?? Date.now();
  const iframeSrc = `/api/templates/serve?id=${slug}&storeId=${store.id}&t=${ts}`;


  return (
    <div className="w-full h-screen overflow-hidden">
      <iframe
        src={iframeSrc}
        className="w-full h-full border-none"
        title={`Store: ${store.name}`}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
      />
    </div>
  );
}