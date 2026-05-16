import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ templateId: string; path: string[] }>;
}

const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3000";

// ── Cache loaded manifests in memory (with 5-minute TTL) ──
const manifestCache = new Map<string, { manifest: any; ts: number }>();
const MANIFEST_TTL_MS = 5 * 60 * 1000;

function getTemplateDir(templateId: string): string {
  return path.join(process.cwd(), "public", "templates", templateId);
}

function loadManifest(templateId: string): any | null {
  const cached = manifestCache.get(templateId);
  if (cached && Date.now() - cached.ts < MANIFEST_TTL_MS) {
    return cached.manifest;
  }
  try {
    const manifestPath = path.join(getTemplateDir(templateId), "manifest.json");
    if (!fs.existsSync(manifestPath)) return null;
    const content = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(content);
    manifestCache.set(templateId, { manifest, ts: Date.now() });
    return manifest;
  } catch {
    return null;
  }
}

function invalidateManifest(templateId: string): void {
  manifestCache.delete(templateId);
}

// ── GET / POST / PUT / DELETE handlers ──
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { templateId, path } = await params;
  return handleTemplateGet(templateId, path, request);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { templateId, path } = await params;
  return handleTemplatePost(templateId, path, request);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { templateId, path } = await params;
  return handleTemplatePut(templateId, path, request);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { templateId, path } = await params;
  return handleTemplateDelete(templateId, path, request);
}

// ── Helpers ──
function getStoreId(request: NextRequest): string | null {
  const url = request.nextUrl;

  // 1. Check query params
  const storeId = url.searchParams.get("storeId") || url.searchParams.get("store_id");
  if (storeId && storeId !== "null" && storeId !== "undefined" && storeId !== "") return storeId;

  // 2. Check referer URL (query params and hash fragment)
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererUrl = new URL(referer);

      // Check query params on the referer
      const refStoreId = refererUrl.searchParams.get("storeId") || refererUrl.searchParams.get("store_id");
      if (refStoreId && refStoreId !== "null" && refStoreId !== "undefined") return refStoreId;

      // Check the hash fragment (e.g., /index.html#/?storeId=xxx)
      const hash = refererUrl.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.replace(/^#\/?(\?)?/, ""));
        const hashStoreId = hashParams.get("storeId") || hashParams.get("store_id");
        if (hashStoreId && hashStoreId !== "null" && hashStoreId !== "undefined") return hashStoreId;
      }
    } catch {
      // ignore malformed referer
    }
  }

  // 3. Check custom header (set by middleware or storefront)
  const headerStoreId = request.headers.get("x-store-id");
  if (headerStoreId && headerStoreId !== "null") return headerStoreId;

  return null;
}

// Fallback removed: template previews must not leak store data.
// Store context always provides storeId via the serve-route interceptor
// or the x-store-id / referer headers.
async function resolveStoreId(request: NextRequest, _templateId: string): Promise<string | null> {
  return getStoreId(request);
}

/** Extract default settings from a template manifest's configSchema */
function getManifestDefaults(manifest: any): Record<string, any> {
  const defaults: Record<string, any> = {};
  if (!manifest?.configSchema) return defaults;

  for (const [sectionKey, section] of Object.entries(manifest.configSchema) as [string, any][]) {
    const sectionDefaults: Record<string, any> = {};
    let fields: Record<string, any> = {};
    if (Array.isArray(section.fields)) {
      section.fields.forEach((f: any) => { if (f.id) fields[f.id] = f; });
    } else {
      fields = section.fields || {};
    }
    for (const [fieldKey, field] of Object.entries(fields)) {
      if (field?.default !== undefined) {
        sectionDefaults[fieldKey] = field.default;
      }
    }
    if (Object.keys(sectionDefaults).length > 0) {
      defaults[sectionKey] = sectionDefaults;
    }
  }
  return defaults;
}

function getUserIdFromRequest(request: NextRequest): string | null {
  return request.headers.get("x-user-id");
}

function buildPlatformUrl(platformPath: string, request: NextRequest, storeId: string | null): string {
  const url = new URL(`${PLATFORM_URL}/api${platformPath}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  if (storeId) url.searchParams.set("storeId", storeId);
  return url.toString();
}

// ── Data mapping ──
function getField(data: any, path: string): any {
  const keys = path.split(".");
  let result = data;
  for (const key of keys) {
    if (result === null || result === undefined) return undefined;
    // Handle array indexing like "images[0]"
    const arrayMatch = key.match(/^(.+?)\[(\d+)\]$/);
    if (arrayMatch) {
      const arr = result[arrayMatch[1]];
      const idx = parseInt(arrayMatch[2], 10);
      result = Array.isArray(arr) ? arr[idx] : undefined;
    } else {
      result = result[key];
    }
  }
  return result;
}

function mapData(platformData: any, mappings: Record<string, string>): any {
  const result: any = {};
  for (const [templateField, expression] of Object.entries(mappings)) {
    const value = getField(platformData, expression);
    if (value !== undefined) {
      result[templateField] = value;
    }
  }
  return result;
}

function applyProductMapping(product: any, mappingExpression: string): any {
  // 1. Direct top-level field
  if (product[mappingExpression] !== undefined) {
    return product[mappingExpression];
  }
  // 2. Path expression (e.g. "images[0]", "seo.title")
  const byPath = getField(product, mappingExpression);
  if (byPath !== undefined) return byPath;
  // 3. Fall back to metadata (e.g. badge, discount, originalPrice stored in metadata)
  if (product.metadata && typeof product.metadata === "object") {
    if (product.metadata[mappingExpression] !== undefined) {
      return product.metadata[mappingExpression];
    }
  }
  return undefined;
}

async function getProductMappings(templateId: string): Promise<Record<string, string>> {
  const manifest = loadManifest(templateId);
  // The platform's serializeProduct() maps DB `quantity` → `stock` in the API response,
  // so the correct source field name is "stock" (not "quantity").
  const defaultMappings: Record<string, string> = {
    id: "id",
    name: "name",
    description: "description",
    price: "price",
    comparePrice: "comparePrice",
    images: "images",
    stock: "stock",
    category: "category",
    colors: "colors",
    tags: "tags",
    metadata: "metadata",
    status: "status",
    slug: "slug",
  };

  if (!manifest?.api?.mappings?.products) {
    return defaultMappings;
  }

  return { ...defaultMappings, ...manifest.api.mappings.products };
}

function mapProductToTemplate(product: any, mappings: Record<string, string>): any {
  // Always include essential base fields so the template always gets a complete object
  const result: any = {
    id: product.id,
    name: product.name,
    price: product.price,
    comparePrice: product.comparePrice ?? null,
    images: product.images ?? [],
    image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "",
    description: product.description ?? "",
    stock: product.stock ?? 0,
    status: product.status ?? "active",
    slug: product.slug ?? "",
    category: product.category ?? "",
    colors: product.colors ?? [],
    tags: product.tags ?? [],
    metadata: product.metadata ?? {},
  };

  // Apply manifest mappings on top (these can override base fields or add template-specific ones)
  for (const [templateField, expression] of Object.entries(mappings)) {
    const value = applyProductMapping(product, expression);
    if (value !== undefined) {
      result[templateField] = value;
    }
  }
  return result;
}

// ── GET handler ──
async function handleTemplateGet(templateId: string, path: string[], request: NextRequest) {
  const storeId = await resolveStoreId(request, templateId);
  const pathStr = path.join("/");

  // Products endpoints
  if (pathStr === "products" || pathStr.startsWith("products/")) {
    // Template preview without a store: return empty catalog
    if (!storeId) {
      return NextResponse.json({ products: [] });
    }

    const segments = pathStr.split("/");

    // Single product lookup: /products/{id}
    if (segments.length === 2 && segments[0] === "products") {
      const maybeId = segments[1];
      const knownKeywords = ["category", "search", "filter", "all", "new", "featured", "popular"];
      if (!knownKeywords.includes(maybeId.toLowerCase()) && maybeId.length > 8) {
        try {
          const res = await fetch(buildPlatformUrl("/products", request, storeId));
          const data = await res.json();
          if (data.products) {
            const p = data.products.find((p: any) => p.id === maybeId || p.slug === maybeId);
            if (p) {
              const mappings = await getProductMappings(templateId);
              return NextResponse.json(mapProductToTemplate(p, mappings));
            }
          }
          return NextResponse.json({ error: "Product not found" }, { status: 404 });
        } catch (error) {
          console.error(`[Adapter ${templateId}] product lookup error:`, error);
          return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
        }
      }
    }

    // Products list (all variants: /products, /products/category/men, etc.)
    try {
      const res = await fetch(buildPlatformUrl("/products", request, storeId));
      const data = await res.json();

      if (data.products) {
        const mappings = await getProductMappings(templateId);
        return NextResponse.json({
          products: data.products.map((p: any) => mapProductToTemplate(p, mappings)),
        });
      }
      return NextResponse.json(data);
    } catch (error) {
      console.error(`[Adapter ${templateId}] products proxy error:`, error);
      return NextResponse.json({ products: [] });
    }
  }

  // Stubs
  if (pathStr === "cart") return NextResponse.json({ items: [] });
  if (pathStr === "orders") return NextResponse.json({ orders: [] });

  // Auth me — proxy to store-scoped endpoint
  if (pathStr === "auth/me") {
    if (!storeId) {
      return NextResponse.json({ user: null });
    }
    try {
      const customerId = request.headers.get("x-customer-id");
      const res = await fetch(`${PLATFORM_URL}/api/stores/${storeId}/auth/me`, {
        headers: {
          ...(customerId ? { "x-customer-id": customerId } : {}),
        },
      });
      const data = await res.json().catch(() => ({ customer: null }));
      return NextResponse.json({ user: data.customer });
    } catch {
      return NextResponse.json({ user: null });
    }
  }

   // Store settings endpoint
  if (pathStr === "settings" || pathStr === "config") {
    try {
      // If no store is targeted (e.g. template preview), return manifest defaults only
      if (!storeId) {
        const manifest = loadManifest(templateId);
        const defaults = getManifestDefaults(manifest);
        return NextResponse.json({
          ...defaults,
          settings: defaults,
          theme: manifest?.defaultTheme || {},
          storeName: manifest?.name || templateId,
          storeDescription: manifest?.description || "",
          storeLogo: "",
          storeBanner: "",
          name: manifest?.name || templateId,
          logo: "",
          auth: {
            loginUrl: `/api/adapters/${templateId}/auth/login`,
            registerUrl: `/api/adapters/${templateId}/auth/register`,
            meUrl: `/api/adapters/${templateId}/auth/me`,
          },
        });
      }

      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true, theme: true, name: true, description: true, logo: true, banner: true },
      });
      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }
      let settings: any = {};
      try { settings = JSON.parse(store.settings || "{}"); } catch {}
      let theme: any = {};
      try { theme = JSON.parse(store.theme || "{}"); } catch {}

      // For /config, flatten section-based settings so the template can access them directly
      // e.g. settings.hero.heroTitle -> config.heroTitle
      const flatSettings: any = { ...settings };
      for (const [sectionKey, sectionValue] of Object.entries(settings)) {
        if (typeof sectionValue === "object" && sectionValue !== null && !Array.isArray(sectionValue)) {
          for (const [fieldKey, fieldValue] of Object.entries(sectionValue as Record<string, any>)) {
            // Don't overwrite existing top-level keys with numeric junk keys
            if (!isNaN(Number(fieldKey))) continue;
            if (flatSettings[fieldKey] === undefined) {
              flatSettings[fieldKey] = fieldValue;
            }
          }
        }
      }

      // Map platform schema field names to template-expected field names
      const heroSettings = settings.hero || {};
      // Platform schema uses "image" but templates expect "heroImage"
      if (heroSettings.image && !flatSettings.heroImage) {
        flatSettings.heroImage = heroSettings.image;
      }
      if (heroSettings.mobileImage && !flatSettings.heroMobileImage) {
        flatSettings.heroMobileImage = heroSettings.mobileImage;
      }
      // Platform schema uses "headline" but templates expect "heroTitle"
      if (heroSettings.headline && !flatSettings.heroTitle) {
        flatSettings.heroTitle = heroSettings.headline;
      }
      if (heroSettings.subtext && !flatSettings.heroSubtitle) {
        flatSettings.heroSubtitle = heroSettings.subtext;
      }
      if (heroSettings.buttonText && !flatSettings.heroCtaText) {
        flatSettings.heroCtaText = heroSettings.buttonText;
      }
      if (heroSettings.buttonUrl && !flatSettings.heroCtaLink) {
        flatSettings.heroCtaLink = heroSettings.buttonUrl;
      }

      return NextResponse.json({
        ...flatSettings,
        settings,
        theme: { ...theme, ...(settings.theme || {}) },
        storeName: settings.brand?.storeName || store.name,
        storeDescription: store.description,
        storeLogo: settings.brand?.logo || store.logo,
        storeBanner: store.banner,
        name: settings.brand?.storeName || store.name,
        logo: settings.brand?.logo || store.logo,
        auth: {
          loginUrl: `/api/adapters/${templateId}/auth/login`,
          registerUrl: `/api/adapters/${templateId}/auth/register`,
          meUrl: `/api/adapters/${templateId}/auth/me`,
        },
      });
    } catch (error) {
      console.error(`[Adapter ${templateId}] settings/config error:`, error);
      return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
    }
  }

  // Collections endpoint
  if (pathStr === "collections") {
    const manifest = loadManifest(templateId);
    const collections = manifest?.dashboard?.collections || [];
    return NextResponse.json({ collections });
  }

  // Generic proxy
  if (!storeId) {
    return NextResponse.json({ error: "Store context required" }, { status: 404 });
  }
  try {
    const targetUrl = buildPlatformUrl(`/${pathStr}`, request, storeId);
    const res = await fetch(targetUrl, {
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("x-user-id") ? { "x-user-id": request.headers.get("x-user-id")! } : {}),
        ...(request.headers.get("x-customer-id") ? { "x-customer-id": request.headers.get("x-customer-id")! } : {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`[Adapter ${templateId}] generic proxy error:`, error);
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }
}

// ── POST handler ──
async function handleTemplatePost(templateId: string, path: string[], request: NextRequest) {
  let body: any = {};
  try { body = await request.json(); } catch {}

  const storeId = getStoreId(request);
  const platformUrl = `${PLATFORM_URL}/api`;
  const pathStr = path.join("/");

  if (pathStr === "auth/login") {
    try {
      const res = await fetch(`${platformUrl}/stores/${storeId}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: body.email, password: body.password }),
      });
      const data = await res.json();
      if (res.ok && data.customer) {
        const token = generateToken(data.customer.id, data.customer.email);
        return NextResponse.json({ token, user: data.customer });
      }
      return NextResponse.json({ message: data.error || "Login failed" }, { status: res.status });
    } catch {
      return NextResponse.json({ message: "Login failed" }, { status: 500 });
    }
  }

  if (pathStr === "auth/register") {
    try {
      const res = await fetch(`${platformUrl}/stores/${storeId}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.customer) {
        const token = generateToken(data.customer.id, data.customer.email);
        return NextResponse.json({ token, user: data.customer });
      }
      return NextResponse.json({ message: data.error || "Registration failed" }, { status: res.status });
    } catch {
      return NextResponse.json({ message: "Registration failed" }, { status: 500 });
    }
  }

  if (pathStr === "orders") {
    const userId = getUserIdFromRequest(request);
    try {
      const res = await fetch(`${platformUrl}/stores/${storeId}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId || "" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return NextResponse.json({
        id: data.order?.id || data.id || `ord-${Date.now()}`,
        orderNumber: data.order?.orderNumber || `ORD-${Date.now()}`,
        status: "pending",
        total: body.total || body.cartTotal || 0,
      });
    } catch {
      return NextResponse.json({ error: "Order failed" }, { status: 500 });
    }
  }

  // Generic proxy
  try {
    const targetUrl = buildPlatformUrl(`/${pathStr}`, request, storeId);
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("x-customer-id") ? { "x-customer-id": request.headers.get("x-customer-id")! } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }
}

// ── PUT / DELETE ──
async function handleTemplatePut(templateId: string, path: string[], request: NextRequest) {
  const storeId = getStoreId(request);
  let body: any = {};
  try { body = await request.json(); } catch {}

  try {
    const targetUrl = buildPlatformUrl(`/${path.join("/")}`, request, storeId);
    const res = await fetch(targetUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Not supported" }, { status: 405 });
  }
}

async function handleTemplateDelete(templateId: string, path: string[], request: NextRequest) {
  const pathStr = path.join("/");
  if (pathStr === "cart") return NextResponse.json({ success: true });

  const storeId = getStoreId(request);
  try {
    const targetUrl = buildPlatformUrl(`/${pathStr}`, request, storeId);
    const res = await fetch(targetUrl, {
      method: "DELETE",
      headers: {
        ...(request.headers.get("x-user-id") ? { "x-user-id": request.headers.get("x-user-id")! } : {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Not supported" }, { status: 405 });
  }
}

function generateToken(userId: string | null, email: string | null): string {
  if (!userId) return "";
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    sub: userId, email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  })).toString("base64url");
  const sig = Buffer.from(`sig-${userId}-${Date.now()}`).toString("base64url");
  return `${header}.${payload}.${sig}`;
}
