"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Store,
  LayoutDashboard,
  ShoppingBag,
  Settings,
  Package,
  FileText,
  Palette,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/templates", label: "Templates", icon: Palette },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    try {
      const user = JSON.parse(userData);
      if (user.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      router.push("/login");
    } finally {
      setChecking(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("storeId");
    window.location.href = "/";
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1d4ed8]/30 border-t-[#1d4ed8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-6">
            You do not have permission to view this page. Admin access is required to manage templates and the platform.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Log out
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              <Link href="/admin" className="flex items-center gap-2 ml-2">
                <div className="w-8 h-8 bg-[#1d4ed8] rounded-lg flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">BdeshShop Admin</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="text-sm text-gray-500 hover:text-[#1d4ed8]"
              >
                View Store
              </Link>
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

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Quick Links
              </p>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-2"
              >
                <ChevronRight size={14} /> User Dashboard
              </Link>
              <Link
                href="/templates"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
              >
                <ChevronRight size={14} /> Template Gallery
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
