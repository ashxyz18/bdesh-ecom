"use client"

import Link from "next/link"
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react"
import { useCart } from "../../shared/context/CartContext"
import type { TemplateConfig } from "../types"
import type { StoreTemplateProps } from "../../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface ConfigCartPageProps {
  config: TemplateConfig
  store: StoreTemplateProps["store"]
  formatPrice: (price: number) => string
  storeLink: (subpath: string) => string
}

export function ConfigCartPage({ config, store, formatPrice, storeLink }: ConfigCartPageProps) {
  const theme = useTemplateTheme(config)
  const { cartItems, removeFromCart, updateQuantity } = useCart()

  const subtotal = cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
  const shippingCost = subtotal > 5000 ? 0 : 120
  const total = subtotal + shippingCost

  return (
    <div className="min-h-screen bg-[var(--tpl-surface)]">
      <main className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 py-8`}>
        <h1 className="text-2xl font-bold text-[var(--tpl-text)] mb-6">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart size={48} className="mx-auto text-[var(--tpl-text-muted)] mb-4" />
            <p className="text-[var(--tpl-text-muted)] mb-4">Your cart is empty</p>
            <Link href={storeLink("")} className={`inline-flex items-center gap-2 px-6 py-2.5 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity`}>
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className={`${theme.cardClass} ${theme.radiusClass} p-4 flex gap-4`}>
                  <div className={`w-20 h-20 ${theme.radiusClass} overflow-hidden bg-gray-100 shrink-0`}>
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><ShoppingCart size={20} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={storeLink(`product/${product.slug}`)} className="text-sm font-medium text-[var(--tpl-text)] hover:text-[var(--tpl-primary)] line-clamp-1">{product.name}</Link>
                    <p className="text-sm font-bold text-[var(--tpl-primary)] mt-1">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className={`flex items-center border border-[var(--tpl-border)] ${theme.radiusClass}`}>
                        <button onClick={() => updateQuantity(product.id, Math.max(0, quantity - 1))} className="px-2 py-1 text-[var(--tpl-text)] hover:bg-[var(--tpl-surface)]"><Minus size={14} /></button>
                        <span className="px-2 text-sm text-[var(--tpl-text)]">{quantity}</span>
                        <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2 py-1 text-[var(--tpl-text)] hover:bg-[var(--tpl-surface)]"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(product.id)} className="text-[var(--tpl-error)] hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--tpl-text)]">{formatPrice(product.price * quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={`${theme.cardClass} ${theme.radiusClass} p-6 h-fit`}>
              <h2 className="text-lg font-bold text-[var(--tpl-text)] mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--tpl-text-muted)]">Subtotal</span>
                  <span className="text-[var(--tpl-text)]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--tpl-text-muted)]">Shipping</span>
                  <span className="text-[var(--tpl-text)]">{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-[var(--tpl-primary)]">Free shipping on orders over ৳5,000</p>
                )}
                <div className={`border-t border-[var(--tpl-border)] pt-3 flex justify-between`}>
                  <span className="font-bold text-[var(--tpl-text)]">Total</span>
                  <span className="font-bold text-[var(--tpl-primary)] text-lg">{formatPrice(total)}</span>
                </div>
              </div>
              <Link href={storeLink("checkout")} className={`mt-6 block text-center py-3 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity`}>
                Proceed to Checkout
              </Link>
              <Link href={storeLink("")} className="mt-2 block text-center text-sm text-[var(--tpl-text-muted)] hover:text-[var(--tpl-primary)]">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
