"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import KoskiiTemplate from "@/lib/templates/koskii/KoskiiTemplate";
import DynamicTemplate from "@/lib/templates/dynamic/DynamicTemplate";
import { Store, Product } from "@/lib/templates/types";
import { CartProvider } from "@/lib/context/CartContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import { Loader2, AlertCircle } from "lucide-react";

function StoreLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-16 bg-gray-100 animate-pulse" />
      <div className="h-[400px] bg-gray-200 animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-lg h-[300px] animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    fetch(`/api/stores/${storeId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Store not found");
        return res.json();
      })
      .then((data) => {
        setStore(data.store);
        setProducts(data.products || []);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Store not found
          </h1>
          <p className="text-gray-500">
            This store does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const templateId = (store as { templateId?: string }).templateId || "koskii";

  return (
    <ToastProvider>
      <CartProvider>
        {templateId === "koskii" ? (
          <KoskiiTemplate store={store} products={products} />
        ) : (
          <DynamicTemplate
            templateId={templateId}
            store={store}
            products={products}
          />
        )}
      </CartProvider>
    </ToastProvider>
  );
}