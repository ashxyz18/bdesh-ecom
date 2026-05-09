"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Loader2, Search, Package, CheckCircle2, Truck, MapPin, Clock, ArrowLeft } from "lucide-react"
import type { TemplateConfig } from "../types"
import type { StoreTemplateProps } from "../../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface ConfigOrderTrackPageProps {
  config: TemplateConfig
  store: StoreTemplateProps["store"]
  formatPrice: (price: number) => string
  storeLink: (subpath: string) => string
  orderNumber: string
}

interface TrackingData {
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  createdAt: string
  updatedAt: string
  storeName: string
  trackingCode: string | null
  deliveredAt: string | null
  shippingCity: string
  shippingDistrict: string
  itemCount: number
  items: { name: string; quantity: number; price: number }[]
}

const STATUS_STEPS = [
  { key: "PENDING", label: "Order Placed", icon: Clock },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: MapPin },
]

function getStepIndex(status: string): number {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status)
  return idx >= 0 ? idx : 0
}

export function ConfigOrderTrackPage({ config, store, formatPrice, storeLink, orderNumber: initialOrderNumber }: ConfigOrderTrackPageProps) {
  const theme = useTemplateTheme(config)
  const [orderNum, setOrderNum] = useState(initialOrderNumber)
  const [searchInput, setSearchInput] = useState(initialOrderNumber)
  const [loading, setLoading] = useState(false)
  const [tracking, setTracking] = useState<TrackingData | null>(null)
  const [error, setError] = useState("")

  const fetchOrder = async (num: string) => {
    if (!num.trim()) return
    setLoading(true)
    setError("")
    setTracking(null)

    try {
      const res = await fetch(`/api/storefront/orders/${encodeURIComponent(num.trim())}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message || "Order not found. Please check the order number.")
        return
      }
      const data = await res.json()
      setTracking(data.order)
      setOrderNum(num.trim())
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrder(searchInput)
  }

  const currentStep = tracking ? getStepIndex(tracking.status) : 0

  return (
    <div className="min-h-screen bg-[var(--tpl-surface)]">
      <main className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8 py-8`}>
        {/* Back link */}
        <Link
          href={storeLink("")}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--tpl-text-muted)] hover:text-[var(--tpl-primary)] mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Store
        </Link>

        <h1 className="text-2xl font-bold text-[var(--tpl-text)] mb-6">Track Your Order</h1>

        {/* Search Form */}
        <div className={`${theme.cardClass} ${theme.radiusClass} p-6 mb-6`}>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter your order number (e.g. ORD-12345-abcde)"
              className={`flex-1 px-4 py-2.5 ${theme.radiusClass} border border-[var(--tpl-border)] bg-[var(--tpl-bg)] text-[var(--tpl-text)] text-sm outline-none focus:ring-2 focus:ring-[var(--tpl-primary)]/20`}
            />
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2`}
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
              Track
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {tracking && (
          <>
            {/* Order Info */}
            <div className={`${theme.cardClass} ${theme.radiusClass} p-6 mb-6`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-[var(--tpl-text-muted)]">Order Number</p>
                  <p className="text-lg font-bold text-[var(--tpl-primary)] font-mono">{tracking.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--tpl-text-muted)]">Total</p>
                  <p className="text-lg font-bold text-[var(--tpl-text)]">{formatPrice(tracking.total)}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-[var(--tpl-text-muted)]">Placed On</p>
                  <p className="text-[var(--tpl-text)] font-medium">
                    {new Date(tracking.createdAt).toLocaleDateString("en-BD", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--tpl-text-muted)]">Payment</p>
                  <p className={`font-medium ${tracking.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"}`}>
                    {tracking.paymentStatus === "PAID" ? "✓ Paid" : "⏳ Pending"}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--tpl-text-muted)]">Shipping To</p>
                  <p className="text-[var(--tpl-text)] font-medium">{tracking.shippingCity}, {tracking.shippingDistrict}</p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className={`${theme.cardClass} ${theme.radiusClass} p-6 mb-6`}>
              <h2 className="text-lg font-bold text-[var(--tpl-text)] mb-6">Order Progress</h2>
              <div className="relative">
                {/* Progress bar background */}
                <div className="hidden sm:block absolute top-5 left-0 right-0 h-1 bg-[var(--tpl-border)] rounded-full">
                  <div
                    className="h-full bg-[var(--tpl-primary)] rounded-full transition-all duration-500"
                    style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
                  {STATUS_STEPS.map((step, i) => {
                    const isCompleted = i <= currentStep
                    const isCurrent = i === currentStep
                    const Icon = step.icon

                    return (
                      <div key={step.key} className="flex sm:flex-col items-center sm:items-center gap-2 sm:gap-2 relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? `${theme.bgPrimary} ${theme.textOnPrimary}`
                              : "bg-[var(--tpl-border)] text-[var(--tpl-text-muted)]"
                          } ${isCurrent ? "ring-4 ring-[var(--tpl-primary)]/20" : ""}`}
                        >
                          <Icon size={18} />
                        </div>
                        <span className={`text-xs font-medium ${isCompleted ? "text-[var(--tpl-primary)]" : "text-[var(--tpl-text-muted)]"}`}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className={`${theme.cardClass} ${theme.radiusClass} p-6`}>
              <h2 className="text-lg font-bold text-[var(--tpl-text)] mb-4">Order Items ({tracking.itemCount})</h2>
              <div className="divide-y divide-[var(--tpl-border)]">
                {tracking.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-3 text-sm">
                    <span className="text-[var(--tpl-text)]">{item.name} × {item.quantity}</span>
                    <span className="text-[var(--tpl-text-muted)]">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* No order searched yet */}
        {!tracking && !error && !loading && (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-[var(--tpl-text-muted)] opacity-30 mb-4" />
            <p className="text-[var(--tpl-text-muted)]">Enter your order number to track your order.</p>
            <p className="text-xs text-[var(--tpl-text-muted)] mt-2">
              You can find your order number in the order confirmation page or email.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
