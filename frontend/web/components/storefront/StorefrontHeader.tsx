"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingBag, Menu, X, User } from "lucide-react";
import { useStoreCart } from "./StoreCartProvider";
import type { StorefrontStore } from "@/lib/storefront/types";

interface Props {
  store: StorefrontStore;
  categories: string[];
  variant?: "light" | "dark";
}

/**
 * Single header used by every template. The look is driven entirely by theme
 * CSS variables (--sf-bg, --sf-text, --sf-accent, etc.) which the layout
 * applies on the storefront root, so this component never has to know which
 * template is active.
 */
export function StorefrontHeader({ store, categories, variant = "light" }: Props) {
  const cart = useStoreCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const homeHref = `/store/${store.id}`;
  const browseHref = `/store/${store.id}/products`;
  const isDark = variant === "dark";

  const announcement = store.settings.announcement;

  const navLinks = [
    { label: "Shop All", href: browseHref },
    ...categories.slice(0, 4).map((c) => ({
      label: c,
      href: `${browseHref}?category=${encodeURIComponent(c)}`,
    })),
  ];

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md" style={{ backgroundColor: isDark ? "rgba(10,10,10,0.85)" : "rgba(255,255,255,0.9)" }}>
      {/* Announcement bar */}
      {announcement?.enabled && announcement.message ? (
        <div
          className="text-center text-xs sm:text-sm py-2 px-4"
          style={{
            backgroundColor: announcement.backgroundColor || "var(--sf-primary)",
            color: announcement.textColor || "#ffffff",
          }}
        >
          {announcement.message}
          {announcement.linkText && announcement.linkUrl ? (
            <Link href={announcement.linkUrl} className="ml-2 underline">
              {announcement.linkText}
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          {/* Logo / Store name */}
          <Link href={homeHref} className="flex items-center gap-3 mr-4">
            {store.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logo} alt={store.name} className="h-9 w-9 object-contain rounded" />
            ) : null}
            <span
              className="font-semibold text-lg sm:text-xl tracking-tight"
              style={{ fontFamily: "var(--sf-font-heading)" }}
            >
              {store.settings.brand?.storeName || store.name}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium ml-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="opacity-80 hover:opacity-100 transition-opacity"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
              className="p-2 rounded-full hover:opacity-100 opacity-80 transition-opacity"
            >
              <Search size={20} />
            </button>
            <Link
              href={`${homeHref}/account`}
              aria-label="Account"
              className="p-2 rounded-full hover:opacity-100 opacity-80 transition-opacity hidden sm:inline-flex"
            >
              <User size={20} />
            </Link>
            <button
              type="button"
              aria-label="Cart"
              onClick={cart.toggle}
              className="p-2 rounded-full hover:opacity-100 opacity-80 transition-opacity relative"
            >
              <ShoppingBag size={20} />
              {cart.count > 0 ? (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--sf-accent)", color: "#fff" }}
                >
                  {cart.count}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-full lg:hidden"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search */}
        {searchOpen ? (
          <div className="border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
            <form
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) {
                  window.location.href = `${browseHref}?q=${encodeURIComponent(query.trim())}`;
                }
              }}
            >
              <Search size={18} className="opacity-60" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                className="flex-1 bg-transparent outline-none text-base"
              />
              <button
                type="submit"
                className="text-sm px-3 py-1 rounded font-medium"
                style={{ backgroundColor: "var(--sf-accent)", color: "#fff" }}
              >
                Search
              </button>
            </form>
          </div>
        ) : null}

        {/* Mobile nav drawer */}
        {mobileOpen ? (
          <div className="lg:hidden border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
            <nav className="flex flex-col py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-base font-medium border-b"
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
