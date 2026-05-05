"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
}

interface AdminStats {
  totalUsers: number;
  totalStores: number;
  totalOrders: number;
  totalProducts: number;
  totalTemplates: number;
  totalRevenue: number;
  recentUsers: number;
  recentOrders: number;
}

interface AdminContextType {
  user: AdminUser | null;
  stats: AdminStats | null;
  loading: boolean;
  refreshStats: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
  user: null,
  stats: null,
  loading: true,
  refreshStats: async () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.user?.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }
        setUser(data.user);
        // Fetch stats separately — don't block loading on it
        fetchStats();
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Stats fetch failed — admin page will show fallback
    }
  };

  return (
    <AdminContext.Provider value={{ user, stats, loading, refreshStats: fetchStats }}>
      {children}
    </AdminContext.Provider>
  );
}
