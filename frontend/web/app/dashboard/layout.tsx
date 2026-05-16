"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Store, LayoutDashboard, ShoppingBag, Settings, Palette,
  BarChart3, Bell, LogOut, ChevronRight, Menu, X,
  Package, HelpCircle, ShieldAlert, Truck, Users,
  Megaphone, Tag, UploadCloud, Search, CreditCard, Inbox,
  Plug, History, Globe2, Facebook, Instagram
} from "lucide-react";
import { useState, useEffect } from "react";
import type { DashboardConfig } from "@/lib/templates/manifest";

const navItemsById = {
  overview: { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  products: { href: "/dashboard/products", label: "Products", icon: ShoppingBag },
  orders: { href: "/dashboard/orders", label: "Orders", icon: Package },
  customers: { href: "/dashboard/customers", label: "Customers", icon: Users },
  coupons: { href: "/dashboard/coupons", label: "Coupons", icon: Tag },
  marketing: { href: "/dashboard/marketing", label: "Marketing", icon: Megaphone },
  analytics: { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  couriers: { href: "/dashboard/couriers", label: "Couriers", icon: Truck },
  customize: { href: "/dashboard/customize", label: "Customize", icon: Palette },
  settings: { href: "/dashboard/settings", label: "Settings", icon: Settings },
  upload: { href: "/dashboard/upload-template", label: "Upload Template", icon: UploadCloud },
} as const;

const defaultNavigation = [
  "overview",
  "products",
  "orders",
  "customers",
  "coupons",
  "marketing",
  "analytics",
  "couriers",
  "customize",
  "settings",
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [store, setStore] = useState<{ id: string; name: string; templateId?: string } | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);

    const userData = localStorage.getItem("user");
    const storeId = localStorage.getItem("storeId");

    if (userData) {
      setUser(JSON.parse(userData));
    }

    if (storeId) {
      fetch(`/api/stores/${storeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.store) {
            setStore(data.store);
            if (data.store.templateId) {
              fetch(`/api/templates/${data.store.templateId}`)
                .then((res) => res.json())
                .then((templateData) => {
                  setTemplateName(templateData.template?.name || data.store.templateId);
                  setDashboardConfig(templateData.template?.manifest?.dashboard || null);
                })
                .catch(console.error);
            }
          }
        })
        .catch(console.error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("storeId");
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navigation = (dashboardConfig?.navigation || defaultNavigation)
    .map((id) => navItemsById[id as keyof typeof navItemsById])
    .filter(Boolean);
  const primaryNavigation = navigation.filter((item) =>
    ["/dashboard", "/dashboard/orders", "/dashboard/products", "/dashboard/customers", "/dashboard/analytics"].includes(item.href)
  );
  const growthNavigation = navigation.filter((item) =>
    ["/dashboard/coupons", "/dashboard/marketing", "/dashboard/couriers", "/dashboard/customize", "/dashboard/settings"].includes(item.href)
  );
  const utilityNavigation = [
    { href: "/dashboard/upload-template", label: "Upload Template", icon: UploadCloud },
    { href: "/dashboard/settings", label: "Payments", icon: CreditCard },
    { href: "/dashboard/marketing", label: "Inbox", icon: Inbox },
    { href: "/dashboard/marketing", label: "Integrations", icon: Plug },
    { href: "/dashboard/analytics", label: "History", icon: History },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link href="/" className="flex items-center gap-2 ml-2">
                <div className="w-8 h-8 bg-[#1d4ed8] rounded-lg flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">BixelBD</span>
              </Link>
            </div>

            <div className="hidden md:flex flex-1 max-w-xl mx-8 items-center">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search dashboard, orders, products..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {store && (
                <Link
                  href={`/store/${store.id}`}
                  target="_blank"
                  className="hidden lg:inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Globe2 size={16} />
                  Live Store
                </Link>
              )}
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                {user && (
                  <>
                    <div className="w-8 h-8 bg-[#1d4ed8] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(user.name)}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">{user.name}</span>
                  </>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-gray-200 w-64 min-h-[calc(100vh-4rem)] fixed lg:static inset-y-16 left-0 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 transition-transform z-40`}
        >
          <div className="p-5">
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Your Store</p>
              <div className="flex items-center gap-2">
                <Store size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-900">{store?.name || "Loading..."}</span>
              </div>
              {hydrated && templateName && (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Active Template</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{templateName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {navigation.length} dashboard modules enabled
                  </p>
                  {dashboardConfig?.setupChecklist && dashboardConfig.setupChecklist.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {dashboardConfig.setupChecklist.slice(0, 3).map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="block text-xs text-gray-600 hover:text-[#1d4ed8] truncate"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {hydrated && store && (
                <Link
                  href={`/store/${store.id}`}
                  target="_blank"
                  className="mt-2 flex items-center gap-1 text-xs text-[#1d4ed8] hover:underline"
                >
                  <span>View live store</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              )}
            </div>

            <nav className="space-y-6">
              <NavSection title="Menu" items={primaryNavigation} pathname={pathname} close={() => setSidebarOpen(false)} />
              <NavSection title="Growth" items={growthNavigation} pathname={pathname} close={() => setSidebarOpen(false)} />
              <NavSection title="Tools" items={utilityNavigation} pathname={pathname} close={() => setSidebarOpen(false)} />

              {/* Template-provided dashboard pages */}
              {dashboardConfig?.pages && dashboardConfig.pages.filter(p => p.showInSidebar !== false && (p.templatePath || p.href)).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Plug size={10} />
                    Template Pages
                  </p>
                  {dashboardConfig.pages
                    .filter(p => p.showInSidebar !== false && (p.templatePath || p.href))
                    .map((page) => {
                      const pageHref = page.href || `/dashboard/template-pages/${page.id}`;
                      const isActive = pathname === pageHref;
                      return (
                        <Link
                          key={page.id}
                          href={pageHref}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm mb-0.5 transition-colors ${
                            isActive
                              ? "bg-purple-50 text-purple-700 font-medium"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-purple-500" : "bg-gray-300"}`} />
                          {page.label}
                        </Link>
                      );
                    })}
                </div>
              )}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Actions</p>
              <Link
                href={store ? `/store/${store.id}` : "#"}
                target="_blank"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-2"
              >
                <ChevronRight size={14} /> View Store
              </Link>
              <Link
                href="/templates"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-2"
              >
                <ChevronRight size={14} /> Browse Templates
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
              >
                <ChevronRight size={14} /> Customize Theme
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sales Channels</p>
              {[
                { label: "Online Store", href: store ? `/store/${store.id}` : "#", icon: Store, external: true },
                { label: "Facebook", href: "/dashboard/marketing", icon: Facebook },
                { label: "Instagram", href: "/dashboard/marketing", icon: Instagram },
              ].map((channel) => (
                <Link
                  key={channel.label}
                  href={channel.href}
                  target={channel.external ? "_blank" : undefined}
                  className="flex items-center justify-between gap-2 text-sm text-gray-500 hover:text-gray-900 mb-2"
                >
                  <span className="flex items-center gap-2">
                    <channel.icon size={14} /> {channel.label}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              {user && (user as any).role === "admin" && (
                <Link
                  href="/site-admin"
                  className="flex items-center gap-2 text-sm text-[#1d4ed8] hover:text-[#1e40af] font-medium mb-2"
                >
                  <ShieldAlert size={14} /> Site Admin
                </Link>
              )}
              <Link
                href="#"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
              >
                <HelpCircle size={14} /> Help & Support
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}

function NavSection({
  title,
  items,
  pathname,
  close,
}: {
  title: string;
  items: Array<{ href: string; label: string; icon: React.ElementType }>;
  pathname: string;
  close: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={`${title}-${item.href}-${item.label}`}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-[#1d4ed8] text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              onClick={close}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
