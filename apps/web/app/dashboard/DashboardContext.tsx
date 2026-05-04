"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
}

interface DashboardContextType {
  user: User | null;
  stores: StoreData[];
  activeStore: StoreData | null;
  setActiveStore: (store: StoreData) => void;
  loading: boolean;
}

const DashboardContext = createContext<DashboardContextType>({
  user: null,
  stores: [],
  activeStore: null,
  setActiveStore: () => {},
  loading: true,
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

        const storesRes = await fetch("/api/stores");
        if (storesRes.ok) {
          const storesData = await storesRes.json();
          setStores(storesData.stores || []);
          if (storesData.stores?.length > 0) {
            setActiveStore(storesData.stores[0]);
          }
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  return (
    <DashboardContext.Provider value={{ user, stores, activeStore, setActiveStore, loading }}>
      {children}
    </DashboardContext.Provider>
  );
}
