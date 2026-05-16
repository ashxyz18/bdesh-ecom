import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ templateId: string; path: string[] }>;
}

const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3000";

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { templateId, path } = await params;
  const searchParams = request.nextUrl.searchParams;

  if (templateId === "nike") {
    return handleNikeGet(request, path, searchParams);
  }

  return NextResponse.json({ error: "Template not found" }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const { templateId, path } = await params;

  if (templateId === "nike") {
    return handleNikePost(request, path);
  }

  return NextResponse.json({ error: "Template not found" }, { status: 404 });
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { templateId, path } = await params;

  if (templateId === "nike") {
    return handleNikePut(request, path);
  }

  return NextResponse.json({ error: "Template not found" }, { status: 404 });
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { templateId, path } = await params;

  if (templateId === "nike") {
    return handleNikeDelete(request, path);
  }

  return NextResponse.json({ error: "Template not found" }, { status: 404 });
}

async function handleNikeGet(
  request: NextRequest,
  path: string[],
  searchParams: URLSearchParams
) {
  const storeId = searchParams.get("storeId") || searchParams.get("store_id");
  const platformUrl = `${PLATFORM_URL}/api`;

  const pathStr = path.join("/");

  if (pathStr === "products") {
    try {
      const url = `${platformUrl}/products?storeId=${storeId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.products) {
        const nikeProducts = data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          comparePrice: p.comparePrice,
          images: p.images && p.images.length > 0 ? p.images : ["https://via.placeholder.com/300"],
          stock: p.stock || 0,
          status: p.status,
          slug: p.slug,
        }));

        return NextResponse.json({ products: nikeProducts });
      }

      return NextResponse.json(data);
    } catch (error) {
      console.error("Nike products proxy error:", error);
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
  }

  if (pathStr.match(/^products\//)) {
    const productId = pathStr.split("/")[1];
    try {
      const url = `${platformUrl}/products?storeId=${storeId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.products) {
        const product = data.products.find((p: any) => p.id === productId);
        if (product) {
          return NextResponse.json({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            comparePrice: product.comparePrice,
            images: product.images && product.images.length > 0 ? product.images : ["https://via.placeholder.com/300"],
            stock: product.stock || 0,
            status: product.status,
            slug: product.slug,
          });
        }
      }

      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    } catch (error) {
      console.error("Nike product proxy error:", error);
      return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
  }

  if (pathStr === "cart") {
    return NextResponse.json({ items: [] });
  }

  if (pathStr === "orders") {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const url = `${platformUrl}/stores/${storeId}/orders`;
      const response = await fetch(url, {
        headers: { "x-user-id": userId },
      });
      const data = await response.json();

      return NextResponse.json(data);
    } catch (error) {
      console.error("Nike orders proxy error:", error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
  }

  if (pathStr === "auth/me") {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
      const url = `${platformUrl}/auth/me`;
      const response = await fetch(url, {
        headers: { "x-user-id": userId },
      });
      const data = await response.json();

      return NextResponse.json({
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name: data.user?.name,
        },
      });
    } catch (error) {
      console.error("Nike auth/me proxy error:", error);
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
}

async function handleNikePost(
  request: NextRequest,
  path: string[]
) {
  const body = await request.json();
  const searchParams = request.nextUrl.searchParams;
  const storeId = searchParams.get("storeId") || searchParams.get("store_id");
  const platformUrl = `${PLATFORM_URL}/api`;

  const pathStr = path.join("/");

  if (pathStr === "auth/login") {
    try {
      const response = await fetch(`${platformUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: body.email, password: body.password }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = generateFakeJWT(data.user?.id, data.user?.email);
        return NextResponse.json({
          token,
          user: data.user,
          store: data.store,
        });
      }

      return NextResponse.json({ message: data.error || "Login failed" }, { status: response.status });
    } catch (error) {
      console.error("Nike login proxy error:", error);
      return NextResponse.json({ message: "Login failed" }, { status: 500 });
    }
  }

  if (pathStr === "auth/register") {
    try {
      const response = await fetch(`${platformUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        const token = generateFakeJWT(data.user?.id, data.user?.email);
        return NextResponse.json({
          token,
          user: data.user,
        });
      }

      return NextResponse.json({ message: data.error || "Registration failed" }, { status: response.status });
    } catch (error) {
      console.error("Nike register proxy error:", error);
      return NextResponse.json({ message: "Registration failed" }, { status: 500 });
    }
  }

  if (pathStr === "orders") {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const response = await fetch(`${platformUrl}/stores/${storeId}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        return NextResponse.json({
          id: data.order?.id || data.id,
          orderNumber: data.order?.orderNumber || `ORD-${Date.now()}`,
          status: "pending",
          total: body.total || body.cartTotal,
        });
      }

      return NextResponse.json({ error: data.error || "Order failed" }, { status: response.status });
    } catch (error) {
      console.error("Nike order proxy error:", error);
      return NextResponse.json({ error: "Order failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
}

async function handleNikePut(
  request: NextRequest,
  path: string[]
) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

async function handleNikeDelete(
  request: NextRequest,
  path: string[]
) {
  const searchParams = request.nextUrl.searchParams;
  const storeId = searchParams.get("storeId") || searchParams.get("store_id");
  const platformUrl = `${PLATFORM_URL}/api`;

  const pathStr = path.join("/");

  if (pathStr === "cart") {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const response = await fetch(`${platformUrl}/stores/${storeId}/cart`, {
        method: "DELETE",
        headers: { "x-user-id": userId },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Nike cart delete proxy error:", error);
      return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
}

function getUserIdFromRequest(request: NextRequest): string | null {
  return request.headers.get("x-user-id");
}

function generateFakeJWT(userId: string | null, email: string | null): string {
  if (!userId) return "";

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  })).toString("base64url");
  const signature = Buffer.from(`fake-signature-${userId}`).toString("base64url");

  return `${header}.${payload}.${signature}`;
}