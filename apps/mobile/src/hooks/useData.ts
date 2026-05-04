import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Product, Order, AnalyticsData } from "../types";

export function useProducts(storeId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.products.list(storeId);
      setProducts(res.products);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [storeId]);

  return { products, loading, refresh: fetch };
}

export function useOrders(storeId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.orders.list(storeId);
      setOrders(res.orders);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [storeId]);

  return { orders, loading, refresh: fetch };
}

export function useAnalytics(storeId: string, days = 30) {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.analytics.get(storeId, days);
        setData(res.analytics);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [storeId, days]);

  return { data, loading };
}
