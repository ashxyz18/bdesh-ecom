"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Store,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  Plus,
  ExternalLink,
  Sparkles,
  Palette,
  Search,
  Bell,
  User,
  ChevronRight,
  Keyboard,
  Paintbrush,
  Megaphone,
  Globe,
  Mail,
  Share2,
  Tag,
  BarChart3,
  Wand2,
  CreditCard,
} from "lucide-react";
import { DashboardProvider, useDashboard } from "./DashboardContext";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, stores, activeStore, setActiveStore, loading } = useDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  // Count pending orders across stores
  const pendingOrderCount = 0; // Will be dynamic when we have real-time data

  const navSections = activeStore
    ? [
        {
          label: "Main",
          items: [
            { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
          ],
        },
        {
          label: "Store",
          items: [
            { href: "/dashboard/products", icon: Package, label: "Products" },
            { href: "/dashboard/orders", icon: ShoppingCart, label: "Orders", badge: pendingOrderCount || undefined },
            { href: "/dashboard/ai-builder", icon: Wand2, label: "AI Builder" },
            { href: "/dashboard/customize", icon: Paintbrush, label: "Customize Store" },
            { href: "/dashboard/templates", icon: Palette, label: "Templates" },
            { href: "/dashboard/settings", icon: Settings, label: "Settings" },
            { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
          ],
        },
        {
          label: "Marketing",
          items: [
            { href: "/dashboard/marketing", icon: Megaphone, label: "Marketing" },
            { href: "/dashboard/marketing/seo", icon: Globe, label: "SEO" },
            { href: "/dashboard/marketing/campaigns", icon: Mail, label: "Campaigns" },
            { href: "/dashboard/marketing/social", icon: Share2, label: "Social" },
            { href: "/dashboard/marketing/discounts", icon: Tag, label: "Discounts" },
            { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
          ],
        },
      ]
    : [
        {
          label: "Main",
          items: [
            { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
          ],
        },
      ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        role="navigation"
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 transform transition-all duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarCollapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center justify-between h-16 px-4 border-b border-slate-800 ${sidebarCollapsed ? "justify-center" : ""}`}>
            <Link href="/" className={`flex items-center gap-2.5 ${sidebarCollapsed ? "hidden" : ""}`}>
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                <Store className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">BdeshShop</span>
            </Link>
            {sidebarCollapsed && (
              <Link href="/" className="flex items-center justify-center">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Store className="h-4.5 w-4.5 text-white" />
                </div>
              </Link>
            )}
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white" aria-label="Close sidebar">
              <X size={20} />
            </button>
          </div>

          {/* Store Selector */}
          {stores.length > 0 && (
            <div className={`p-3 border-b border-slate-800 ${sidebarCollapsed ? "px-2" : ""}`}>
              <div className="relative">
                <button
                  onClick={() => {
                    if (sidebarCollapsed) {
                      setSidebarCollapsed(false);
                    }
                    setStoreDropdownOpen(!storeDropdownOpen);
                  }}
                  aria-expanded={storeDropdownOpen}
                  aria-haspopup="true"
                  className={`w-full flex items-center justify-between rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm ${
                    sidebarCollapsed ? "p-2.5 justify-center" : "px-3 py-2.5"
                  }`}
                >
                  <div className={`flex items-center gap-2.5 min-w-0 ${sidebarCollapsed ? "" : ""}`}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0">
                      <Sparkles size={14} className="text-emerald-400" />
                    </div>
                    {!sidebarCollapsed && (
                      <div className="text-left min-w-0">
                        <span className="truncate font-medium text-white block">{activeStore?.name || "Select Store"}</span>
                        <span className="text-[11px] text-slate-400 block truncate">{activeStore?.subdomain}.bdesh.shop</span>
                      </div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform ${storeDropdownOpen ? "rotate-180" : ""}`} />
                  )}
                </button>

                {storeDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-10 py-1 overflow-hidden">
                    {stores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => {
                          setActiveStore(store);
                          setStoreDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-sm hover:bg-slate-700 flex items-center gap-2.5 transition-colors ${
                          activeStore?.id === store.id ? "bg-slate-700/50 text-emerald-400" : "text-slate-300"
                        }`}
                      >
                        <div className="w-6 h-6 rounded bg-slate-600 flex items-center justify-center shrink-0">
                          <Store size={12} />
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate font-medium">{store.name}</span>
                          <span className="block text-[11px] text-slate-400 truncate">{store.subdomain}.bdesh.shop</span>
                        </div>
                      </button>
                    ))}
                    <Link
                      href="/dashboard/new-store"
                      className="w-full text-left px-3 py-2.5 text-sm text-emerald-400 hover:bg-slate-700 flex items-center gap-2.5 border-t border-slate-700 mt-1 transition-colors"
                      onClick={() => setStoreDropdownOpen(false)}
                    >
                      <Plus size={14} /> Create New Store
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-6" aria-label="Dashboard navigation">
            {navSections.map((section) => (
              <div key={section.label}>
                {!sidebarCollapsed && (
                  <p className="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{section.label}</p>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${
                          sidebarCollapsed ? "px-2.5 py-2.5 justify-center" : "px-3 py-2.5"
                        } ${
                          isActive
                            ? "bg-emerald-600/15 text-emerald-400"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                      >
                        <item.icon size={18} className="shrink-0" />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {item.badge && item.badge > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold">
                                {item.badge}
                              </span>
                            )}
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="border-t border-slate-800 p-3 space-y-1">
            {/* View Store Link */}
            {activeStore && (
              <a
                href={`/?store=${activeStore.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors ${
                  sidebarCollapsed ? "px-2.5 py-2.5 justify-center" : "px-3 py-2"
                }`}
                title={sidebarCollapsed ? "View Store" : undefined}
              >
                <ExternalLink size={16} className="shrink-0" />
                {!sidebarCollapsed && <span>View Store</span>}
              </a>
            )}

            {/* Admin Panel Link */}
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 rounded-lg text-sm text-amber-400 hover:bg-amber-500/10 transition-colors ${
                  sidebarCollapsed ? "px-2.5 py-2.5 justify-center" : "px-3 py-2"
                }`}
                title={sidebarCollapsed ? "Admin Panel" : undefined}
              >
                <Shield size={16} className="shrink-0" />
                {!sidebarCollapsed && <span>Admin Panel</span>}
              </Link>
            )}

            {/* Collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-expanded={!sidebarCollapsed}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`flex items-center gap-2 rounded-lg text-sm text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors w-full ${
                sidebarCollapsed ? "px-2.5 py-2.5 justify-center" : "px-3 py-2"
              }`}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Keyboard size={16} className="shrink-0" />
              {!sidebarCollapsed && <span>Collapse</span>}
            </button>

            {/* User section */}
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center py-2" : "px-3 py-2"}`}>
              <div className="w-9 h-9 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-400 font-semibold text-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              )}
              {!sidebarCollapsed && (
                <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors" title="Logout" aria-label="Log out">
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-8 gap-4" role="banner">
          {/* Left: Mobile menu + Search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900" aria-label="Open sidebar menu">
              <Menu size={20} />
            </button>

            {/* Search bar */}
            <div className={`relative flex-1 max-w-md transition-all ${searchFocused ? "max-w-lg" : ""}`}>
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search orders, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label="Search orders and products"
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors" aria-label={`Notifications${pendingOrderCount > 0 ? ` - ${pendingOrderCount} pending orders` : ""}`}>
              <Bell size={18} />
              {pendingOrderCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" aria-hidden="true" />
              )}
            </button>

            {/* View Store */}
            {activeStore && (
              <a
                href={`/?store=${activeStore.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors px-3 py-2 rounded-xl hover:bg-emerald-50"
              >
                <ExternalLink size={14} />
                View Store
              </a>
            )}

            {/* New Store */}
            <Link
              href="/dashboard/new-store"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">New Store</span>
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                aria-label="User menu"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-emerald-600/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform hidden sm:block ${userDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl shadow-black/10 border border-slate-200/80 py-1.5 z-50 animate-fade-in-down">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings size={15} className="text-slate-400" />
                      Settings
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Shield size={15} className="text-amber-500" />
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut size={15} className="text-red-400" />
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="p-4 lg:p-8" role="main">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </DashboardProvider>
  );
}
