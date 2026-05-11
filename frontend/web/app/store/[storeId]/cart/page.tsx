"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/context/CartContext";
import { useToast } from "@/lib/context/ToastContext";
import { CartProvider } from "@/lib/context/CartContext";
import { ToastProvider } from "@/lib/context/ToastContext";

function CartContent() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const { items, updateQuantity, removeItem, total, count } = useCart();
  const { showToast } = useToast();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-shopping-bag text-4xl text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your bag is empty</h1>
          <p className="text-gray-500 mb-6">Browse our collection and add items to your bag</p>
          <Link
            href={`/store/${storeId}`}
            className="inline-block px-8 py-3 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/store/${storeId}`} className="flex items-center gap-2">
              <i className="fas fa-arrow-left text-gray-600" />
              <span className="text-gray-600">Continue Shopping</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Shopping Bag ({count} items)</h1>
            <div />
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantName}`} className="flex gap-4 p-4 border-b border-gray-100 last:border-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                    {item.variantName && (
                      <p className="text-sm text-gray-500 mb-2">Size: {item.variantName}</p>
                    )}
                    <p className="font-semibold text-gray-900">৳{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => {
                        removeItem(item.productId, item.variantName);
                        showToast('Removed', 'Item removed from bag', 'default');
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <i className="fas fa-times" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantName, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <i className="fas fa-minus text-xs" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantName, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <i className="fas fa-plus text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => showToast('Coming Soon', 'Checkout will be available shortly', 'info')}
                className="w-full py-3 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors font-medium"
              >
                Proceed to Checkout
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">
                Tax calculated at checkout. Free shipping on orders over ৳2000.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <CartProvider>
      <ToastProvider>
        <CartContent />
      </ToastProvider>
    </CartProvider>
  );
}