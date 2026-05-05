"use client"

import { useCart } from "../context/CartContext"
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/shared/Button"
import Image from "next/image"
import { useState } from "react"

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cartItems, removeFromCart, updateQuantity, subtotal, itemCount } = useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-[#008060]" size={20} />
              <h2 className="text-lg font-bold text-gray-900">Your Cart ({itemCount})</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag size={40} className="text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-semibold text-lg">Your cart is empty</h3>
                <p className="text-gray-500 mt-1 max-w-[200px]">Looks like you haven't added anything to your cart yet.</p>
                <Button onClick={onClose} className="mt-6 bg-[#008060] text-white hover:bg-[#006A4E]">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={`${item.product.id}-${item.variantId}`} className="flex gap-4 group">
                    <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</h4>
                        <button 
                          onClick={() => removeFromCart(item.product.id, item.variantId)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">৳{item.product.price}</p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variantId)}
                            className="p-1.5 hover:bg-gray-50 text-gray-500"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-xs font-medium text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variantId)}
                            className="p-1.5 hover:bg-gray-50 text-gray-500"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-gray-900">৳{Number(item.product.price) * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="px-6 py-6 border-t border-gray-100 bg-gray-50 space-y-4">
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Subtotal</span>
                <span>৳{subtotal}</span>
              </div>
              <p className="text-xs text-gray-500 text-center">Shipping and taxes calculated at checkout.</p>
              <div className="space-y-3">
                <Button className="w-full bg-[#008060] text-white hover:bg-[#006A4E] py-6 text-lg font-bold">
                  Checkout
                </Button>
                <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-900" onClick={onClose}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
