import { NextRequest, NextResponse } from "next/server";
import { getSocialAccountsByStoreId, createSocialAccount, socialAccounts, SocialPlatform } from "@/lib/data-store";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const accounts = getSocialAccountsByStoreId(storeId);
    return NextResponse.json({ success: true, accounts });
  } catch (error) {
    console.error("Get social accounts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    const { platform, accessToken, pageId, pageName, autoPost } = body as {
      platform: SocialPlatform;
      accessToken?: string;
      pageId?: string;
      pageName?: string;
      autoPost?: boolean;
    };

    if (!platform) {
      return NextResponse.json({ error: "Platform is required" }, { status: 400 });
    }

    const account = createSocialAccount(storeId, {
      platform,
      accessToken,
      pageId,
      pageName,
      autoPost: autoPost ?? false,
      connected: true,
    });

    return NextResponse.json({ success: true, account }, { status: 201 });
  } catch (error) {
    console.error("Create social account error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    const { accountId, autoPost, accessToken, pageId, pageName, connected } = body;

    const account = socialAccounts.get(accountId);
    if (!account || account.storeId !== storeId) {
      return NextResponse.json({ error: "Social account not found" }, { status: 404 });
    }

    if (autoPost !== undefined) account.autoPost = autoPost;
    if (accessToken !== undefined) account.accessToken = accessToken;
    if (pageId !== undefined) account.pageId = pageId;
    if (pageName !== undefined) account.pageName = pageName;
    if (connected !== undefined) account.connected = connected;

    socialAccounts.set(accountId, account);
    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error("Update social account error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}