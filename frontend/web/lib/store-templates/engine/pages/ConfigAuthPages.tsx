"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LogIn, UserPlus, User, LogOut, Loader2, ClipboardList, Package } from "lucide-react"
import { useCustomerAuth } from "../../shared/context/CustomerAuthContext"
import type { TemplateConfig } from "../types"
import type { StoreTemplateProps } from "../../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface ConfigAuthPagesProps {
  config: TemplateConfig
  store: StoreTemplateProps["store"]
  page: "login" | "register" | "account"
  formatPrice?: (price: number) => string
  storeLink: (subpath: string) => string
}

export function ConfigAuthPages({ config, store, page, formatPrice, storeLink }: ConfigAuthPagesProps) {
  switch (page) {
    case "login":
      return <ConfigLoginPage config={config} store={store} storeLink={storeLink} />
    case "register":
      return <ConfigRegisterPage config={config} store={store} storeLink={storeLink} />
    case "account":
      return <ConfigAccountPage config={config} store={store} formatPrice={formatPrice!} storeLink={storeLink} />
    default:
      return null
  }
}

// ─── Login Page ─────────────────────────────────────────────────────
function ConfigLoginPage({ config, store, storeLink }: { config: TemplateConfig; store: StoreTemplateProps["store"]; storeLink: (subpath: string) => string }) {
  const theme = useTemplateTheme(config)
  const { login, isLoading } = useCustomerAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(email, password)
      window.location.href = storeLink("account")
    } catch {
      setError("Invalid email or password")
    }
  }

  return (
    <div className="min-h-screen bg-[var(--tpl-bg)]">
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 ${theme.bgPrimary} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--tpl-text)]">Welcome Back</h1>
          <p className="text-[var(--tpl-text-muted)] mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--tpl-text)] mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={`w-full border border-[var(--tpl-border)] ${theme.radiusClass} px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--tpl-primary)] focus:border-[var(--tpl-primary)] outline-none bg-[var(--tpl-surface)] text-[var(--tpl-text)]`}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--tpl-text)] mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={`w-full border border-[var(--tpl-border)] ${theme.radiusClass} px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--tpl-primary)] focus:border-[var(--tpl-primary)] outline-none bg-[var(--tpl-surface)] text-[var(--tpl-text)]`}
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity disabled:opacity-50`}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--tpl-text-muted)] mt-6">
          Don't have an account?{" "}
          <Link href={storeLink("register")} className="text-[var(--tpl-primary)] hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

// ─── Register Page ──────────────────────────────────────────────────
function ConfigRegisterPage({ config, store, storeLink }: { config: TemplateConfig; store: StoreTemplateProps["store"]; storeLink: (subpath: string) => string }) {
  const theme = useTemplateTheme(config)
  const { register, isLoading } = useCustomerAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await register({ name, email, password, phone })
      window.location.href = storeLink("account")
    } catch {
      setError("Registration failed. Email may already be in use.")
    }
  }

  return (
    <div className="min-h-screen bg-[var(--tpl-bg)]">
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 ${theme.bgPrimary} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--tpl-text)]">Create Account</h1>
          <p className="text-[var(--tpl-text-muted)] mt-2">Join us for a better shopping experience</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--tpl-text)] mb-1 block">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className={`w-full border border-[var(--tpl-border)] ${theme.radiusClass} px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--tpl-primary)] focus:border-[var(--tpl-primary)] outline-none bg-[var(--tpl-surface)] text-[var(--tpl-text)]`}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--tpl-text)] mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={`w-full border border-[var(--tpl-border)] ${theme.radiusClass} px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--tpl-primary)] focus:border-[var(--tpl-primary)] outline-none bg-[var(--tpl-surface)] text-[var(--tpl-text)]`}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--tpl-text)] mb-1 block">Phone (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className={`w-full border border-[var(--tpl-border)] ${theme.radiusClass} px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--tpl-primary)] focus:border-[var(--tpl-primary)] outline-none bg-[var(--tpl-surface)] text-[var(--tpl-text)]`}
              placeholder="+880 1XXX-XXXXXX"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--tpl-text)] mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className={`w-full border border-[var(--tpl-border)] ${theme.radiusClass} px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--tpl-primary)] focus:border-[var(--tpl-primary)] outline-none bg-[var(--tpl-surface)] text-[var(--tpl-text)]`}
              placeholder="At least 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity disabled:opacity-50`}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--tpl-text-muted)] mt-6">
          Already have an account?{" "}
          <Link href={storeLink("login")} className="text-[var(--tpl-primary)] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

// ─── Account Page ───────────────────────────────────────────────────
function ConfigAccountPage({ config, store, formatPrice, storeLink }: { config: TemplateConfig; store: StoreTemplateProps["store"]; formatPrice: (price: number) => string; storeLink: (subpath: string) => string }) {
  const theme = useTemplateTheme(config)
  const { customer, isLoading, logout } = useCustomerAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!customer) return
    fetch(`/api/${store.id}/orders`)
      .then(r => r.json())
      .then(data => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoadingOrders(false))
  }, [customer, store.id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--tpl-bg)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--tpl-text-muted)]" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-[var(--tpl-bg)]">
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <User className="w-16 h-16 text-[var(--tpl-text-muted)] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--tpl-text)] mb-2">Please sign in</h2>
          <p className="text-[var(--tpl-text-muted)] mb-6">You need to be logged in to view your account.</p>
          <Link
            href={storeLink("login")}
            className={`inline-block px-6 py-3 ${theme.bgPrimary} ${theme.textOnPrimary} ${theme.radiusClass} font-medium hover:opacity-90 transition-opacity`}
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      CONFIRMED: "bg-blue-100 text-blue-700",
      PROCESSING: "bg-purple-100 text-purple-700",
      SHIPPED: "bg-indigo-100 text-indigo-700",
      DELIVERED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    }
    return map[s] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="min-h-screen bg-[var(--tpl-bg)]">
      <div className={`${theme.maxWidthClass} mx-auto px-4 py-8`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--tpl-text)]">My Account</h1>
            <p className="text-[var(--tpl-text-muted)]">{customer.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-[var(--tpl-text-muted)] hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className={`bg-[var(--tpl-surface)] ${theme.radiusClass} p-6 mb-8 border border-[var(--tpl-border)]`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${theme.bgPrimary} rounded-full flex items-center justify-center ${theme.textOnPrimary} text-xl font-bold`}>
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-[var(--tpl-text)]">{customer.name}</h3>
              <p className="text-sm text-[var(--tpl-text-muted)]">{customer.email}</p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <h2 className="text-lg font-bold text-[var(--tpl-text)] mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5" /> Order History
        </h2>

        {loadingOrders ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--tpl-text-muted)]" />
          </div>
        ) : orders.length === 0 ? (
          <div className={`text-center py-12 bg-[var(--tpl-surface)] ${theme.radiusClass} border border-[var(--tpl-border)]`}>
            <Package className="w-12 h-12 text-[var(--tpl-text-muted)] mx-auto mb-3" />
            <p className="text-[var(--tpl-text-muted)]">No orders yet</p>
            <Link
              href={storeLink("")}
              className="text-sm text-[var(--tpl-primary)] hover:underline mt-2 inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className={`border border-[var(--tpl-border)] ${theme.radiusClass} p-4 bg-[var(--tpl-surface)]`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--tpl-text)]">
                    #{order.orderNumber || order.id.slice(-8)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-[var(--tpl-text-muted)]">
                  <span>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</span>
                  <span className="font-semibold text-[var(--tpl-text)]">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
