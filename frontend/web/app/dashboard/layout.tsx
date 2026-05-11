"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Store, LayoutDashboard, ShoppingBag, Settings,
  BarChart3, Bell, LogOut, ChevronRight, Menu, X,
  Package, Heart, FileText, HelpCircle, ShieldAlert
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: ShoppingBag },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [store, setStore] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <span className="font-bold text-xl text-gray-900">BdeshShop</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
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
          <div className="p-6">
            {/* Store Info */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Your Store</p>
              <div className="flex items-center gap-2">
                <Store size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-900">{store?.name || "Loading..."}</span>
              </div>
              {store && (
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

            {/* Main Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#1d4ed8] text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions */}
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

            {/* Admin Link (only for admins) */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              {user && (user as any).role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-sm text-[#1d4ed8] hover:text-[#1e40af] font-medium mb-2"
                >
                  <ShieldAlert size={14} /> Admin Dashboard
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