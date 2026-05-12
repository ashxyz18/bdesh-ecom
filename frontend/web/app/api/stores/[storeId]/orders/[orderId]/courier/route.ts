import { NextRequest, NextResponse } from "next/server";
import { prisma, getOrderById, serializeOrder } from "@/lib/db";

interface RouteParams {
  params: Promise<{ storeId: string; orderId: string }>;
}

type CourierProvider = "pathao" | "redx" | "steadfast" | "paperfly";

interface CourierAccount {
  id: string;
  storeId: string;
  provider: string;
  apiKey?: string | null;
  apiSecret?: string | null;
  storeId_?: string | null;
  merchantName?: string | null;
  isDefault: boolean;
  active: boolean;
}

const COURIER_APIS: Record<CourierProvider, {
  book: (account: CourierAccount, order: Record<string, unknown>) => Promise<{ trackingId: string; trackingUrl: string }>;
  track: (account: CourierAccount, trackingId: string) => Promise<string>;
  getCities: (account: CourierAccount) => Promise<string[]>;
}> = {
  pathao: {
    async book(account) {
      if (!account.apiKey) throw new Error("Pathao API key not configured");
      const response = await fetch("https://api.pathao.com/v2/courier/order", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${account.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store_id: parseInt(account.storeId_ || "0"),
          cod_amount: 0,
          recipient_name: "",
          recipient_phone: "",
          recipient_address: "",
          item_quantity: 1,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Pathao booking failed");
      return {
        trackingId: data.data.order_id.toString(),
        trackingUrl: `https://tracking.pathao.com/order/${data.data.order_id}`,
      };
    },
    async track(account, trackingId) {
      if (!account.apiKey) throw new Error("Pathao API key not configured");
      const response = await fetch(`https://api.pathao.com/v2/courier/order/${trackingId}/status`, {
        headers: { "Authorization": `Bearer ${account.apiKey}` },
      });
      const data = await response.json();
      return data.data?.status || "Unknown";
    },
    async getCities(account) {
      if (!account.apiKey) return [];
      const response = await fetch("https://api.pathao.com/v2/city", {
        headers: { "Authorization": `Bearer ${account.apiKey}` },
      });
      const data = await response.json();
      return data.data?.map((c: { city_name: string }) => c.city_name) || [];
    },
  },
  redx: {
    async book(account) {
      if (!account.apiKey) throw new Error("RedX API key not configured");
      const response = await fetch("https://openapi.redx.com.bd/v1.0.0/create-parcel", {
        method: "POST",
        headers: { "API-KEY": account.apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_name: "",
          recipient_phone: "",
          recipient_address: "",
          cod_amount: 0,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "RedX booking failed");
      return {
        trackingId: data.parcel_id || data.tracking_id,
        trackingUrl: `https://www.redx.com.bd/track?parcel=${data.parcel_id || data.tracking_id}`,
      };
    },
    async track(account, trackingId) {
      if (!account.apiKey) throw new Error("RedX API key not configured");
      const response = await fetch(`https://openapi.redx.com.bd/v1.0.0/get-parcel-status?parcel_id=${trackingId}`, {
        headers: { "API-KEY": account.apiKey },
      });
      const data = await response.json();
      return data.status || "Unknown";
    },
    async getCities() {
      return ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Comilla", "Gazipur", "Mymensingh"];
    },
  },
  steadfast: {
    async book(account) {
      if (!account.apiKey) throw new Error("SteadFast API key not configured");
      const response = await fetch("https://api.steadfastcourier.com/api/v1/create_order", {
        method: "POST",
        headers: { "API-KEY": account.apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: account.apiKey,
          merchant_id: account.storeId_,
          recipient_name: "",
          recipient_phone: "",
          recipient_address: "",
          cod: 0,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return {
        trackingId: data.consignment || data.tracking_id,
        trackingUrl: `https://www.steadfastcourier.com/track?consignment=${data.consignment || data.tracking_id}`,
      };
    },
    async track(account, trackingId) {
      if (!account.apiKey) throw new Error("SteadFast API key not configured");
      const response = await fetch(`https://api.steadfastcourier.com/api/v1/status/${trackingId}`, {
        headers: { "API-KEY": account.apiKey },
      });
      const data = await response.json();
      return data.delivery_status || "Unknown";
    },
    async getCities() {
      return ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Comilla", "Gazipur"];
    },
  },
  paperfly: {
    async book(account) {
      if (!account.apiKey) throw new Error("Paperfly API key not configured");
      const response = await fetch("https://paperfly-api.paperflybd.com/api/v1/courier/create", {
        method: "POST",
        headers: { "Authorization": `Bearer ${account.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantInvoice: "",
          recipientName: "",
          recipientPhone: "",
          recipientAddress: "",
          codAmount: 0,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "Paperfly booking failed");
      return {
        trackingId: data.parcel_id || data.tracking_id,
        trackingUrl: `https://paperflybd.com/track/${data.parcel_id || data.tracking_id}`,
      };
    },
    async track(account, trackingId) {
      if (!account.apiKey) throw new Error("Paperfly API key not configured");
      const response = await fetch(`https://paperfly-api.paperflybd.com/api/v1/courier/status?parcel_id=${trackingId}`, {
        headers: { "Authorization": `Bearer ${account.apiKey}` },
      });
      const data = await response.json();
      return data.status || "Unknown";
    },
    async getCities() {
      return ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Comilla", "Gazipur"];
    },
  },
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await request.json();
    const { courierProvider } = body as { courierProvider: CourierProvider };

    return NextResponse.json(
      { error: `Courier integration requires CourierAccount table migration. Provider: ${courierProvider}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Courier booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
