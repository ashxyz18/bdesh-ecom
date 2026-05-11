import { NextRequest, NextResponse } from "next/server";
import { getSocialAccountsByStoreId } from "@/lib/data-store";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

const PLATFORM_APIS: Record<string, (token: string, pageId: string, content: string, imageUrl?: string) => Promise<string>> = {
  facebook: async (token, pageId, content, imageUrl) => {
    const endpoint = imageUrl
      ? `https://graph.facebook.com/v18.0/${pageId}/photos`
      : `https://graph.facebook.com/v18.0/${pageId}/feed`;

    const body: Record<string, string> = { message: content };
    if (imageUrl) body.url = imageUrl;

    const response = await fetch(`${endpoint}?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.id;
  },
  instagram: async (token, pageId, content, imageUrl) => {
    if (!imageUrl) throw new Error("Instagram posts require an image");
    const containerResponse = await fetch(`https://graph.facebook.com/v18.0/${pageId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caption: content,
        image_url: imageUrl,
        access_token: token,
      }),
    });
    const container = await containerResponse.json();
    if (container.error) throw new Error(container.error.message);

    const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${pageId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: token,
      }),
    });
    const published = await publishResponse.json();
    if (published.error) throw new Error(published.error.message);
    return published.id;
  },
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = await params;
    const body = await request.json();
    const { platform, content, imageUrl, productId } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const accounts = getSocialAccountsByStoreId(storeId);
    const account = accounts.find((a) => a.platform === platform && a.connected && a.accessToken && a.pageId);

    if (!account) {
      return NextResponse.json(
        { error: `${platform} account not connected or not configured for auto-posting.` },
        { status: 400 }
      );
    }

    const apiFn = PLATFORM_APIS[platform];
    if (!apiFn) {
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
    }

    try {
      const postId = await apiFn(account.accessToken!, account.pageId!, content, imageUrl);

      return NextResponse.json({
        success: true,
        postId,
        message: `Posted to ${platform} successfully`,
      });
    } catch (postError: any) {
      return NextResponse.json(
        { error: `${platform} posting failed: ${postError.message}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Social post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}