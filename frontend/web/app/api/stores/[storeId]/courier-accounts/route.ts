import { NextRequest, NextResponse } from "next/server";
import {
  getCourierAccountsByStoreId,
  createCourierAccount,
  courierAccounts,
  CourierProvider,
} from "@/lib/data-store";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const accounts = getCourierAccountsByStoreId(storeId);
    return NextResponse.json({ success: true, accounts });
  } catch (error) {
    console.error("Get courier accounts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    const { provider, apiKey, apiSecret, storeId_, merchantName, isDefault } = body as {
      provider: CourierProvider;
      apiKey?: string;
      apiSecret?: string;
      storeId_?: string;
      merchantName?: string;
      isDefault?: boolean;
    };

    if (!provider) {
      return NextResponse.json({ error: "Courier provider is required" }, { status: 400 });
    }

    const existing = getCourierAccountsByStoreId(storeId);
    const hasThisProvider = existing.some((a) => a.provider === provider && a.active);

    if (isDefault) {
      existing.forEach((a) => {
        if (a.provider === provider) a.isDefault = false;
      });
    }

    const account = createCourierAccount(storeId, {
      provider,
      apiKey,
      apiSecret,
      storeId_,
      merchantName,
      isDefault: isDefault ?? !hasThisProvider,
    });

    return NextResponse.json({ success: true, account }, { status: 201 });
  } catch (error) {
    console.error("Create courier account error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    const { accountId, active, isDefault, apiKey, apiSecret, merchantName } = body;

    const account = courierAccounts.get(accountId);
    if (!account || account.storeId !== storeId) {
      return NextResponse.json({ error: "Courier account not found" }, { status: 404 });
    }

    if (active !== undefined) account.active = active;
    if (isDefault !== undefined) account.isDefault = isDefault;
    if (apiKey !== undefined) account.apiKey = apiKey;
    if (apiSecret !== undefined) account.apiSecret = apiSecret;
    if (merchantName !== undefined) account.merchantName = merchantName;

    courierAccounts.set(accountId, account);
    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error("Update courier account error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}