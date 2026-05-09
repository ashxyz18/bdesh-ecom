"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, Package } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
}

function formatBDT(amount: number): string {
  const num = Math.round(Number(amount));
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `৳${formatted}`;
}

export default function CartPage() {
  const params = useParams<{ storeId: string }>();
  const storeId = params.storeId;

  const [items, setItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Only run on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("store-cart");
    if (saved) {
      try { setItems(JSON.parse(saved) || []); } catch {}
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("store-cart", JSON.stringify(newItems));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    const newItems = items.map(i => i.id === id ? { ...i, quantity: qty } : i);
    saveCart(newItems);
  };

  const removeItem = (id: string) => {
    const newItems = items.filter(i => i.id !== id);
    saveCart(newItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 1000 ? 0 : 120;
  const total = subtotal + shipping;

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/store/${storeId}`} className="flex items-center gap-2">
              <Package className="text-slate-900" size={24} />
              <span className="font-bold text-lg text-slate-900">Shop</span>
            </Link>
            <Link href={`/store/${storeId}/products`} className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl">
            <ShoppingCart size={64} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-600 mb-6">Looks like you haven't added anything yet.</p>
            <Link href={`/store/${storeId}/products`} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              <ArrowLeft size={16} /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-slate-50 rounded-xl p-4 flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-lg bg-slate-200 flex-shrink-0 flex items-center justify-center">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Package size={24} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
                    <p className="text-sm text-slate-500">{formatBDT(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-100"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-100"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatBDT(item.price * item.quantity)}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-2 text-red-400 hover:text-red-600 text-xs flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
              >
                <Trash2 size={14} /> Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 rounded-xl p-6 sticky top-24">
                <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span className="font-medium">{formatBDT(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? "Free" : formatBDT(shipping)}</span>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-bold text-xl text-slate-900">{formatBDT(total)}</span>
                  </div>
                </div>
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center">
                  Proceed to Checkout
                </button>
                <p className="text-xs text-slate-500 text-center mt-3">Shipping calculated at checkout</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
