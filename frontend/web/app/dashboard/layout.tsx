"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Package, ShoppingCart, Calendar, Settings, Store,
  LogOut, Menu, X, ChevronDown, Shield, Plus, ExternalLink,
  Sparkles, Palette, Search, Bell, ChevronRight, Keyboard,
  Paintbrush, Megaphone, Globe, Mail, Share2, Tag,
  BarChart3, CreditCard, Box,
  MapPin, Truck, ClipboardCheck, CheckCircle2, Brain,
} from "lucide-react";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import "./dashboard.css";

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
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const pendingOrderCount = 0;

  const navSections = activeStore
    ? [
        {
          label: "Overview",
          items: [
            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          ],
        },
        {
          label: "Store Management",
          items: [
            { href: "/dashboard/products", icon: Package, label: "Products" },
            { href: "/dashboard/inventory", icon: Box, label: "Inventory" },
            { href: "/dashboard/bookings", icon: Calendar, label: "Bookings" },
          ],
        },
        {
          label: "Orders & Fulfillment",
          items: [
            { href: "/dashboard/orders", icon: ShoppingCart, label: "Orders", badge: pendingOrderCount || undefined },
            { href: "/dashboard/tracking", icon: MapPin, label: "Tracking" },
            { href: "/dashboard/delivery", icon: Truck, label: "Delivery Partners" },
          ],
        },
        {
          label: "Design",
          items: [
            { href: "/dashboard/templates", icon: Palette, label: "Templates" },
            { href: "/dashboard/customize", icon: Paintbrush, label: "Customize" },
          ],
        },
        {
          label: "Marketing & Growth",
          items: [
            { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
            { href: "/dashboard/marketing", icon: Megaphone, label: "Marketing" },
            { href: "/dashboard/marketing/seo", icon: Globe, label: "SEO" },
            { href: "/dashboard/marketing/campaigns", icon: Mail, label: "Campaigns" },
            { href: "/dashboard/marketing/discounts", icon: Tag, label: "Discounts" },
          ],
        },
        {
          label: "Settings",
          items: [
            { href: "/dashboard/settings", icon: Settings, label: "Settings" },
            { href: "/dashboard/ai-settings", icon: Brain, label: "AI Settings" },
            { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
          ],
        },
      ]
    : [
        {
          label: "Overview",
          items: [
            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          ],
        },
        {
          label: "Design",
          items: [
            { href: "/dashboard/templates", icon: Palette, label: "Templates" },
            { href: "/dashboard/customize", icon: Paintbrush, label: "Customize" },
          ],
        },
        {
          label: "Settings",
          items: [
            { href: "/dashboard/settings", icon: Settings, label: "Settings" },
            { href: "/dashboard/ai-settings", icon: Brain, label: "AI Settings" },
          ],
        },
      ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F7FB" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="dark-spinner" />
          <span className="text-sm font-medium" style={{ color: "#6B7280" }}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard-wrapper">
      <div className="ambient-glow ambient-glow-1"></div>
      <div className="ambient-glow ambient-glow-2"></div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        role="navigation"
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${sidebarCollapsed ? "w-[68px]" : "w-64"} lg:translate-x-0`}
        style={{
          background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div
            className="flex items-center justify-between h-16 px-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Link href="/" className={`flex items-center gap-2.5 ${sidebarCollapsed ? "hidden" : ""}`}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                }}
              >
                <Store className="h-4 w-4" style={{ color: "#ffffff" }} />
              </div>
              <span className="sidebar-logo">BdeshShop</span>
            </Link>
            {sidebarCollapsed && (
              <Link href="/" className="flex items-center justify-center">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                    boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                  }}
                >
                  <Store className="h-4 w-4" style={{ color: "#ffffff" }} />
                </div>
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1"
              style={{ color: "rgba(255,255,255,0.5)" }}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Store Selector */}
          {stores.length > 0 && (
            <div
              className={`p-3 ${sidebarCollapsed ? "px-2" : ""}`}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="relative">
                <button
                  onClick={() => {
                    if (sidebarCollapsed) setSidebarCollapsed(false);
                    setStoreDropdownOpen(!storeDropdownOpen);
                  }}
                  aria-expanded={storeDropdownOpen}
                  aria-haspopup="true"
                  className={`w-full flex items-center justify-between rounded-xl transition-all text-sm ${sidebarCollapsed ? "p-2.5 justify-center" : "px-3 py-2.5"}`}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(37,99,235,0.15)" }}
                    >
                      <Sparkles size={14} style={{ color: "#60A5FA" }} />
                    </div>
                    {!sidebarCollapsed && (
                      <div className="text-left min-w-0">
                        <span className="truncate font-medium block" style={{ color: "#F1F5F9" }}>
                          {activeStore?.name || "Select Store"}
                        </span>
                        <span className="text-[11px] block truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {activeStore?.subdomain}.bdesh.shop
                        </span>
                      </div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      size={14}
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        transition: "transform 0.3s",
                        transform: storeDropdownOpen ? "rotate(180deg)" : "none",
                      }}
                    />
                  )}
                </button>

                {storeDropdownOpen && (
                  <div className="dark-store-dropdown">
                    {stores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => {
                          setActiveStore(store);
                          setStoreDropdownOpen(false);
                        }}
                        className={`dark-store-option ${activeStore?.id === store.id ? "active" : ""}`}
                      >
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ background: "rgba(37,99,235,0.08)" }}
                        >
                          <Store size={12} style={{ color: "#2563EB" }} />
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate font-medium" style={{ color: "#1F2937" }}>
                            {store.name}
                          </span>
                          <span className="text-[11px] block truncate" style={{ color: "#6B7280" }}>
                            {store.subdomain}.bdesh.shop
                          </span>
                        </div>
                      </button>
                    ))}
                    <Link
                      href="/dashboard/new-store"
                      className="dark-store-option"
                      style={{ borderTop: "1px solid #E5E7EB", marginTop: "4px", color: "#6B7280" }}
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
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 dark-scrollbar" aria-label="Dashboard navigation">
            {navSections.map((section) => {
              const isCollapsed = collapsedSections[section.label];
              const hasActiveItem = section.items.some(
                (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
              );

              return (
                <div key={section.label}>
                  {!sidebarCollapsed && (
                    <button
                      onClick={() => toggleSection(section.label)}
                      className="w-full flex items-center justify-between px-3 mb-1 mt-3 first:mt-0 group cursor-pointer"
                    >
                      <p
                        className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${hasActiveItem ? "" : ""}`}
                        style={{ color: hasActiveItem ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)" }}
                      >
                        {section.label}
                      </p>
                      <ChevronDown
                        size={12}
                        style={{
                          color: "rgba(255,255,255,0.3)",
                          transition: "transform 0.3s",
                          transform: isCollapsed ? "rotate(-90deg)" : "none",
                        }}
                      />
                    </button>
                  )}
                  {!isCollapsed && (
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            title={sidebarCollapsed ? item.label : undefined}
                            className={`sidebar-item ${isActive ? "active" : ""}`}
                          >
                            <item.icon
                              size={18}
                              className="sidebar-icon"
                              style={{ color: isActive ? "#60A5FA" : "rgba(255,255,255,0.45)" }}
                            />
                            {!sidebarCollapsed && (
                              <>
                                <span className="flex-1">{item.label}</span>
                                {item.badge && item.badge > 0 && (
                                  <span
                                    className="px-2 py-0.5 rounded-full"
                                    style={{
                                      background: "rgba(251,146,60,0.15)",
                                      color: "#FB923C",
                                      fontSize: "11px",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                                {isActive && (
                                  <div
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      background: "#2563EB",
                                      boxShadow: "0 0 8px rgba(37,99,235,0.5)",
                                    }}
                                  />
                                )}
                              </>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {activeStore && (
              <a
                href={`/store?subdomain=${activeStore.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 rounded-xl text-sm transition-all ${sidebarCollapsed ? "px-2.5 py-2.5 justify-center" : "px-3 py-2"}`}
                style={{ color: "rgba(255,255,255,0.45)" }}
                title={sidebarCollapsed ? "View Store" : undefined}
              >
                <ExternalLink size={16} />
                {!sidebarCollapsed && <span>View Store</span>}
              </a>
            )}

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 rounded-xl text-sm transition-all ${sidebarCollapsed ? "px-2.5 py-2.5 justify-center" : "px-3 py-2"}`}
                style={{ color: "#FB923C" }}
                title={sidebarCollapsed ? "Admin Panel" : undefined}
              >
                <Shield size={16} />
                {!sidebarCollapsed && <span>Admin Panel</span>}
              </Link>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-expanded={!sidebarCollapsed}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`flex items-center gap-2 rounded-xl text-sm transition-all w-full ${sidebarCollapsed ? "px-2.5 py-2.5 justify-center" : "px-3 py-2"}`}
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <Keyboard size={16} />
              {!sidebarCollapsed && <span>Collapse</span>}
            </button>

            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center py-2" : "px-3 py-2"}`}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm"
                style={{
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  color: "#ffffff",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#F1F5F9" }}>
                    {user.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {user.email}
                  </p>
                </div>
              )}
              {!sidebarCollapsed && (
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg transition-all"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                  title="Logout"
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-64"}`}>
        {/* Top Header Bar */}
        <header
          className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-8 gap-4"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px) saturate(180%)",
            borderBottom: "1px solid #E5E7EB",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
          role="banner"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2"
              style={{ color: "#6B7280" }}
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>

            <div className={`relative flex-1 transition-all ${searchFocused ? "max-w-lg" : "max-w-md"}`}>
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
              <input
                type="search"
                placeholder="Search orders, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label="Search orders and products"
                className="dark-search"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9CA3AF" }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="dark-icon-btn"
              aria-label={`Notifications${pendingOrderCount > 0 ? ` - ${pendingOrderCount} pending orders` : ""}`}
            >
              <Bell size={18} />
              {pendingOrderCount > 0 && <span className="dark-notification-dot" />}
            </button>

            {activeStore && (
              <a
                href={`/store?subdomain=${activeStore.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-2 rounded-xl"
                style={{ color: "#2563EB" }}
              >
                <ExternalLink size={14} />
                View Store
              </a>
            )}

            <Link
              href="/dashboard/new-store"
              className="dark-btn-primary"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">New Store</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                aria-label="User menu"
                className="flex items-center gap-2 p-1.5 rounded-xl transition-all"
                style={{ color: "#6B7280" }}
              >
                <div className="dark-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <ChevronDown
                  size={14}
                  style={{ transition: "transform 0.3s", transform: userDropdownOpen ? "rotate(180deg)" : "none" }}
                />
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                  <div className="dark-dropdown">
                    <div className="px-4 py-3" style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <p className="text-sm font-semibold" style={{ color: "#1F2937" }}>{user.name}</p>
                      <p className="text-xs" style={{ color: "#6B7280" }}>{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="dark-dropdown-item"
                      >
                        <Settings size={15} style={{ color: "#6B7280" }} />
                        Settings
                      </Link>
                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="dark-dropdown-item"
                          style={{ color: "#FB923C" }}
                        >
                          <Shield size={15} style={{ color: "#FB923C" }} />
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="dark-dropdown-divider"></div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="dark-dropdown-item"
                      style={{ color: "#EF4444" }}
                    >
                      <LogOut size={15} />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main id="main-content" className="dark-main" role="main">
          {children}
        </main>
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
