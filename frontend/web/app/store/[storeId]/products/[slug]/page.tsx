"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Package, Menu, X, Minus, Plus, Star, ArrowLeft } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  description?: string;
  category?: string;
  status: string;
  featured: boolean;
  quantity: number;
}

function formatBDT(amount: number): string {
  const num = Math.round(Number(amount));
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `৳${formatted}`;
}

export default function ProductDetailPage() {
  const params = useParams<{ storeId: string; slug: string }>();
  const storeId = params.storeId;
  const slug = params.slug;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/${storeId}/products`);
        if (res.ok) {
          const data = await res.json();
          const found = (data.products || []).find((p: Product) => p.slug === slug);
          if (found) setProduct(found);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [storeId, slug]);

  useEffect(() => {
    const saved = localStorage.getItem("store-cart");
    if (saved) {
      try { setCartCount(JSON.parse(saved).reduce((s: number, i: any) => s + (i.quantity||0), 0)); } catch {}
    }
  }, []);

  const handleAdd = () => {
    if (!product) return;
    const saved = localStorage.getItem("store-cart");
    let items = saved ? JSON.parse(saved) : [];
    const idx = items.findIndex((i: any) => i.id === product.id);
    if (idx >= 0) {
      items[idx].quantity += quantity;
    } else {
      items.push({ id: product.id, name: product.name, price: product.price, quantity, images: product.images });
    }
    localStorage.setItem("store-cart", JSON.stringify(items));
    setCartCount(items.reduce((s: number, i: any) => s + (i.quantity||0), 0));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
        <Package size={64} className="text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-600 mb-6">The product you are looking for does not exist.</p>
        <Link href={`/store/${storeId}/products`} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          <ArrowLeft size={18} /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/store/${storeId}`} className="flex items-center gap-2">
              <Package className="text-slate-900" size={24} />
              <span className="font-bold text-lg text-slate-900">Shop</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link href={`/store/${storeId}`} className="hover:text-slate-900 transition-colors">Home</Link>
              <Link href={`/store/${storeId}/products`} className="hover:text-slate-900 transition-colors">Products</Link>
              <Link href={`/store/${storeId}/cart`} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
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
              <Link href={`/store/${storeId}`} onClick={() => setMobileNavOpen(false)} className="block text-sm font-medium text-slate-600 py-2">Home</Link>
              <Link href={`/store/${storeId}/products`} onClick={() => setMobileNavOpen(false)} className="block text-sm font-medium text-slate-600 py-2">Products</Link>
              <Link href={`/store/${storeId}/cart`} onClick={() => setMobileNavOpen(false)} className="flex items-center gap-1 text-sm font-medium text-slate-600 py-2">
                <ShoppingCart size={16} /> Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center min-h-[400px]">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={128} className="text-slate-300" />
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              {product.featured && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded">Featured</span>
              )}
              <span className="text-sm text-slate-500">{product.category || "General"}</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>

            {product.description && (
              <p className="text-slate-600 mb-6 leading-relaxed">{product.description}</p>
            )}

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-slate-900">{formatBDT(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xl text-slate-400 line-through">{formatBDT(product.comparePrice)}</span>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-slate-200 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-slate-50 rounded-l-lg">
                  <Minus size={16} />
                </button>
                <span className="px-4 font-medium w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-slate-50 rounded-r-lg">
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAdd}
                className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                {added ? "Added to Cart!" : "Add to Cart"}
              </button>
            </div>

            {/* Total */}
            <div className="border-t border-slate-200 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Subtotal</span>
                <span className="font-bold text-lg">{formatBDT(product.price * quantity)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
