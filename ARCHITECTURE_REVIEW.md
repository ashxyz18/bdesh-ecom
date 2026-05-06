# BdeshShop — Architecture Review

**Date:** 2026-05-06  
**Reviewer:** Architect Mode  
**Project:** bdesh-ecom (BdeshShop) — Multi-tenant e-commerce platform for Bangladesh

---

## 1. Executive Summary

BdeshShop is an ambitious multi-tenant e-commerce platform targeting the Bangladesh market, with support for local payment gateways (bKash, Nagad, Rocket, COD), Bengali language, and 8+ store templates. The tech stack is modern (Next.js 16, Prisma, PostgreSQL, Turborepo), but the implementation has significant architectural gaps that would block a production launch.

**Overall Assessment: 🟡 Early-stage — Strong foundation, critical gaps in auth, API completeness, data integrity, and deployment.**

---

## 2. Project Structure

```
bdesh-ecom/
├── frontend/web/          ← Next.js 16 app (App Router)
├── packages/
│   ├── database/          ← Prisma + schema
│   ├── ai/                ← AI services (OpenAI, OpenRouter, etc.)
│   ├── shared/            ← Shared schemas & utils
│   └── ui/                ← Empty package
├── backend/               ← Remnant directory (unused)
├── apps/                  ← Remnant directory (unused)
├── docker-compose.yml     ← Postgres + Redis
├── Dockerfile             ← Multi-stage build
├── render.yaml            ← Render deployment (malformed)
└── railway.toml           ← Railway deployment config
```

---

## 3. Critical Issues (Must Fix Before Production)

### 3.1 🔴 Authentication System is Incomplete & Insecure

**Files:** [`auth.ts`](frontend/web/lib/auth.ts:1), [`AdminContext.tsx`](frontend/web/app/admin/AdminContext.tsx:1)

| Problem | Detail |
|---------|--------|
| Custom session system | UUID tokens in DB + cookies — no JWT, no signing, no rotation |
| No middleware protection | No `middleware.ts` — all route protection is per-route, error-prone |
| Admin auth is client-side only | [`AdminContext`](frontend/web/app/admin/AdminContext.tsx:43) checks role on client; server renders admin pages for anyone |
| No password reset | No forgot-password or email verification flow |
| CSRF is broken | [`csrf.ts`](frontend/web/lib/csrf.ts:31) validates httpOnly cookie against header, but JS can't read httpOnly cookies to send as headers |
| NEXTAUTH_SECRET unused | `.env.example` defines `NEXTAUTH_SECRET` but NextAuth is not implemented |

**Recommendation:** Replace the custom auth with NextAuth.js v5 (Auth.js) or a similar battle-tested library. Add `middleware.ts` for server-side route protection.

---

### 3.2 🔴 API Surface is Nearly Empty

**Files:** [`api/[storeId]/products/route.ts`](frontend/web/app/api/[storeId]/products/route.ts:1), [`api/reviews/route.ts`](frontend/web/app/api/reviews/route.ts:1)

Only **4 API routes** exist for an entire e-commerce platform:

| Available | Missing (Critical) |
|-----------|-------------------|
| `GET /products` | `POST/PUT/DELETE /products` |
| `PATCH /products/[id]` (soft-delete only) | Auth (login, register, logout, me) |
| `GET/POST /reviews` | Order CRUD + checkout flow |
| `GET /health` | Cart management (server-side) |
| | Payment processing + webhooks |
| | Store CRUD + settings |
| | Admin endpoints (stats, moderation) |
| | Media upload |
| | Collection, Coupon, Campaign CRUD |
| | Blog, Booking, Lead management |
| | Search |

**Recommendation:** Build a complete API layer. Consider extracting to a separate service or at minimum creating a consistent route factory with shared middleware.

---

### 3.3 🔴 Monetary Values Use `Float` — Precision Loss

**File:** [`schema.prisma`](packages/database/prisma/schema.prisma:107)

```prisma
price         Float    // ❌ Product.price
subtotal      Float    // ❌ Order.subtotal
total         Float    // ❌ Order.total
amount        Float    // ❌ Payment.amount
```

Floating-point arithmetic causes rounding errors. `100.10 + 50.05 ≠ 150.15` in Float.

**Recommendation:** Use `Decimal` type in Prisma (maps to PostgreSQL `NUMERIC`):
```prisma
price    Decimal  @db.Decimal(10, 2)
```

---

### 3.4 🔴 Payment Gateway Secrets Stored as Plaintext in DB

**File:** [`schema.prisma`](packages/database/prisma/schema.prisma:451)

```prisma
model PaymentGateway {
  stripe    String @default("{}") // Contains secretKey, webhookSecret
  bkash     String @default("{}") // Contains username, password, appSecret
  nagad     String @default("{}") // Contains privateKey
}
```

All payment credentials are stored as unencrypted JSON strings. Anyone with DB access gets all keys.

**Recommendation:** 
- Store only public keys in DB
- Private keys → environment variables per-store or a secrets manager (Vault, AWS Secrets Manager)
- At minimum, encrypt the JSON blobs with AES-256 before storing

---

### 3.5 🔴 In-Memory Rate Limiter Doesn't Work in Production

**File:** [`rate-limit.ts`](frontend/web/lib/rate-limit.ts:38)

```typescript
const stores = new Map<string, Map<string, RateLimitEntry>>();
```

In-memory rate limiting fails when running multiple instances (each has its own state). Redis is configured in `docker-compose.yml` but never used.

**Recommendation:** Move rate limiting to Redis. The infrastructure is already provisioned.

---

## 4. High-Priority Issues (Fix Before Scaling)

### 4.1 🟠 JSON Strings Instead of Prisma `Json` Type

**File:** [`schema.prisma`](packages/database/prisma/schema.prisma:67)

At least **15 fields** store structured data as `String` with manual `JSON.parse()`:

| Model | Fields |
|-------|--------|
| Store | `theme`, `settings` |
| Product | `images`, `attributes` |
| Section | `props` |
| Template | `config` |
| Campaign | `config`, `stats` |
| Analytics | `topProducts`, `sources` |
| Plan | `features`, `limits` |
| Subscription | `metadata` |
| PaymentGateway | `stripe`, `bkash`, `nagad`, `rocket`, `cod` |

This causes:
- Manual parsing everywhere (see [`page.tsx:144-145`](frontend/web/app/store/[[...path]]/page.tsx:144))
- No DB-level validation
- Can't query into JSON fields efficiently
- Risk of invalid JSON being stored

**Recommendation:** Migrate to Prisma `Json` type:
```prisma
theme    Json    @default("{}")
images   Json    @default([])
```

---

### 4.2 🟠 String Enums Instead of Prisma Enums

**File:** [`schema.prisma`](packages/database/prisma/schema.prisma:29)

```prisma
role    String  @default("CUSTOMER") // ADMIN, MERCHANT, CUSTOMER
status  String  @default("PENDING")   // PENDING, APPROVED, SUSPENDED, DELETED
```

At least **15+ fields** use string comments instead of proper enums. This means:
- No DB-level constraint — any string can be inserted
- No TypeScript autocomplete for valid values
- Easy to introduce typos

**Recommendation:** Define Prisma enums:
```prisma
enum UserRole {
  ADMIN
  MERCHANT
  CUSTOMER
}

model User {
  role UserRole @default(CUSTOMER)
}
```

---

### 4.3 🟠 No Next.js Middleware for Route Protection

There is no `middleware.ts` file. This means:
- Admin routes (`/admin/*`) are accessible to anyone — the client-side redirect in [`AdminContext`](frontend/web/app/admin/AdminContext.tsx:58) is trivially bypassed
- Store owner routes have no server-side protection
- Every API route must manually check auth

**Recommendation:**
```typescript
// middleware.ts
export function middleware(request) {
  // Protect /admin/* routes — check session + ADMIN role
  // Protect /api/* mutating routes — check session
  // Set store context from subdomain
}
```

---

### 4.4 🟠 Cart is Client-Only (localStorage)

**File:** [`CartContext.tsx`](frontend/web/lib/store-templates/shared/context/CartContext.tsx:28)

```typescript
const saved = localStorage.getItem(`cart_${storeId}`)
```

Problems:
- Cart doesn't persist across devices
- No server-side price validation — stale/forged prices possible
- The `CartItem` DB model exists but is unused
- Cart data lost on browser clear

**Recommendation:** Implement server-side cart using the existing `CartItem` model. Use localStorage as a guest cart fallback, merge on login.

---

### 4.5 🟠 No Search Engine — Sequential Scan Only

**File:** [`products/route.ts`](frontend/web/app/api/[storeId]/products/route.ts:38)

```typescript
where.OR = [
  { name: { contains: search, mode: "insensitive" } },
  { description: { contains: search, mode: "insensitive" } },
];
```

Prisma `contains` with `insensitive` mode does a full sequential scan. With 10K+ products, this becomes a major bottleneck.

**Recommendation:** 
- Short-term: Add PostgreSQL full-text search with `tsvector` via Prisma raw queries
- Long-term: Integrate Meilisearch or Typesense for faceted search

---

### 4.6 🟠 Monorepo Structure Has Ghost Directories

| Directory | Status |
|-----------|--------|
| `backend/ai/` | Contains files but duplicates `packages/ai/` |
| `backend/database/` | Contains files but duplicates `packages/database/` |
| `apps/web/` | Empty — real app is in `frontend/web/` |
| `packages/ui/` | Empty — only `package.json`, no source |
| `turbo.json` | Missing — no pipeline configuration |

**Recommendation:** Clean up: remove `backend/` and `apps/`, add `turbo.json`, either populate `@bdesh/ui` or remove the dependency.

---

## 5. Medium-Priority Issues (Fix for Production Quality)

### 5.1 🟡 Massive StorePage Component (411 lines)

**File:** [`store/[[...path]]/page.tsx`](frontend/web/app/store/[[...path]]/page.tsx:108)

This single file handles:
- Data fetching with complex Prisma query
- JSON parsing of 5+ fields
- Schema.org structured data generation
- Breadcrumb logic
- Template resolution and rendering
- Extensive `as any` type casting

**Recommendation:** Extract into:
- `lib/store/data-fetcher.ts` — data fetching + parsing
- `lib/store/schema-org.ts` — structured data generation
- `lib/store/template-resolver.ts` — template resolution
- Proper TypeScript types instead of `as any`

---

### 5.2 🟡 No Loading States or Error Boundaries

No `loading.tsx` or `error.tsx` files exist for any route segment. Users see blank screens during data fetching and unhandled errors crash the entire app.

**Recommendation:** Add Next.js `loading.tsx` and `error.tsx` for each route segment.

---

### 5.3 🟡 render.yaml is Malformed

**File:** [`render.yaml`](render.yaml:42)

Lines 42-50 contain orphaned key-value pairs outside any service definition. This will cause deployment failures.

**Recommendation:** Fix the YAML structure or remove the duplicate keys.

---

### 5.4 🟡 No Database Migration in Deployment Pipeline

Neither the Dockerfile nor deployment configs run `prisma migrate deploy`. Migrations must be run manually, which is error-prone and will cause startup failures after schema changes.

**Recommendation:** Add a migration step:
```dockerfile
RUN npx prisma migrate deploy
```
Or use a release command in the deployment platform.

---

### 5.5 🟡 Missing Database Indexes

| Missing Index | Impact |
|---------------|--------|
| `Review.productId` | Slow review lookups |
| `Review.userId` | Slow user review queries |
| `CartItem.productId` | Slow cart item lookups |
| `CartItem(userId, productId)` UNIQUE | Prevents duplicate cart entries |
| `BlogPost.storeId` | Slow blog queries |
| `Booking.storeId` | Slow booking queries |

---

### 5.6 🟡 Soft Delete Inconsistency

Only `Store` and `Product` have `deletedAt`. Other models that may need soft delete:
- `Order` — orders should never be hard-deleted
- `BlogPost` — draft/published lifecycle
- `Template` — downloaded templates shouldn't disappear
- `User` — GDPR compliance may require soft delete + anonymization

---

### 5.7 🟡 No Audit Logging

There's no audit log model. For an e-commerce platform handling payments, you need:
- Who changed what and when
- Order status transitions
- Payment events
- Admin actions

**Recommendation:** Add an `AuditLog` model:
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String   // ORDER_CREATED, PAYMENT_RECEIVED, etc.
  entity    String   // Order, Product, Store
  entityId  String
  changes   Json     @default("{}")
  ip        String?
  createdAt DateTime @default(now())
}
```

---

## 6. Low-Priority Issues (Nice to Have)

### 6.1 🔵 API CORS Too Permissive

**File:** [`next.config.ts`](frontend/web/next.config.ts:38)

```typescript
{ key: "Access-Control-Allow-Origin", value: "*" },
```

Wildcard CORS on all API routes is unnecessary for a same-origin Next.js app. Only needed if third-party apps will call the API.

---

### 6.2 🔵 Template Registry is Hardcoded

**File:** [`registry.tsx`](frontend/web/lib/store-templates/registry.tsx:5)

Adding a new template requires modifying the registry file. Consider auto-discovery or a plugin system.

---

### 6.3 🔵 No Email Service Implementation

`.env.example` has SMTP config but no email sending code exists. Needed for:
- Order confirmations
- Password reset
- Email verification
- Marketing campaigns

---

### 6.4 🔵 No Image Optimization Pipeline

Images are stored as URLs with no processing. For a multi-tenant platform:
- Need image resizing/cropping on upload
- WebP/AVIF conversion
- CDN integration (Cloudflare, imgproxy)

---

### 6.5 🔵 CSP Allows `unsafe-eval` and `unsafe-inline`

**File:** [`next.config.ts`](frontend/web/next.config.ts:62)

```
script-src 'self' 'unsafe-eval' 'unsafe-inline'
```

This significantly weakens XSS protection. Remove once all scripts are properly loaded.

---

## 7. Architecture Improvement Roadmap

### Phase 1: Production Blockers (Week 1-2)
1. ✅ Replace custom auth with NextAuth.js v5
2. ✅ Add `middleware.ts` for server-side route protection
3. ✅ Fix CSRF implementation
4. ✅ Migrate `Float` → `Decimal` for all monetary fields
5. ✅ Encrypt or externalize payment gateway secrets
6. ✅ Move rate limiter to Redis
7. ✅ Fix `render.yaml` syntax

### Phase 2: API & Data Integrity (Week 3-4)
1. ✅ Build complete API surface (auth, orders, cart, payments, stores, admin)
2. ✅ Migrate `String` → `Json` type for all JSON fields
3. ✅ Convert string enums to Prisma enums
4. ✅ Add missing database indexes
5. ✅ Implement server-side cart with guest merge
6. ✅ Add `prisma migrate deploy` to deployment pipeline
7. ✅ Add audit logging

### Phase 3: Production Quality (Week 5-6)
1. ✅ Refactor StorePage into modular functions
2. ✅ Add `loading.tsx` and `error.tsx` for all routes
3. ✅ Implement email service
4. ✅ Add PostgreSQL full-text search
5. ✅ Clean up monorepo (remove ghost directories, add `turbo.json`)
6. ✅ Add soft delete to Order, BlogPost, User
7. ✅ Implement image optimization pipeline

### Phase 4: Scale & Polish (Week 7+)
1. ✅ CDN integration for static assets
2. ✅ Database backup automation
3. ✅ Monitoring & alerting (Sentry, Datadog)
4. ✅ Load testing
5. ✅ Template plugin system
6. ✅ Tighten CSP (remove unsafe-eval/inline)
7. ✅ API versioning

---

## 8. What's Working Well

| Area | Assessment |
|------|-----------|
| **Tech stack choice** | Next.js 16 + Prisma + PostgreSQL is solid |
| **Multi-tenant design** | Subdomain-based with ISR is well-architected |
| **Template system** | Dynamic imports with code splitting is smart |
| **Bangladesh focus** | bKash/Nagad/Rocket integration is market-correct |
| **Security headers** | CSP, HSTS, X-Frame-Options are properly configured |
| **SEO** | Schema.org, OpenGraph, ISR revalidation — well done |
| **Accessibility** | Skip-to-content link, Bengali font preloading |
| **Docker** | Multi-stage build with standalone output is production-ready |
| **Bengali language** | Noto Sans Bengali font, `en_BD` locale |

---

## 9. Summary Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| Database Design | 5/10 | Good models, but Float money, String JSON, no enums |
| Authentication | 2/10 | Custom, incomplete, insecure |
| API Completeness | 2/10 | Only 4 routes for a full e-commerce platform |
| Security | 4/10 | Good headers, but broken CSRF, plaintext secrets, no middleware |
| Frontend Architecture | 6/10 | Good template system, but monolithic pages, no loading states |
| Multi-tenancy | 7/10 | Subdomain + ISR is solid, needs middleware enforcement |
| Deployment | 5/10 | Good Docker, but malformed render.yaml, no migration step |
| Bangladesh Market Fit | 9/10 | Excellent local payment, language, and cultural integration |

**Overall: 5/10** — Strong vision and market fit, but critical gaps in auth, API, and data integrity must be addressed before any production launch.
