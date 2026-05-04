"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home, ShoppingCart, Package, Users, Megaphone, Tag, FileText, Globe2,
  BarChart3, Settings, Monitor, Palette, ChevronDown, ChevronRight,
  MoreHorizontal, Edit, Eye, Lock, ExternalLink, MessageCircle, Mail,
  Smartphone, Share2, Building2, Map, Bot, Grid3X3, Code2, Store,
  ArrowRight, Check, Sparkles, Clock, TrendingUp, DollarSign,
  Plus, Search, Bell, User, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/shared/Button";

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  status: string;
}

interface AdminDashboardProps {
  user: { name: string; email: string };
  store: StoreData;
}

export function AdminDashboard({ user, store }: AdminDashboardProps) {
  const [sidebarCollapsed] = useState(false);
  const [salesChannelOpen, setSalesChannelOpen] = useState(true);

  const sidebarWidth = sidebarCollapsed ? "w-16" : "w-60";

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-[#e3e3e3] transition-all duration-200 ${sidebarWidth}`}>
        <div className="flex flex-col h-full">
          {!sidebarCollapsed && (
            <>
              <div className="p-4 border-b border-[#e3e3e3]">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#008060] flex items-center justify-center">
                    <Home size={16} className="text-white" />
                  </div>
                  <span className="font-medium text-sm text-gray-900">{store.name}</span>
                </Link>
              </div>

              <nav className="flex-1 overflow-y-auto py-2">
                {/* Main navigation */}
                {[
                  { icon: Home, label: "Home", href: "/dashboard" },
                  { icon: ShoppingCart, label: "Orders", href: "/dashboard/orders" },
                  { icon: Package, label: "Products", href: "/dashboard/products" },
                  { icon: Users, label: "Customers", href: "#" },
                  { icon: Megaphone, label: "Marketing", href: "#" },
                  { icon: Tag, label: "Discounts", href: "#" },
                  { icon: FileText, label: "Content", href: "#" },
                  { icon: Globe2, label: "Markets", href: "#" },
                  { icon: BarChart3, label: "Analytics", href: "#" },
                  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                ))}

                <div className="mt-4 mb-1 px-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sales channels</p>
                </div>

                <button
                  onClick={() => setSalesChannelOpen(!salesChannelOpen)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-900 bg-gray-50 border-l-[3px] border-[#008060]"
                >
                  <Monitor size={20} className="text-[#008060]" />
                  <span className="flex-1 text-left">Online Store</span>
                  <ChevronDown size={14} className={`transition-transform ${salesChannelOpen ? "rotate-180" : ""}`} />
                </button>

                {salesChannelOpen && (
                  <div className="ml-9">
                    <Link
                      href="/dashboard/templates"
                      className="flex items-center gap-2 py-1.5 text-sm text-[#008060] font-medium bg-[#00806008] rounded ml-2 px-3"
                    >
                      <Palette size={16} />
                      Themes
                    </Link>
                  </div>
                )}
              </nav>

              <div className="p-3 border-t border-[#e3e3e3]">
                <div className="bg-[#1a1a1a] rounded-xl p-4 text-white text-xs space-y-2">
                  <p className="font-semibold">Trial ends in 3 days</p>
                  <p className="text-white/60">Select a plan to keep your store running.</p>
                  <button className="w-full py-2 bg-white text-black rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors">
                    Select a plan
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={sidebarCollapsed ? "ml-16" : "ml-60"}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 bg-white/80 backdrop-blur-md border-b border-[#e3e3e3] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              <Home size={16} className="inline mr-1.5 text-gray-400" />
              Online Store
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
              <MoreHorizontal size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#008060] flex items-center justify-center text-white font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-5xl">
          {/* Hero Banner Preview */}
          <div className="mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden relative h-48 md:h-64">
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-6 left-6">
              <p className="text-xl md:text-2xl font-semibold text-white">Be the next big thing</p>
              <button className="mt-2 px-5 py-2 bg-white text-gray-900 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                Shop all
              </button>
            </div>
          </div>

          {/* Warning banner */}
          <div className="bg-[#fff5e6] border-l-4 border-[#ffc453] rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-[#92400e]" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Password protected</p>
                <p className="text-xs text-gray-500">Remove the password to make your store public.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-sm text-[#008060] font-medium hover:underline">Edit password</button>
              <button className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Pick a plan
              </button>
            </div>
          </div>

          {/* Current Theme */}
          <ThemeCard
            variant="current"
            name="Horizon"
            version="3.5.1"
            addedAt="4 minutes ago"
          />

          {/* Draft Themes */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Draft themes</h2>
              <span className="text-xs text-gray-400">1</span>
            </div>
            <ThemeCard
              variant="draft"
              name="Horizon"
              addedAt="3 minutes ago"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function ThemeCard({
  variant,
  name,
  version,
  addedAt,
}: {
  variant: "current" | "draft";
  name: string;
  version?: string;
  addedAt?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-[#e3e3e3] shadow-sm mb-4 overflow-hidden`}>
      <div className="aspect-[16/9] bg-gradient-to-br from-[#006A4E] via-[#008060] to-[#004c3f] flex items-center justify-center relative">
        <svg width="48" height="48" viewBox="0 0 28 28" fill="none">
          <path d="M14 2L2 8v4c0 6.627 5.373 12 12 12s12-5.373 12-12V8L14 2z" fill="#fff" fillOpacity="0.2"/>
        </svg>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{name}</h3>
                {variant === "current" && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded">
                    Current theme
                  </span>
                )}
              </div>
              {addedAt && (
                <p className="text-xs text-gray-400 mt-0.5">Added: {addedAt}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {version && (
              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-50">
                Version {version} <ChevronDown size={12} />
              </button>
            )}
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
              <MoreHorizontal size={16} />
            </button>
            {variant === "draft" ? (
              <>
                <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Publish
                </button>
                <button className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors">
                  Edit
                </button>
              </>
            ) : (
              <button className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors">
                Edit theme
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
