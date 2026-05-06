# BdeshShop — Firebase Deployment Plan

**Date:** 2026-05-06  
**Status:** Planning  
**Target:** Deploy bdesh-ecom to Firebase (Google Cloud)

---

## 1. Firebase Service Mapping

| Current Stack | Firebase Service | Notes |
|---------------|-----------------|-------|
| Next.js 16 (App Router, SSR, API routes) | **Firebase App Hosting** | Managed Next.js hosting built on Cloud Run |
| PostgreSQL (Prisma) | **Cloud SQL for PostgreSQL** | Managed PostgreSQL — keeps Prisma working |
| Redis (unused) | **Memorystore for Redis** or **Firebase Realtime DB** | Only needed if you implement server-side rate limiting |
| File uploads (Media) | **Cloud Storage for Firebase** | CDN-backed object storage |
| Environment secrets | **Secret Manager** | Secure storage for API keys, DB credentials |
| Payment webhooks | **Cloud Tasks** or **Cloud Functions** | Async payment callback processing |
| Email (nodemailer) | **Cloud Functions + SendGrid/Mailgun** | Triggered on order events |
| Cron jobs (analytics, cleanup) | **Cloud Scheduler + Cloud Functions** | Scheduled tasks |
| Custom domains (subdomain tenants) | **Firebase Hosting custom domains** | See §4 for multi-tenant strategy |
| CI/CD | **GitHub Actions → Firebase CLI** | Automated deploys on push |

---

## 2. Recommended Architecture: Firebase App Hosting

### Why Firebase App Hosting?

Firebase App Hosting is Google's **managed Next.js hosting** (GA since 2024). It:
- Natively supports Next.js App Router, SSR, API routes, middleware
- Auto-scales on Cloud Run (min 0 instances for cost savings)
- Includes global CDN, SSL, and preview URLs per PR
- Connects to Cloud SQL via VPC connector
- Supports `next.config.ts` without modification

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Google Cloud                       │
│                                                       │
│  ┌──────────────────────────────────────────────┐    │
│  │           Firebase App Hosting                │    │
│  │         (Cloud Run + CDN + SSL)              │    │
│  │                                               │    │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────┐ │    │
│  │  │  SSR    │  │  API     │  │  Static      │ │    │
│  │  │  Pages  │  │  Routes  │  │  Assets/CDN  │ │    │
│  │  └────┬────┘  └────┬─────┘  └─────────────┘ │    │
│  │       │            │                         │    │
│  └───────┼────────────┼─────────────────────────┘    │
│          │            │                               │
│          ▼            ▼                               │
│  ┌──────────────────────────────┐                    │
│  │    Cloud SQL (PostgreSQL)    │                    │
│  │    ┌──────────────────────┐  │                    │
│  │    │  bdesh_ecom database  │  │                    │
│  │    │  + Prisma migrations  │  │                    │
│  │    └──────────────────────┘  │                    │
│  └──────────────────────────────┘                    │
│                                                       │
│  ┌──────────────────┐  ┌───────────────────────┐    │
│  │  Cloud Storage    │  │  Secret Manager       │    │
│  │  (Media uploads)  │  │  (API keys, secrets)  │    │
│  └──────────────────┘  └───────────────────────┘    │
│                                                       │
│  ┌──────────────────┐  ┌───────────────────────┐    │
│  │  Cloud Functions  │  │  Cloud Scheduler      │    │
│  │  (Webhooks/Email) │  │  (Cron: analytics)    │    │
│  └──────────────────┘  └───────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step Setup Guide

### Step 1: Install Firebase CLI & Initialize

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project root
firebase init
```

When prompted, select:
- ✅ **App Hosting** — for the Next.js app
- ✅ **Cloud Storage** — for media uploads
- ✅ **Cloud Functions** — for webhooks & scheduled tasks
- ✅ **Secret Manager** — for environment variables

### Step 2: Create Firebase Project

```bash
# Create project (or use existing)
firebase projects:create bdesh-shop-prod

# Set as default
firebase use bdesh-shop-prod
```

### Step 3: Create `apphosting.yaml`

This is the Firebase App Hosting configuration file:

```yaml
# apphosting.yaml
runConfig:
  minInstances: 0        # Scale to zero when idle (cost savings)
  maxInstances: 10       # Cap at 10 instances
  concurrency: 80        # Requests per instance
  
  cpu: 2                 # 2 vCPUs
  memoryMiB: 1024        # 1 GB RAM

  # VPC connector for Cloud SQL
  vpcAccess:
    connector: projects/bdesh-shop-prod/locations/asia-southeast1/connectors/cloud-sql-connector

env:
  - variable: NODE_ENV
    value: production
  - variable: NEXT_TELEMETRY_DISABLED
    value: "1"
  - variable: DATABASE_URL
    secret: database-url          # From Secret Manager
  - variable: NEXT_PUBLIC_APP_URL
    value: https://bdesh.shop
  - variable: NEXT_PUBLIC_BASE_URL
    value: https://bdesh.shop
  - variable: OPENAI_API_KEY
    secret: openai-api-key
  - variable: OPENROUTER_API_KEY
    secret: openrouter-api-key
  - variable: STRIPE_SECRET_KEY
    secret: stripe-secret-key
  - variable: STRIPE_WEBHOOK_SECRET
    secret: stripe-webhook-secret
  - variable: SMTP_HOST
    secret: smtp-host
  - variable: SMTP_USER
    secret: smtp-user
  - variable: SMTP_PASS
    secret: smtp-pass
```

### Step 4: Provision Cloud SQL (PostgreSQL)

```bash
# Create PostgreSQL instance (Singapore region — closest to Bangladesh)
gcloud sql instances create bdesh-ecom-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-southeast1 \
  --storage-auto-increase \
  --availability-type=regional

# Create database
gcloud sql databases create bdesh_ecom --instance=bdesh-ecom-db

# Set root password
gcloud sql users set-password postgres \
  --instance=bdesh-ecom-db \
  --password=YOUR_SECURE_PASSWORD

# Get connection string for Prisma
# Format: postgresql://postgres:PASSWORD@/bdesh_ecom?host=/cloudsql/bdesh-shop-prod:asia-southeast1:bdesh-ecom-db
```

**Important:** Cloud SQL uses Unix socket connections from Cloud Run. Update Prisma:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

The `DATABASE_URL` for Cloud SQL via socket:
```
postgresql://postgres:PASSWORD@/bdesh_ecom?host=/cloudsql/bdesh-shop-prod:asia-southeast1:bdesh-ecom-db
```

### Step 5: Create VPC Connector

Cloud Run (App Hosting) needs a VPC connector to reach Cloud SQL:

```bash
gcloud compute networks vpc-access connectors create cloud-sql-connector \
  --region=asia-southeast1 \
  --range=10.8.0.0/28
```

### Step 6: Setup Cloud Storage for Media

```bash
# Create storage bucket
gsutil mb -l asia-southeast1 gs://bdesh-shop-media-prod/

# Make publicly readable for CDN
gsutil iam ch allUsers:objectViewer gs://bdesh-shop-media-prod/
```

Add to [`next.config.ts`](frontend/web/next.config.ts:15):
```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "storage.googleapis.com" },
    { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    // ... existing patterns
  ],
},
```

### Step 7: Store Secrets in Secret Manager

```bash
# Store each secret
echo -n "postgresql://postgres:PASSWORD@/bdesh_ecom?host=/cloudsql/..." | \
  gcloud secrets create database-url --data-file=-

echo -n "sk-..." | gcloud secrets create openai-api-key --data-file=-
echo -n "sk-or-..." | gcloud secrets create openrouter-api-key --data-file=-
echo -n "sk_live_..." | gcloud secrets create stripe-secret-key --data-file=-
echo -n "whsec_..." | gcloud secrets create stripe-webhook-secret --data-file=-

# Grant App Hosting access to secrets
gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:bdesh-shop-prod@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 8: Update `next.config.ts` for Firebase

```typescript
// Remove output: "standalone" — Firebase App Hosting handles this
const nextConfig: NextConfig = {
  // output: "standalone",  ← REMOVE THIS (App Hosting auto-configures)
  reactStrictMode: true,
  compress: true,
  transpilePackages: ["@bdesh/database", "@bdesh/shared", "@bdesh/ui"],
  // ... rest stays the same
};
```

### Step 9: Add Media Upload API Route

Create a new API route for uploading to Cloud Storage:

```typescript
// frontend/web/app/api/media/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { getSessionUser } from "@/lib/auth";

const storage = new Storage();
const bucket = storage.bucket("bdesh-shop-media-prod");

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const storeId = formData.get("storeId") as string;

  if (!file || !storeId) {
    return NextResponse.json({ error: "Missing file or storeId" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = `stores/${storeId}/${Date.now()}-${file.name}`;

  const blob = bucket.file(filePath);
  await blob.save(buffer, {
    metadata: { contentType: file.type },
    public: true,
  });

  const publicUrl = `https://storage.googleapis.com/bdesh-shop-media-prod/${filePath}`;

  // Save to Media model in DB
  const { prisma } = await import("@/lib/prisma");
  await prisma.media.create({
    data: {
      storeId,
      url: publicUrl,
      name: file.name,
      type: file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT",
      size: file.size,
      mimeType: file.type,
    },
  });

  return NextResponse.json({ url: publicUrl });
}
```

### Step 10: Deploy

```bash
# First deployment (includes Cloud SQL migration)
# Run Prisma migration locally against Cloud SQL via proxy:
cloud_sql_proxy -instances=bdesh-shop-prod:asia-southeast1:bdesh-ecom-db=tcp:5432 &
npx prisma migrate deploy

# Deploy to Firebase App Hosting
firebase deploy --only apphosting

# Or deploy everything
firebase deploy
```

---

## 4. Multi-Tenant Subdomain Strategy on Firebase

### The Challenge

Firebase Hosting does **not** natively support wildcard subdomains (`*.bdesh.shop`). Each custom domain must be manually added and verified.

### Recommended Approach: Path-Based Routing (Already Implemented)

Your app already uses path-based routing via `?subdomain=xxx`:

```
https://bdesh.shop/store?subdomain=myshop
https://bdesh.shop/store?subdomain=myshop&path=product/t-shirt
```

This works perfectly on Firebase App Hosting with zero changes.

### Future: Custom Domain Mapping

For merchants who want `myshop.com` instead of `bdesh.shop/store?subdomain=myshop`:

1. Merchant adds their custom domain in store settings
2. You add the domain to Firebase Hosting via API:
   ```bash
   firebase hosting:sites:create myshop-com
   ```
3. Configure a Cloud Function to rewrite custom domain requests to the main app with the correct `subdomain` parameter
4. Merchant points their DNS to Firebase

### Alternative: Cloud Run with Wildcard SSL

If wildcard subdomains (`*.bdesh.shop`) are critical:
- Use Cloud Load Balancer + Cloud Run (instead of App Hosting)
- Provision a wildcard SSL certificate
- Route `*.bdesh.shop` → Cloud Run → Next.js middleware extracts subdomain

This is more complex but gives you Shopify-style subdomain routing.

---

## 5. Cloud Functions for Background Tasks

### Payment Webhooks

```typescript
// functions/src/payments/stripe-webhook.ts
import * as functions from "firebase-functions";
import { prisma } from "@bdesh/database";

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  // Verify and process Stripe webhook
  // Update Payment and Order status in DB
  res.json({ received: true });
});

export const bkashCallback = functions.https.onRequest(async (req, res) => {
  // Process bKash payment callback
  // Verify payment and update order
  res.redirect("/order/confirmed");
});
```

### Scheduled Analytics Aggregation

```typescript
// functions/src/cron/aggregate-analytics.ts
import * as functions from "firebase-functions";

export const aggregateDailyAnalytics = functions.pubsub
  .schedule("0 1 * * *") // Daily at 1 AM
  .timeZone("Asia/Dhaka")
  .onRun(async (context) => {
    // Aggregate yesterday's analytics for all stores
    // Update Analytics table
  });
```

### Email Notifications

```typescript
// functions/src/emails/order-confirmation.ts
import * as functions from "firebase-functions";

export const sendOrderConfirmation = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    // Send order confirmation email via SendGrid
  });
```

> **Note:** Since you're using PostgreSQL (not Firestore), use Cloud SQL triggers or Cloud Tasks instead of Firestore triggers for order events.

---

## 6. Cost Estimation (Monthly)

### Firebase App Hosting (Cloud Run)

| Resource | Tier | Cost (USD/mo) |
|----------|------|---------------|
| Cloud Run (2 vCPU, 1GB) | Free tier: 2M requests, 360K GB-sec | $0–20 |
| Cloud SQL (db-f1-micro) | With HA | ~$25–35 |
| Cloud Storage | 10 GB | ~$0.23 |
| Secret Manager | 6 secrets | ~$0.30 |
| Cloud Functions | Free tier: 2M invocations | $0–5 |
| Cloud Scheduler | 3 jobs | ~$0.90 |
| Network egress | 50 GB | ~$5.75 |
| **Total (low traffic)** | | **~$32–67/mo** |
| **Total (medium traffic)** | | **~$80–150/mo** |

> 💡 **Bangladesh tip:** Use `asia-southeast1` (Singapore) — lowest latency to BD. Avoid `us-central1` for production.

---

## 7. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/firebase-deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npm run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: bdesh-shop-prod
```

---

## 8. Pre-Deployment Checklist

### Must Fix Before Deploying

- [ ] **Remove `output: "standalone"` from [`next.config.ts`](frontend/web/next.config.ts:5)** — App Hosting auto-configures this
- [ ] **Fix auth session lookup** — [`auth.ts:46-58`](frontend/web/lib/auth.ts:46) loads ALL sessions and compares with bcrypt — this is O(n) and will be catastrophically slow with 1000+ sessions. Add a unique index or use a different lookup strategy
- [ ] **Add `middleware.ts`** — Server-side route protection for `/admin/*` and API routes
- [ ] **Set up Cloud SQL + VPC connector** — Required for Prisma to connect
- [ ] **Store all secrets in Secret Manager** — Never deploy with hardcoded env vars
- [ ] **Add `prisma migrate deploy` to build step** — Migrations must run before app starts

### Should Fix Before Deploying

- [ ] **Migrate `Float` → `Decimal`** for monetary fields in [`schema.prisma`](packages/database/prisma/schema.prisma:107)
- [ ] **Implement media upload to Cloud Storage** — Replace URL-only storage
- [ ] **Add `loading.tsx` and `error.tsx`** for all route segments
- [ ] **Fix CORS** — Remove wildcard `Access-Control-Allow-Origin` from [`next.config.ts`](frontend/web/next.config.ts:38)
- [ ] **Add rate limiting with Redis** (Memorystore) or use Cloud Armor

### Nice to Have

- [ ] Set up Cloud Monitoring + alerting
- [ ] Configure automated Cloud SQL backups
- [ ] Add Cloud CDN for static assets
- [ ] Implement custom domain mapping for merchants

---

## 9. Firebase Project Structure

```
bdesh-ecom/
├── .github/
│   └── workflows/
│       └── firebase-deploy.yml     ← CI/CD pipeline
├── firebase.json                   ← Firebase project config
├── apphosting.yaml                 ← App Hosting config
├── .firebaserc                     ← Project alias
├── frontend/
│   └── web/                        ← Next.js app (deployed via App Hosting)
├── functions/                      ← Cloud Functions
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── payments/
│       │   ├── stripe-webhook.ts
│       │   ├── bkash-callback.ts
│       │   └── nagad-callback.ts
│       ├── emails/
│       │   ├── order-confirmation.ts
│       │   └── password-reset.ts
│       └── cron/
│           └── aggregate-analytics.ts
├── packages/
│   ├── database/                   ← Prisma (connects to Cloud SQL)
│   ├── ai/
│   └── shared/
└── firebase-storage-rules/         ← Security rules for media bucket
```

---

## 10. Quick Start Commands

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Initialize (select: App Hosting, Cloud Storage, Cloud Functions)
firebase init

# 4. Create Cloud SQL instance
gcloud sql instances create bdesh-ecom-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-southeast1

# 5. Run migrations via Cloud SQL proxy
cloud_sql_proxy -instances=PROJECT:REGION:INSTANCE=tcp:5432 &
npx prisma migrate deploy

# 6. Deploy
firebase deploy --only apphosting

# 7. Open the app
firebase open hosting:site
```

---

## 11. Alternative: Firebase App Hosting vs Cloud Run (Direct)

| Factor | Firebase App Hosting | Cloud Run (Direct) |
|--------|---------------------|-------------------|
| Setup complexity | Low (managed) | Medium (manual) |
| Next.js support | Native (auto-config) | Manual Dockerfile |
| Wildcard subdomains | ❌ Not supported | ✅ Via Load Balancer |
| Preview deploys | ✅ Per PR | ❌ Manual |
| Cost | Same (both use Cloud Run) | Same |
| Scaling | Auto (0→N) | Auto (0→N) |
| Monitoring | Firebase Console | Cloud Console |
| Best for | Standard Next.js apps | Custom networking needs |

**Recommendation:** Start with **Firebase App Hosting** for simplicity. Migrate to direct Cloud Run only if you need wildcard subdomains (`*.bdesh.shop`).

---

## 12. Rollback Strategy

```bash
# List deployments
firebase apphosting:releases:list

# Rollback to previous release
firebase apphosting:releases:rollback --release=RELEASE_ID

# Cloud SQL backup restore
gcloud sql backups restore BACKUP_ID --restore-instance=bdesh-ecom-db
```

---

## Summary

| Decision | Choice |
|----------|--------|
| **Hosting** | Firebase App Hosting (managed Next.js on Cloud Run) |
| **Database** | Cloud SQL for PostgreSQL (keeps Prisma working) |
| **Media** | Cloud Storage for Firebase |
| **Secrets** | Google Secret Manager |
| **Region** | `asia-southeast1` (Singapore — lowest latency to BD) |
| **Multi-tenant routing** | Path-based (`/store?subdomain=xxx`) — already implemented |
| **CI/CD** | GitHub Actions → Firebase CLI |
| **Estimated cost** | $32–67/mo (low traffic), $80–150/mo (medium) |
