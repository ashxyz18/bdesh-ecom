"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, Check } from "lucide-react"
import { useCart } from "../../shared/context/CartContext"
import type { TemplateConfig } from "../types"
import type { StoreTemplateProps } from "../../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface ConfigCheckoutPageProps {
  config: TemplateConfig
  store: StoreTemplateProps["store"]
  formatPrice: (price: number) => string
  storeLink: (subpath: string) => string
}

export function ConfigCheckoutPage({ config, store, formatPrice, storeLink }: ConfigCheckoutPageProps) {
  const theme = useTemplateTheme(config)
  const { cartItems, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [form, setForm] = useState({
    name: "", phone: "", address: "", city: "", district: "", postalCode: "",
    paymentMethod: "CASH_ON_DELIVERY",
  })

  const subtotal = cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
  const shippingCost = subtotal > 5000 ? 0 : 120
  const total = subtotal + shippingCost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/storefront/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store.id,
          items: cartItems.map(({ product, quantity }) => ({
            productId: product.id, name: product.name, price: product.price, quantity, image: product.images[0] || null,
          })),
          shipping: form,
          paymentMethod: form.paymentMethod,
          subtotal, shippingCost, total,
        }),
      })
      if (res.ok) { clearCart(); setOrderPlaced(true) }
    } catch {} finally { setLoading(false) }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[var(--tpl-surface)] flex items-center justify-center">
        <div className="text-center p-8">
          <div className={`w-16 h-16 ${theme.bgPrimary} ${theme.textOnPrimary} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Check size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--tpl-text)] mb-2">Order Placed!</h1>
          <p className="text-[var(--tpl-text-muted)] mb-6">Thank you for your order. We'll contact you shortly.</p>
          <Link href={storeLink("")} className={`inline-block px-6 py-2.5 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium`}>Continue Shopping</Link>
        </div>
      </div>
    )
  }

  const inputClass = `w-full px-4 py-2.5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-bg)] text-[var(--tpl-text)] text-sm outline-none focus:ring-2 focus:ring-[var(--tpl-primary)]/20`
  const paymentMethods = [
    { id: "CASH_ON_DELIVERY", label: "Cash on Delivery", desc: "Pay when you receive" },
    { id: "BKASH", label: "bKash", desc: "Mobile payment" },
    { id: "NAGAD", label: "Nagad", desc: "Mobile payment" },
  ]

  return (
    <div className="min-h-screen bg-[var(--tpl-surface)]">
      <main className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 py-8`}>
        <h1 className="text-2xl font-bold text-[var(--tpl-text)] mb-6">Checkout</h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--tpl-text-muted)]">Your cart is empty.</p>
            <Link href={storeLink("")} className={`mt-4 inline-block ${theme.bgPrimary} ${theme.textOnPrimary} px-6 py-2 ${theme.radiusClass}`}>Shop Now</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping */}
                <div className={`${theme.cardClass} ${theme.radiusClass} p-6`}>
                  <h2 className="text-lg font-bold text-[var(--tpl-text)] mb-4">Shipping Information</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label className="text-sm font-medium text-[var(--tpl-text)]">Full Name</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputClass} /></div>
                    <div><label className="text-sm font-medium text-[var(--tpl-text)]">Phone</label><input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputClass} /></div>
                    <div className="sm:col-span-2"><label className="text-sm font-medium text-[var(--tpl-text)]">Address</label><input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={inputClass} /></div>
                    <div><label className="text-sm font-medium text-[var(--tpl-text)]">City</label><input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} className={inputClass} /></div>
                    <div><label className="text-sm font-medium text-[var(--tpl-text)]">District</label><input required value={form.district} onChange={e => setForm({...form, district: e.target.value})} className={inputClass} /></div>
                  </div>
                </div>

                {/* Payment */}
                <div className={`${theme.cardClass} ${theme.radiusClass} p-6`}>
                  <h2 className="text-lg font-bold text-[var(--tpl-text)] mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    {paymentMethods.map(method => (
                      <label key={method.id} className={`flex items-center gap-3 p-4 ${theme.radiusClass} border cursor-pointer transition-all ${form.paymentMethod === method.id ? "border-[var(--tpl-primary)] bg-[var(--tpl-primary)]/5" : "border-[var(--tpl-border)] hover:bg-[var(--tpl-surface)]"}`}>
                        <input type="radio" name="payment" value={method.id} checked={form.paymentMethod === method.id} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="accent-[var(--tpl-primary)]" />
                        <div>
                          <p className="text-sm font-medium text-[var(--tpl-text)]">{method.label}</p>
                          <p className="text-xs text-[var(--tpl-text-muted)]">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className={`${theme.cardClass} ${theme.radiusClass} p-6 h-fit`}>
                <h2 className="text-lg font-bold text-[var(--tpl-text)] mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span className="text-[var(--tpl-text-muted)]">{product.name} × {quantity}</span>
                      <span className="text-[var(--tpl-text)]">{formatPrice(product.price * quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className={`border-t border-[var(--tpl-border)] pt-3 space-y-2 text-sm`}>
                  <div className="flex justify-between"><span className="text-[var(--tpl-text-muted)]">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--tpl-text-muted)]">Shipping</span><span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span></div>
                  <div className={`flex justify-between border-t border-[var(--tpl-border)] pt-2`}>
                    <span className="font-bold text-[var(--tpl-text)]">Total</span>
                    <span className="font-bold text-[var(--tpl-primary)] text-lg">{formatPrice(total)}</span>
                  </div>
                </div>
                <button type="submit" disabled={loading} className={`mt-6 w-full py-3 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2`}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  Place Order
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
