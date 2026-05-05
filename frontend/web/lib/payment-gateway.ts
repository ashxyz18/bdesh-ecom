/**
 * Unified Payment Gateway Service
 * Supports: Stripe, bKash, Nagad, Rocket, Cash on Delivery
 *
 * Each gateway implements the same interface for creating payment intents,
 * verifying payments, and handling webhooks.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type GatewayType = "stripe" | "bkash" | "nagad" | "rocket" | "cod";

export interface PaymentIntentResult {
  id: string;           // Internal payment ID
  gatewayId?: string;    // Gateway-specific ID (e.g., Stripe PaymentIntent ID, bKash paymentID)
  status: "PENDING" | "REQUIRES_ACTION" | "PROCESSING" | "SUCCEEDED" | "FAILED";
  clientSecret?: string; // For Stripe — used client-side to confirm
  redirectUrl?: string;  // For bKash/Nagad/Rocket — redirect user to complete payment
  amount: number;
  currency: string;
  method: GatewayType;
  metadata?: Record<string, string>;
}

export interface PaymentVerifyResult {
  verified: boolean;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  trxId?: string;
  amount?: number;
  paidAt?: Date;
  raw?: unknown;
}

export interface GatewayConfig {
  enabled: boolean;
  sandbox?: boolean;
  // Stripe
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  // bKash
  username?: string;
  password?: string;
  appKey?: string;
  appSecret?: string;
  // Nagad
  merchantId?: string;
  ngPublicKey?: string;
  ngPrivateKey?: string;
  // Rocket
  rkMerchantId?: string;
  rkUsername?: string;
  rkPassword?: string;
  // COD
  instructions?: string;
}

export interface CreatePaymentParams {
  storeId: string;
  orderId: string;
  amount: number;
  currency?: string;
  method: GatewayType;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, string>;
  returnUrl?: string;
}

// ─── Gateway Config Helpers ──────────────────────────────────────────────────

export function parseGatewayConfig(raw: string, type: GatewayType): GatewayConfig {
  try {
    const parsed = JSON.parse(raw);
    return {
      enabled: parsed.enabled ?? false,
      sandbox: parsed.sandbox ?? true,
      publicKey: parsed.publicKey,
      secretKey: parsed.secretKey,
      webhookSecret: parsed.webhookSecret,
      username: parsed.username,
      password: parsed.password,
      appKey: parsed.appKey,
      appSecret: parsed.appSecret,
      merchantId: parsed.merchantId,
      ngPublicKey: parsed.publicKey,
      ngPrivateKey: parsed.privateKey,
      rkMerchantId: parsed.merchantId,
      rkUsername: parsed.username,
      rkPassword: parsed.password,
      instructions: parsed.instructions,
    };
  } catch {
    return { enabled: false };
  }
}

export function serializeGatewayConfig(config: GatewayConfig): string {
  return JSON.stringify(config);
}

// ─── Stripe Gateway ─────────────────────────────────────────────────────────

async function createStripeIntent(
  params: CreatePaymentParams,
  config: GatewayConfig
): Promise<PaymentIntentResult> {
  if (!config.secretKey) {
    throw new Error("Stripe secret key not configured");
  }

  // Dynamic import to avoid bundling Stripe when not used
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(config.secretKey);

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(params.amount * 100), // Stripe expects cents
    currency: params.currency || "bdt",
    metadata: {
      orderId: params.orderId,
      storeId: params.storeId,
      ...params.metadata,
    },
    automatic_payment_methods: { enabled: true },
  });

  return {
    id: intent.id,
    gatewayId: intent.id,
    status: intent.status === "requires_payment_method" ? "REQUIRES_ACTION" : "PENDING",
    clientSecret: intent.client_secret ?? undefined,
    amount: params.amount,
    currency: params.currency || "bdt",
    method: "stripe",
  };
}

async function verifyStripePayment(
  gatewayId: string,
  config: GatewayConfig
): Promise<PaymentVerifyResult> {
  if (!config.secretKey) {
    return { verified: false, status: "FAILED" };
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(config.secretKey);

  const intent = await stripe.paymentIntents.retrieve(gatewayId);

  const statusMap: Record<string, PaymentVerifyResult["status"]> = {
    succeeded: "PAID",
    processing: "PENDING",
    requires_payment_method: "FAILED",
    canceled: "FAILED",
  };

  return {
    verified: intent.status === "succeeded",
    status: statusMap[intent.status] ?? "PENDING",
    amount: intent.amount / 100,
    paidAt: intent.status === "succeeded" ? new Date() : undefined,
  };
}

// ─── bKash Gateway ───────────────────────────────────────────────────────────

interface BkashTokenResponse {
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

const bkashTokenCache: { token: string; expires: number } = { token: "", expires: 0 };

async function getBkashToken(config: GatewayConfig): Promise<string> {
  if (bkashTokenCache.token && Date.now() < bkashTokenCache.expires) {
    return bkashTokenCache.token;
  }

  const base = config.sandbox
    ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
    : "https://tokenized.pay.bka.sh/v1.2.0-beta";

  const res = await fetch(`${base}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username: config.username ?? "",
      password: config.password ?? "",
    },
    body: JSON.stringify({
      app_key: config.appKey,
      app_secret: config.appSecret,
    }),
  });

  const data: BkashTokenResponse = await res.json();
  bkashTokenCache.token = data.id_token;
  bkashTokenCache.expires = Date.now() + (data.expires_in - 60) * 1000;
  return data.id_token;
}

async function createBkashIntent(
  params: CreatePaymentParams,
  config: GatewayConfig
): Promise<PaymentIntentResult> {
  const token = await getBkashToken(config);
  const base = config.sandbox
    ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
    : "https://tokenized.pay.bka.sh/v1.2.0-beta";

  const res = await fetch(`${base}/tokenized/checkout/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
      "X-App-Key": config.appKey ?? "",
    },
    body: JSON.stringify({
      mode: "0011",
      payerReference: params.customerInfo?.phone ?? " ",
      callbackURL: params.returnUrl ?? `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/callback/bkash`,
      amount: params.amount.toString(),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: params.orderId,
    }),
  });

  const data = await res.json();

  if (data.errorCode) {
    throw new Error(`bKash error: ${data.errorMessage}`);
  }

  return {
    id: data.paymentID ?? params.orderId,
    gatewayId: data.paymentID,
    status: "REQUIRES_ACTION",
    redirectUrl: data.bkashURL,
    amount: params.amount,
    currency: "BDT",
    method: "bkash",
  };
}

async function verifyBkashPayment(
  gatewayId: string,
  config: GatewayConfig
): Promise<PaymentVerifyResult> {
  const token = await getBkashToken(config);
  const base = config.sandbox
    ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
    : "https://tokenized.pay.bka.sh/v1.2.0-beta";

  const res = await fetch(`${base}/tokenized/checkout/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
      "X-App-Key": config.appKey ?? "",
    },
    body: JSON.stringify({ paymentID: gatewayId }),
  });

  const data = await res.json();

  if (data.transactionStatus === "Completed") {
    return {
      verified: true,
      status: "PAID",
      trxId: data.trxID,
      amount: parseFloat(data.amount),
      paidAt: new Date(),
      raw: data,
    };
  }

  return {
    verified: false,
    status: data.transactionStatus === "Failed" ? "FAILED" : "PENDING",
    trxId: data.trxID,
    raw: data,
  };
}

// ─── Nagad Gateway ───────────────────────────────────────────────────────────

async function createNagadIntent(
  params: CreatePaymentParams,
  config: GatewayConfig
): Promise<PaymentIntentResult> {
  const base = config.sandbox
    ? "http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs"
    : "https://api.mynagad.com/api/dfs";

  // Step 1: Initialize payment
  const initRes = await fetch(`${base}/check-out/initialize/${config.merchantId}/${params.orderId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchantId: config.merchantId,
      orderId: params.orderId,
      amount: params.amount,
      currencyCode: "050",
      challenge: Date.now().toString(),
    }),
  });

  const initData = await initRes.json();

  if (!initData.paymentReferenceId) {
    throw new Error(`Nagad init error: ${initData.message || "Unknown error"}`);
  }

  // Step 2: Complete payment — get redirect URL
  const completeRes = await fetch(`${base}/check-out/complete/${initData.paymentReferenceId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paymentReferenceId: initData.paymentReferenceId,
      merchantId: config.merchantId,
      orderId: params.orderId,
      amount: params.amount,
    }),
  });

  const completeData = await completeRes.json();

  return {
    id: initData.paymentReferenceId,
    gatewayId: initData.paymentReferenceId,
    status: "REQUIRES_ACTION",
    redirectUrl: completeData.callBackUrl || completeData.redirectUrl,
    amount: params.amount,
    currency: "BDT",
    method: "nagad",
  };
}

async function verifyNagadPayment(
  gatewayId: string,
  config: GatewayConfig
): Promise<PaymentVerifyResult> {
  const base = config.sandbox
    ? "http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs"
    : "https://api.mynagad.com/api/dfs";

  const res = await fetch(`${base}/verify/payment/${gatewayId}`);
  const data = await res.json();

  if (data.status === "SUCCESS") {
    return {
      verified: true,
      status: "PAID",
      trxId: data.paymentRefId,
      amount: parseFloat(data.amount),
      paidAt: new Date(data.orderDate),
      raw: data,
    };
  }

  return {
    verified: false,
    status: data.status === "FAILED" ? "FAILED" : "PENDING",
    trxId: data.paymentRefId,
    raw: data,
  };
}

// ─── Rocket Gateway ──────────────────────────────────────────────────────────

async function createRocketIntent(
  params: CreatePaymentParams,
  config: GatewayConfig
): Promise<PaymentIntentResult> {
  // Rocket uses a similar flow to bKash — redirect-based
  const base = config.sandbox
    ? "https://sandbox.rocket.com.bd/api"
    : "https://api.rocket.com.bd/api";

  const res = await fetch(`${base}/payment/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchantId: config.rkMerchantId,
      orderId: params.orderId,
      amount: params.amount,
      currency: "BDT",
      returnUrl: params.returnUrl ?? `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/callback/rocket`,
    }),
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(`Rocket error: ${data.message || "Unknown error"}`);
  }

  return {
    id: data.paymentId ?? params.orderId,
    gatewayId: data.paymentId,
    status: "REQUIRES_ACTION",
    redirectUrl: data.redirectUrl,
    amount: params.amount,
    currency: "BDT",
    method: "rocket",
  };
}

async function verifyRocketPayment(
  gatewayId: string,
  config: GatewayConfig
): Promise<PaymentVerifyResult> {
  const base = config.sandbox
    ? "https://sandbox.rocket.com.bd/api"
    : "https://api.rocket.com.bd/api";

  const res = await fetch(`${base}/payment/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId: gatewayId }),
  });

  const data = await res.json();

  if (data.status === "SUCCESS") {
    return {
      verified: true,
      status: "PAID",
      trxId: data.trxId,
      amount: parseFloat(data.amount),
      paidAt: new Date(),
      raw: data,
    };
  }

  return {
    verified: false,
    status: data.status === "FAILED" ? "FAILED" : "PENDING",
    trxId: data.trxId,
    raw: data,
  };
}

// ─── COD Gateway ─────────────────────────────────────────────────────────────

async function createCodIntent(
  params: CreatePaymentParams
): Promise<PaymentIntentResult> {
  return {
    id: `cod_${params.orderId}`,
    status: "PENDING",
    amount: params.amount,
    currency: params.currency || "BDT",
    method: "cod",
    metadata: { instructions: "Pay on delivery" },
  };
}

// ─── Unified Gateway Interface ──────────────────────────────────────────────

/**
 * Create a payment intent using the specified gateway.
 * Returns a result with either a clientSecret (Stripe) or redirectUrl (bKash/Nagad/Rocket).
 */
export async function createPaymentIntent(
  params: CreatePaymentParams,
  gatewayConfigs: Record<GatewayType, GatewayConfig>
): Promise<PaymentIntentResult> {
  const config = gatewayConfigs[params.method];

  if (!config?.enabled) {
    throw new Error(`Payment method ${params.method} is not enabled`);
  }

  switch (params.method) {
    case "stripe":
      return createStripeIntent(params, config);
    case "bkash":
      return createBkashIntent(params, config);
    case "nagad":
      return createNagadIntent(params, config);
    case "rocket":
      return createRocketIntent(params, config);
    case "cod":
      return createCodIntent(params);
    default:
      throw new Error(`Unsupported payment method: ${params.method}`);
  }
}

/**
 * Verify a payment with the gateway.
 * Used after redirect callback or webhook to confirm payment status.
 */
export async function verifyPayment(
  method: GatewayType,
  gatewayId: string,
  config: GatewayConfig
): Promise<PaymentVerifyResult> {
  switch (method) {
    case "stripe":
      return verifyStripePayment(gatewayId, config);
    case "bkash":
      return verifyBkashPayment(gatewayId, config);
    case "nagad":
      return verifyNagadPayment(gatewayId, config);
    case "rocket":
      return verifyRocketPayment(gatewayId, config);
    case "cod":
      return { verified: true, status: "PENDING" };
    default:
      throw new Error(`Unsupported payment method: ${method}`);
  }
}

// ─── Plan Limits & Feature Access ───────────────────────────────────────────

export interface PlanLimits {
  maxProducts: number;
  maxOrders: number;
  maxStorage: number; // MB
  customDomain: boolean;
  whiteLabel: boolean;
  premiumTemplates: boolean;
  aiCredits: number;
  analytics: boolean;
  prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    maxProducts: 25,
    maxOrders: 100,
    maxStorage: 50,
    customDomain: false,
    whiteLabel: false,
    premiumTemplates: false,
    aiCredits: 3,
    analytics: false,
    prioritySupport: false,
  },
  STARTER: {
    maxProducts: 100,
    maxOrders: 500,
    maxStorage: 500,
    customDomain: false,
    whiteLabel: false,
    premiumTemplates: false,
    aiCredits: 20,
    analytics: true,
    prioritySupport: false,
  },
  PRO: {
    maxProducts: 1000,
    maxOrders: 5000,
    maxStorage: 2000,
    customDomain: true,
    whiteLabel: false,
    premiumTemplates: true,
    aiCredits: 100,
    analytics: true,
    prioritySupport: true,
  },
  ENTERPRISE: {
    maxProducts: -1, // unlimited
    maxOrders: -1,
    maxStorage: -1,
    customDomain: true,
    whiteLabel: true,
    premiumTemplates: true,
    aiCredits: -1,
    analytics: true,
    prioritySupport: true,
  },
};

export function getPlanLimits(planName: string): PlanLimits {
  return PLAN_LIMITS[planName] ?? PLAN_LIMITS.FREE;
}

export function canAccessFeature(planName: string, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(planName);
  const value = limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return false;
}

// ─── White-Label Configuration ───────────────────────────────────────────────

export interface WhiteLabelConfig {
  enabled: boolean;
  brandName: string;       // Replace "Bdesh" with merchant's brand
  logoUrl?: string;        // Custom logo for dashboard
  faviconUrl?: string;     // Custom favicon
  primaryColor?: string;   // Override primary color
  supportEmail?: string;   // Custom support email
  customDomain?: string;   // e.g., shop.merchant.com
  hidePoweredBy: boolean;  // Hide "Powered by Bdesh" footer
  customCss?: string;      // Additional custom CSS
}

export function parseWhiteLabelConfig(raw: string | null | undefined): WhiteLabelConfig {
  if (!raw) {
    return {
      enabled: false,
      brandName: "Bdesh",
      hidePoweredBy: false,
    };
  }
  try {
    return {
      enabled: false,
      brandName: "Bdesh",
      hidePoweredBy: false,
      ...JSON.parse(raw),
    };
  } catch {
    return { enabled: false, brandName: "Bdesh", hidePoweredBy: false };
  }
}

// ─── Default Plans Seed Data ─────────────────────────────────────────────────

export const DEFAULT_PLANS = [
  {
    name: "FREE",
    label: "Free",
    price: 0,
    yearlyPrice: 0,
    features: [
      "Up to 25 products",
      "100 orders/month",
      "50 MB storage",
      "3 AI credits",
      "Basic templates",
      "Bdesh subdomain",
    ],
    limits: JSON.stringify(PLAN_LIMITS.FREE),
    isPopular: false,
    sortOrder: 0,
  },
  {
    name: "STARTER",
    label: "Starter",
    price: 499,
    yearlyPrice: 4990,
    features: [
      "Up to 100 products",
      "500 orders/month",
      "500 MB storage",
      "20 AI credits/month",
      "All free templates",
      "Analytics dashboard",
      "bKash/Nagad/Rocket payments",
    ],
    limits: JSON.stringify(PLAN_LIMITS.STARTER),
    isPopular: false,
    sortOrder: 1,
  },
  {
    name: "PRO",
    label: "Professional",
    price: 1499,
    yearlyPrice: 14990,
    features: [
      "Up to 1,000 products",
      "5,000 orders/month",
      "2 GB storage",
      "100 AI credits/month",
      "Premium templates",
      "Custom domain",
      "Stripe + local gateways",
      "Priority support",
      "Analytics dashboard",
    ],
    limits: JSON.stringify(PLAN_LIMITS.PRO),
    isPopular: true,
    sortOrder: 2,
  },
  {
    name: "ENTERPRISE",
    label: "Enterprise",
    price: 4999,
    yearlyPrice: 49990,
    features: [
      "Unlimited products",
      "Unlimited orders",
      "Unlimited storage",
      "Unlimited AI credits",
      "All premium templates",
      "Custom domain",
      "White-label branding",
      "All payment gateways",
      "Priority support",
      "Advanced analytics",
    ],
    limits: JSON.stringify(PLAN_LIMITS.ENTERPRISE),
    isPopular: false,
    sortOrder: 3,
  },
];
