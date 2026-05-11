import { NextRequest, NextResponse } from "next/server";
import { orders, getCourierAccountsByStoreId, CourierAccount, CourierProvider, CourierDeliveryRequest, OrderStatus } from "@/lib/data-store";

interface RouteParams {
  params: Promise<{ storeId: string; orderId: string }>;
}

const COURIER_APIS: Record<CourierProvider, {
  book: (account: CourierAccount, order: any) => Promise<{ trackingId: string; trackingUrl: string }>;
  track: (account: CourierAccount, trackingId: string) => Promise<string>;
  getCities: (account: CourierAccount) => Promise<string[]>;
}> = {
  pathao: {
    async book(account, order) {
      if (!account.apiKey) throw new Error("Pathao API key not configured");
      const response = await fetch("https://api.pathao.com/v2/courier/order", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${account.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store_id: parseInt(account.storeId_ || "0"),
          cod_amount: order.total,
          recipient_name: order.shippingAddress.name,
          recipient_phone: order.shippingAddress.phone,
          recipient_address: `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}`,
          item_quantity: order.items.length,
          special_instruction: order.notes || "",
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
    async book(account, order) {
      if (!account.apiKey) throw new Error("RedX API key not configured");
      const response = await fetch("https://openapi.redx.com.bd/v1.0.0/create-parcel", {
        method: "POST",
        headers: {
          "API-KEY": account.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_name: order.shippingAddress.name,
          recipient_phone: order.shippingAddress.phone,
          recipient_address: `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}`,
          cod_amount: order.total,
          note: order.notes || "",
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
    async book(account, order) {
      if (!account.apiKey) throw new Error("SteadFast API key not configured");
      const response = await fetch("https://api.steadfastcourier.com/api/v1/create_order", {
        method: "POST",
        headers: {
          "API-KEY": account.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: account.apiKey,
          merchant_id: account.storeId_,
          recipient_name: order.shippingAddress.name,
          recipient_phone: order.shippingAddress.phone,
          recipient_address: `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}`,
          cod: order.total,
          note: order.notes || "",
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
    async book(account, order) {
      if (!account.apiKey) throw new Error("Paperfly API key not configured");
      const response = await fetch("https://paperfly-api.paperflybd.com/api/v1/courier/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${account.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchantInvoice: order.orderNumber,
          recipientName: order.shippingAddress.name,
          recipientPhone: order.shippingAddress.phone,
          recipientAddress: `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}`,
          codAmount: order.total,
          note: order.notes || "",
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
    const order = orders.get(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await request.json();
    const { courierProvider } = body as { courierProvider: CourierProvider };

    const accounts = getCourierAccountsByStoreId(order.storeId);
    const account = accounts.find((a) => a.provider === courierProvider && a.active);

    if (!account) {
      return NextResponse.json(
        { error: `${courierProvider} account not configured. Please add API credentials in Courier Settings.` },
        { status: 400 }
      );
    }

    const courierApi = COURIER_APIS[courierProvider];
    if (!courierApi) {
      return NextResponse.json({ error: "Unknown courier provider" }, { status: 400 });
    }

    try {
      const { trackingId, trackingUrl } = await courierApi.book(account, order);

      order.courier = courierProvider;
      order.trackingId = trackingId;
      order.trackingUrl = trackingUrl;
      order.status = OrderStatus.Confirmed;
      order.updatedAt = new Date();

      return NextResponse.json({
        success: true,
        order,
        trackingId,
        trackingUrl,
        message: `Order booked with ${courierProvider}. Tracking ID: ${trackingId}`,
      });
    } catch (courierError: any) {
      return NextResponse.json(
        { error: `Courier booking failed: ${courierError.message}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Courier booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}