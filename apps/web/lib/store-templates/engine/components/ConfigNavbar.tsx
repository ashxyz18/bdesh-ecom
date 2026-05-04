"use client"

import { useState, useEffect, Fragment } from "react"
import Link from "next/link"
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronDown,
  LogIn, UserPlus, LogOut, ClipboardList
} from "lucide-react"
import { useCart } from "../../shared/context/CartContext"
import { useCustomerAuth } from "../../shared/context/CustomerAuthContext"
import { useWishlist } from "../../shared/hooks/useWishlist"
import type { TemplateConfig } from "../types"
import { useTemplateTheme } from "../hooks/useTemplateTheme"

interface ConfigNavbarProps {
  config: TemplateConfig
  store: {
    id: string
    name: string
    slug: string
    subdomain: string
    description: string | null
    logo: string | null
    collections: { id: string; name: string; slug: string; image: string | null }[]
  }
}

export function ConfigNavbar({ config, store }: ConfigNavbarProps) {
  const theme = useTemplateTheme(config)
  const { cartItems } = useCart()
  const { customer, isLoading, logout } = useCustomerAuth()
  const { wishlistCount } = useWishlist(store.id)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const storeLink = (subpath: string) => {
    const base = `/store?store=${store.subdomain}`
    return subpath ? `${base}&path=${subpath}` : base
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isDark = config.navbar.style === "sticky-dark"
  const isBlur = config.navbar.style === "sticky-blur"
  const isTransparent = config.navbar.style === "transparent"

  const navBg = isDark
    ? `bg-[var(--tpl-primary)] ${scrolled ? "bg-[var(--tpl-primary)]/95 backdrop-blur-md shadow-lg" : ""}`
    : isBlur
    ? `${scrolled ? "bg-[var(--tpl-bg)]/95 backdrop-blur-md shadow-sm" : "bg-[var(--tpl-bg)]"}`
    : isTransparent
    ? `${scrolled ? "bg-[var(--tpl-bg)]/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`
    : `${scrolled ? "bg-[var(--tpl-bg)]/95 backdrop-blur-md shadow-sm" : "bg-[var(--tpl-bg)]"}`

  const textColor = isDark ? "text-white" : "text-[var(--tpl-text)]"
  const mutedColor = isDark ? "text-white/70" : "text-[var(--tpl-text-muted)]"
  const hoverColor = isDark ? "hover:text-white" : "hover:text-[var(--tpl-primary)]"
  const iconHover = isDark ? "hover:bg-white/10" : "hover:bg-[var(--tpl-primary)]/5"

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <>
      {/* Announcement Bar */}
      {config.navbar.announcementBar && (
        <div
          className="text-center py-2 px-4 text-sm font-medium"
          style={{
            backgroundColor: config.navbar.announcementBar.bgColor || "var(--tpl-primary)",
            color: config.navbar.announcementBar.textColor || "#fff",
          }}
        >
          {config.navbar.announcementBar.message}
        </div>
      )}

      <header className={`sticky top-0 z-50 transition-all duration-300 ${navBg} ${!isDark ? "border-b border-[var(--tpl-border)]" : "border-b border-white/10"}`}>
        <div className={`${theme.maxWidthClass} mx-auto px-4 lg:px-8`}>
          <div className={`flex items-center justify-between h-16 ${config.navbar.layout === "centered" ? "lg:grid lg:grid-cols-3 lg:gap-4" : ""}`}>
            {/* Logo */}
            <div className={config.navbar.layout === "centered" ? "lg:flex lg:items-center lg:justify-start" : "flex items-center gap-2.5"}>
              <Link href={storeLink("")} className="flex items-center gap-2.5">
                {store.logo ? (
                  <img src={store.logo} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
                ) : (
                  <div className={`w-8 h-8 ${theme.radiusClass} flex items-center justify-center ${theme.bgPrimary} ${theme.textOnPrimary} font-bold text-sm`}>
                    {store.name.charAt(0)}
                  </div>
                )}
                <span className={`font-bold text-lg ${textColor}`}>{store.name}</span>
              </Link>
            </div>

            {/* Center Nav (centered layout) or Left Nav */}
            {config.navbar.layout === "centered" ? (
              <nav className={`hidden lg:flex items-center gap-6 justify-center`}>
                <Link href={storeLink("")} className={`text-sm font-medium ${mutedColor} ${hoverColor} transition-colors`}>Home</Link>
                {store.collections.slice(0, 5).map(col => (
                  <Link key={col.id} href={storeLink(`collection/${col.slug}`)} className={`text-sm font-medium ${mutedColor} ${hoverColor} transition-colors`}>{col.name}</Link>
                ))}
              </nav>
            ) : (
              <nav className="hidden lg:flex items-center gap-8">
                <Link href={storeLink("")} className={`text-sm font-medium ${textColor} ${hoverColor} transition-colors`}>Home</Link>
                {store.collections.slice(0, 5).map(col => (
                  <Link key={col.id} href={storeLink(`collection/${col.slug}`)} className={`text-sm font-medium ${mutedColor} ${hoverColor} transition-colors`}>{col.name}</Link>
                ))}
              </nav>
            )}

            {/* Right Icons */}
            <div className={`flex items-center gap-1 ${config.navbar.layout === "centered" ? "lg:flex lg:items-center lg:justify-end" : ""}`}>
              {config.navbar.showSearch && (
                <Link href={storeLink("search")} className={`relative p-2.5 ${iconHover} rounded-full transition-colors`}>
                  <Search size={20} className={mutedColor} />
                </Link>
              )}
              {config.navbar.showWishlist && (
                <Link href={storeLink("wishlist")} className={`relative p-2.5 ${iconHover} rounded-full transition-colors`}>
                  <Heart size={20} className={mutedColor} />
                  {wishlistCount > 0 && (
                    <span className={`absolute -top-0.5 -right-0.5 w-4.5 h-4.5 ${theme.bgPrimary} ${theme.textOnPrimary} text-[10px] font-bold rounded-full flex items-center justify-center`}>
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}
              <Link href={storeLink("cart")} className={`relative p-2.5 ${iconHover} rounded-full transition-colors`}>
                <ShoppingCart size={20} className={mutedColor} />
                {cartCount > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 w-4.5 h-4.5 ${theme.bgPrimary} ${theme.textOnPrimary} text-[10px] font-bold rounded-full flex items-center justify-center`}>
                    {cartCount}
                  </span>
                )}
              </Link>

              {config.navbar.showUserMenu && (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`p-2.5 ${iconHover} rounded-full transition-colors flex items-center gap-1`}
                  >
                    <User size={20} className={mutedColor} />
                    <ChevronDown size={14} className={mutedColor} />
                  </button>
                  {userMenuOpen && (
                    <div className={`absolute right-0 mt-2 w-56 ${theme.bgSurface} ${theme.radiusClass} shadow-xl ${theme.borderClass} py-2 z-50`}>
                      {isLoading ? (
                        <div className="px-4 py-2 text-sm text-[var(--tpl-text-muted)]">Loading...</div>
                      ) : customer ? (
                        <Fragment>
                          <div className={`px-4 py-2 border-b ${theme.borderClass}`}>
                            <p className={`text-sm font-medium text-[var(--tpl-text)]`}>{customer.name}</p>
                            <p className="text-xs text-[var(--tpl-text-muted)]">{customer.email}</p>
                          </div>
                          <Link href={storeLink("account")} className={`flex items-center gap-2 px-4 py-2 text-sm text-[var(--tpl-text)] hover:bg-[var(--tpl-primary)]/5`} onClick={() => setUserMenuOpen(false)}>
                            <ClipboardList size={14} /> My Orders
                          </Link>
                          <button onClick={() => { logout(); setUserMenuOpen(false) }} className={`flex items-center gap-2 px-4 py-2 text-sm text-[var(--tpl-error)] hover:bg-[var(--tpl-error)]/5 w-full text-left`}>
                            <LogOut size={14} /> Sign Out
                          </button>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <Link href={storeLink("login")} className={`flex items-center gap-2 px-4 py-2 text-sm text-[var(--tpl-text)] hover:bg-[var(--tpl-primary)]/5`} onClick={() => setUserMenuOpen(false)}>
                            <LogIn size={14} /> Sign In
                          </Link>
                          <Link href={storeLink("register")} className={`flex items-center gap-2 px-4 py-2 text-sm text-[var(--tpl-text)] hover:bg-[var(--tpl-primary)]/5`} onClick={() => setUserMenuOpen(false)}>
                            <UserPlus size={14} /> Create Account
                          </Link>
                        </Fragment>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden p-2.5 ${iconHover} rounded-full transition-colors`}>
                {mobileOpen ? <X size={20} className={mutedColor} /> : <Menu size={20} className={mutedColor} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className={`lg:hidden border-t ${theme.borderClass} ${theme.bgSurface}`}>
            <div className="p-4 space-y-1">
              <Link href={storeLink("")} className={`block px-3 py-2.5 ${theme.radiusClass} text-sm font-medium ${textColor} hover:bg-[var(--tpl-primary)]/5`} onClick={() => setMobileOpen(false)}>Home</Link>
              {store.collections.map(col => (
                <Link key={col.id} href={storeLink(`collection/${col.slug}`)} className={`block px-3 py-2.5 ${theme.radiusClass} text-sm ${mutedColor} hover:bg-[var(--tpl-primary)]/5`} onClick={() => setMobileOpen(false)}>{col.name}</Link>
              ))}
              <div className={`border-t ${theme.borderClass} my-2`} />
              {customer ? (
                <Fragment>
                  <Link href={storeLink("account")} className={`block px-3 py-2.5 ${theme.radiusClass} text-sm ${mutedColor} hover:bg-[var(--tpl-primary)]/5`} onClick={() => setMobileOpen(false)}>My Account</Link>
                  <button onClick={() => { logout(); setMobileOpen(false) }} className={`block w-full text-left px-3 py-2.5 ${theme.radiusClass} text-sm text-[var(--tpl-error)] hover:bg-[var(--tpl-error)]/5`}>Sign Out</button>
                </Fragment>
              ) : (
                <Fragment>
                  <Link href={storeLink("login")} className={`block px-3 py-2.5 ${theme.radiusClass} text-sm ${mutedColor} hover:bg-[var(--tpl-primary)]/5`} onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link href={storeLink("register")} className={`block px-3 py-2.5 ${theme.radiusClass} text-sm ${mutedColor} hover:bg-[var(--tpl-primary)]/5`} onClick={() => setMobileOpen(false)}>Create Account</Link>
                </Fragment>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}
