"use client";

import { useState, useEffect } from "react";
import { BlockComponentProps } from "./types";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
}

interface CartSummaryProps {
  title?: string;
  showClear?: boolean;
}

function formatBDT(amount: number): string {
  const num = Math.round(Number(amount));
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `৳${formatted}`;
}

export function CartSummaryBlock({ data }: BlockComponentProps) {
  const props = data.props as CartSummaryProps;
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load cart from localStorage
    const saved = localStorage.getItem("store-cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  const updateCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("store-cart", JSON.stringify(newItems));
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="relative inline-block z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
        title="Cart"
      >
        <ShoppingCart size={20} className="text-slate-700" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{props.title || "Cart"}</h3>
              <div className="flex items-center gap-2">
                {props.showClear && items.length > 0 && (
                  <button
                    onClick={() => updateCart([])}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Clear
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {items.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.id} className="p-3 flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-300">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <ShoppingCart size={16} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-slate-900 truncate">{item.name}</h4>
                        <p className="text-sm text-slate-500">{formatBDT(item.price)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => {
                              const newItems = items.map(i =>
                                i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
                              );
                              updateCart(newItems);
                            }}
                            className="p-0.5 rounded border hover:bg-slate-50"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => {
                              const newItems = items.map(i =>
                                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                              );
                              updateCart(newItems);
                            }}
                            className="p-0.5 rounded border hover:bg-slate-50"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => updateCart(items.filter(i => i.id !== item.id))}
                        className="p-1 text-red-400 hover:text-red-600 self-start"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <ShoppingCart size={32} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">Your cart is empty</p>
                </div>
              )}
            </div>
            {items.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-bold text-lg text-slate-900">{formatBDT(total)}</span>
                </div>
                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors">
                  Checkout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
