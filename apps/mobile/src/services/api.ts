const API_BASE = "https://bdesh.shop/api";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers, signal: controller.signal });

    if (res.status === 401) {
      // Token expired — clear auth state
      setAuthToken(null);
      throw new ApiError("Session expired. Please log in again.", 401, "SESSION_EXPIRED");
    }

    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After") || "60";
      throw new ApiError(`Too many requests. Try again in ${retryAfter}s.`, 429, "RATE_LIMITED");
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(data.message || data.error || "Request failed", res.status, data.code);
    }

    return res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if ((err as any).name === "AbortError") {
      throw new ApiError("Request timed out. Please check your connection.", 0, "TIMEOUT");
    }
    throw new ApiError("Network error. Please check your connection.", 0, "NETWORK_ERROR");
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: any; token: string }>("/auth/mobile-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (data: { name: string; email: string; phone: string; password: string }) =>
      request<{ user: any; token: string }>("/auth/mobile-register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<{ user: any }>("/auth/mobile-me"),
  },
  stores: {
    list: () => request<{ stores: any[] }>("/stores"),
    get: (id: string) => request<{ store: any }>(`/stores/${id}`),
    update: (id: string, data: any) =>
      request<{ store: any }>(`/stores/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },
  products: {
    list: (storeId: string, params?: { status?: string; q?: string; page?: number; limit?: number }) => {
      const qs = new URLSearchParams(params as any).toString();
      return request<{ products: any[]; total?: number }>(`/${storeId}/products${qs ? `?${qs}` : ""}`);
    },
    get: (storeId: string, productId: string) =>
      request<{ product: any }>(`/${storeId}/products/${productId}`),
    create: (storeId: string, data: any) =>
      request<{ product: any }>(`/${storeId}/products`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (storeId: string, productId: string, data: any) =>
      request<{ product: any }>(`/${storeId}/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (storeId: string, productId: string) =>
      request(`/${storeId}/products/${productId}`, { method: "DELETE" }),
  },
  orders: {
    list: (storeId: string, params?: { status?: string; page?: number; limit?: number }) => {
      const qs = params ? new URLSearchParams(params as any).toString() : "";
      return request<{ orders: any[]; total?: number }>(`/${storeId}/orders${qs ? `?${qs}` : ""}`);
    },
    get: (storeId: string, orderId: string) =>
      request<{ order: any }>(`/${storeId}/orders/${orderId}`),
    updateStatus: (storeId: string, orderId: string, status: string, note?: string) =>
      request<{ order: any }>(`/${storeId}/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      }),
    getStats: (storeId: string) =>
      request<{ pending: number; processing: number; shipped: number; delivered: number; totalRevenue: number }>(`/${storeId}/orders/stats`),
  },
  analytics: {
    get: (storeId: string, days = 30) =>
      request<{ analytics: any[]; summary?: any; trends?: any }>(`/analytics?storeId=${storeId}&days=${days}`),
  },
  ai: {
    chat: (messages: { role: string; content: string }[], lang = "en") =>
      request<{ content: string }>("/ai/chat", {
        method: "POST",
        headers: { "x-lang": lang } as any,
        body: JSON.stringify({ messages }),
      }),
    generateFromImage: (data: { imageBase64?: string; businessName?: string; businessType?: string }) =>
      request<{ analysis: any; templateConfig: any; previewColors: string[]; marketingTips: string[] }>(
        "/ai/generate-from-image",
        { method: "POST", body: JSON.stringify(data) }
      ),
  },
  storefront: {
    login: (email: string, password: string) =>
      request<{ user: any; token: string }>("/storefront/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    products: (storeId: string) =>
      request<{ products: any[] }>(`/store/${storeId}/products`),
    orders: () => request<{ orders: any[] }>("/storefront/orders"),
    createOrder: (data: any) =>
      request<{ order: any }>("/storefront/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  notifications: {
    registerToken: (token: string, platform: "ios" | "android") =>
      request<{ ok: boolean }>("/notifications/register", {
        method: "POST",
        body: JSON.stringify({ token, platform }),
      }),
    getSettings: () =>
      request<{ orderUpdates: boolean; marketing: boolean; lowStock: boolean }>("notifications/settings"),
    updateSettings: (settings: { orderUpdates?: boolean; marketing?: boolean; lowStock?: boolean }) =>
      request<{ ok: boolean }>("/notifications/settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      }),
  },
};

export { ApiError };
