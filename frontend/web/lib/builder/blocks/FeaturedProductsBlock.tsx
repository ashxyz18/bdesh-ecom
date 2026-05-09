"use client";

import { useState, useEffect } from "react";
import { BlockComponentProps } from "./types";
import { Package, ShoppingCart, ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  status: string;
  description?: string;
}

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  limit?: number;
}

function formatBDT(amount: number): string {
  const num = Math.round(Number(amount));
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `৳${formatted}`;
}

export function FeaturedProductsBlock({ data, storeId }: BlockComponentProps & { storeId?: string }) {
  const props = data.props as FeaturedProductsProps;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const store = storeId || "demo";

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/${store}/products`);
        if (res.ok) {
          const data = await res.json();
          const all = data.products || [];
          // Pick featured products first, then limit
          const featured = all.filter((p: any) => p.featured).concat(all).slice(0, props.limit || 4);
          setProducts(featured);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [store, props.limit]);

  if (loading) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="h-48 bg-slate-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{props.title || "Featured Products"}</h2>
          {props.subtitle && <p className="mt-2 text-lg text-slate-600">{props.subtitle}</p>}
        </div>
        {(props.showViewAll ?? true) && (
          <a href={`/store/${store}/products`} className="hidden sm:flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            View All <ArrowRight size={16} />
          </a>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300">
                  <Package size={48} />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-slate-900">{formatBDT(product.price)}</span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-sm text-slate-400 line-through">{formatBDT(product.comparePrice)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
