"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProductGridBlock } from "@/lib/builder/blocks";
import { ShoppingCart, Package, Menu, X } from "lucide-react";

interface StoreInfo {
  id: string;
  name: string;
}

function StoreNavbar({ store, cartCount }: { store: StoreInfo; cartCount: number }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/store/${store.id}`} className="flex items-center gap-2">
            <Package className="text-slate-900" size={24} />
            <span className="font-bold text-lg text-slate-900">{store.name}</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href={`/store/${store.id}`} className="hover:text-slate-900 transition-colors">Home</Link>
            <Link href={`/store/${store.id}/products`} className="hover:text-slate-900 transition-colors">Products</Link>
            <Link href={`/store/${store.id}/cart`} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
              <ShoppingCart size={16} /> Cart
              {cartCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>}
            </Link>
          </div>
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="md:hidden p-2">
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {mobileNavOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-4 py-3 space-y-2">
            <Link href={`/store/${store.id}`} onClick={() => setMobileNavOpen(false)} className="block text-sm font-medium text-slate-600 py-2">Home</Link>
            <Link href={`/store/${store.id}/products`} onClick={() => setMobileNavOpen(false)} className="block text-sm font-medium text-slate-600 py-2">Products</Link>
            <Link href={`/store/${store.id}/cart`} onClick={() => setMobileNavOpen(false)} className="flex items-center gap-1 text-sm font-medium text-slate-600 py-2">
              <ShoppingCart size={16} /> Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default function ProductsPage() {
  const params = useParams<{ storeId: string }>();
  const storeId = params.storeId;
  const [store, setStore] = useState<StoreInfo>({ id: storeId, name: "My Store" });
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("store-cart");
    if (saved) {
      try { setCartCount(JSON.parse(saved).reduce((s: number, i: any) => s + (i.quantity||0), 0)); } catch {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <StoreNavbar store={store} cartCount={cartCount} />
      <ProductGridBlock
        id="all-products"
        data={{ id: "all-products", type: "productGrid", props: { title: "All Products", subtitle: "Browse our full collection", showSearch: true } }}
        isEditable={false}
        storeId={storeId}
      />
    </div>
  );
}
