"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
}

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  theme?: string | Record<string, unknown> | null;
}

interface DashboardContextType {
  user: User | null;
  stores: StoreData[];
  activeStore: StoreData | null;
  setActiveStore: (store: StoreData) => void;
  loading: boolean;
  refreshStores: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType>({
  user: null,
  stores: [],
  activeStore: null,
  setActiveStore: () => {},
  loading: true,
  refreshStores: async () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [activeStore, setActiveStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStores = useCallback(async (currentUser?: User | null) => {
    try {
      const storesRes = await fetch("/api/stores");
      if (storesRes.ok) {
        const storesData = await storesRes.json();
        const storeList: StoreData[] = storesData.stores || [];
        setStores(storeList);
        if (storeList.length > 0) {
          setActiveStore((prev) => {
            // Keep current active store if it still exists, otherwise use first
            const stillExists = prev && storeList.find((s) => s.id === prev.id);
            return stillExists ? prev : storeList[0];
          });
        } else {
          setActiveStore(null);
        }
      }
    } catch {
      // Ignore fetch errors
    }
  }, []);

  const refreshStores = useCallback(async () => {
    await fetchStores(user);
  }, [fetchStores, user]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();

        // Redirect ADMIN users to the admin dashboard
        if (data.user?.role === "ADMIN") {
          router.push("/admin");
          return;
        }

        setUser(data.user);
        await fetchStores(data.user);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router, fetchStores]);

  return (
    <DashboardContext.Provider value={{ user, stores, activeStore, setActiveStore, loading, refreshStores }}>
      {children}
    </DashboardContext.Provider>
  );
}
