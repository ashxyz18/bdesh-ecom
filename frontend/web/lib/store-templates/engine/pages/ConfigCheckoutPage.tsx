"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, Check, Copy, CheckCircle2, ExternalLink } from "lucide-react"
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

interface OrderResult {
  order?: {
    id: string
    orderNumber: string
    total: number
    status: string
    paymentStatus: string
  }
  payment?: {
    clientSecret?: string
    redirectUrl?: string
    method?: string
  } | null
}

export function ConfigCheckoutPage({ config, store, formatPrice, storeLink }: ConfigCheckoutPageProps) {
  const theme = useTemplateTheme(config)
  const { cartItems, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null)
  const [orderNumber, setOrderNumber] = useState("")
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    name: "", phone: "", address: "", city: "", district: "", postalCode: "",
    paymentMethod: "CASH_ON_DELIVERY",
    notes: "",
  })

  const subtotal = cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
  const shippingCost = subtotal > 5000 ? 0 : 120
  const total = subtotal + shippingCost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

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
          notes: form.notes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Failed to place order. Please try again.")
        return
      }

      const result: OrderResult = data
      setOrderResult(result)

      if (result.order?.orderNumber) {
        setOrderNumber(result.order.orderNumber)
      }

      // If there's a payment redirect URL (bKash, Nagad, Rocket), redirect the user
      if (result.payment?.redirectUrl) {
        // Clear cart before redirecting
        clearCart()
        window.location.href = result.payment.redirectUrl
        return
      }

      // For COD or completed payments, show confirmation
      clearCart()
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Order confirmation view
  if (orderResult && orderResult.order) {
    return (
      <div className="min-h-screen bg-[var(--tpl-surface)] flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className={`w-20 h-20 ${theme.bgPrimary} ${theme.textOnPrimary} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--tpl-text)] mb-2">Order Placed Successfully!</h1>
          <p className="text-[var(--tpl-text-muted)] mb-6">Thank you for your order. We'll process it right away.</p>

          {/* Order Number Card */}
          <div className="bg-[var(--tpl-bg)] border border-[var(--tpl-border)] rounded-xl p-4 mb-6">
            <p className="text-xs text-[var(--tpl-text-muted)] mb-1">Order Number</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-[var(--tpl-primary)] font-mono">{orderNumber || orderResult.order.id}</span>
              {orderNumber && (
                <button
                  onClick={copyOrderNumber}
                  className="p-1.5 rounded-lg hover:bg-[var(--tpl-surface)] transition-colors text-[var(--tpl-text-muted)]"
                  title="Copy order number"
                >
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-[var(--tpl-bg)] border border-[var(--tpl-border)] rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--tpl-text-muted)]">Payment Method</span>
              <span className="text-[var(--tpl-text)] font-medium">
                {form.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" :
                 form.paymentMethod === "BKASH" ? "bKash" :
                 form.paymentMethod === "NAGAD" ? "Nagad" :
                 form.paymentMethod === "ROCKET" ? "Rocket" : form.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--tpl-text-muted)]">Total</span>
              <span className="text-[var(--tpl-primary)] font-bold">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--tpl-text-muted)]">Status</span>
              <span className={`font-medium ${orderResult.order.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"}`}>
                {orderResult.order.paymentStatus === "PAID" ? "✓ Paid" : "⏳ Pending"}
              </span>
            </div>
          </div>

          {/* COD Instructions */}
          {form.paymentMethod === "CASH_ON_DELIVERY" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-amber-800 font-medium mb-1">Cash on Delivery</p>
              <p className="text-xs text-amber-700">Please keep ৳{Math.round(total)} ready when your order arrives. Our delivery partner will collect the payment.</p>
            </div>
          )}

          {/* Mobile Payment Instructions */}
          {(form.paymentMethod === "BKASH" || form.paymentMethod === "NAGAD" || form.paymentMethod === "ROCKET") && orderResult.order.paymentStatus !== "PAID" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-blue-800 font-medium mb-1">📱 Mobile Payment</p>
              <p className="text-xs text-blue-700">
                If you weren't redirected to complete payment, you can pay later. Our team will contact you with payment instructions.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link
              href={storeLink("")}
              className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity`}
            >
              Continue Shopping
            </Link>
            {orderNumber && (
              <Link
                href={storeLink(`track?order=${orderNumber}`)}
                className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-[var(--tpl-border)] ${theme.radiusClass} font-medium text-[var(--tpl-text)] hover:bg-[var(--tpl-surface)] transition-colors`}
              >
                <ExternalLink size={16} />
                Track Order
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  const inputClass = `w-full px-4 py-2.5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-bg)] text-[var(--tpl-text)] text-sm outline-none focus:ring-2 focus:ring-[var(--tpl-primary)]/20`
  const paymentMethods = [
    { id: "CASH_ON_DELIVERY", label: "Cash on Delivery", desc: "Pay when you receive", icon: "💵" },
    { id: "BKASH", label: "bKash", desc: "Mobile payment", icon: "📱" },
    { id: "NAGAD", label: "Nagad", desc: "Mobile payment", icon: "📱" },
  ]

  return (
    <div className="min-h-screen bg-[var(--tpl-surface)]">
      <main className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 py-8`}>
        <h1 className="text-2xl font-bold text-[var(--tpl-text)] mb-6">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

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
                    <div><label className="text-sm font-medium text-[var(--tpl-text)]">Full Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputClass} placeholder="Your full name" /></div>
                    <div><label className="text-sm font-medium text-[var(--tpl-text)]">Phone *</label><input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputClass} placeholder="01XXXXXXXXX" /></div>
                    <div className="sm:col-span-2"><label className="text-sm font-medium text-[var(--tpl-text)]">Address *</label><input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={inputClass} placeholder="House, Road, Area" /></div>
                    <div><label className="text-sm font-medium text-[var(--tpl-text)]">City *</label><input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} className={inputClass} placeholder="Dhaka" /></div>
                    <div><label className="text-sm font-medium text-[var(--tpl-text)]">District *</label>
                      <select required value={form.district} onChange={e => setForm({...form, district: e.target.value})} className={inputClass}>
                        <option value="">Select District</option>
                        {["Dhaka","Chittagong","Khulna","Rajshahi","Sylhet","Rangpur","Barisal","Mymensingh","Comilla","Gazipur","Narayanganj","Tongi"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div><label className="text-sm font-medium text-[var(--tpl-text)]">Postal Code</label><input value={form.postalCode} onChange={e => setForm({...form, postalCode: e.target.value})} className={inputClass} placeholder="1200" /></div>
                    <div><label className="text-sm font-medium text-[var(--tpl-text)]">Order Notes</label><input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className={inputClass} placeholder="Any special instructions" /></div>
                  </div>
                </div>

                {/* Payment */}
                <div className={`${theme.cardClass} ${theme.radiusClass} p-6`}>
                  <h2 className="text-lg font-bold text-[var(--tpl-text)] mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    {paymentMethods.map(method => (
                      <label key={method.id} className={`flex items-center gap-3 p-4 ${theme.radiusClass} border cursor-pointer transition-all ${form.paymentMethod === method.id ? "border-[var(--tpl-primary)] bg-[var(--tpl-primary)]/5" : "border-[var(--tpl-border)] hover:bg-[var(--tpl-surface)]"}`}>
                        <input type="radio" name="payment" value={method.id} checked={form.paymentMethod === method.id} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="accent-[var(--tpl-primary)]" />
                        <span className="text-lg">{method.icon}</span>
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
                  {shippingCost === 0 && <p className="text-xs text-emerald-600">🎉 Free shipping on orders over ৳5,000!</p>}
                  <div className={`flex justify-between border-t border-[var(--tpl-border)] pt-2`}>
                    <span className="font-bold text-[var(--tpl-text)]">Total</span>
                    <span className="font-bold text-[var(--tpl-primary)] text-lg">{formatPrice(total)}</span>
                  </div>
                </div>
                <button type="submit" disabled={loading} className={`mt-6 w-full py-3 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2`}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
                <p className="text-xs text-[var(--tpl-text-muted)] text-center mt-3">
                  By placing this order, you agree to the store's terms and conditions.
                </p>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
