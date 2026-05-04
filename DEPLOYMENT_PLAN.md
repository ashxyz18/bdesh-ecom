# BdeshShop Deployment Plan — Railway & Vercel

## Project Overview

| Aspect | Detail |
|--------|--------|
| **Framework** | Next.js 16.2.4 (App Router) |
| **Monorepo** | Turborepo + npm workspaces |
| **Database** | Prisma 6 with **SQLite** (local dev) |
| **API Routes** | 62+ serverless API handlers |
| **Multi-tenancy** | Subdomain-based store routing |
| **Auth** | Custom session/cookie-based auth |
| **Payments** | Stripe + bKash/Nagad/Rocket |

---

## ⚠️ Critical Blockers (Must Fix Before Deploy)

### 1. SQLite → PostgreSQL Migration (BLOCKER)

The current Prisma schema uses SQLite:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Both Railway and Vercel require PostgreSQL.** SQLite stores data in a local file which:
- Doesn't work in serverless (Vercel) — no persistent filesystem
- Doesn't support concurrent writes in production
- Can't scale horizontally

**Fix Required:**

1. Change `packages/database/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Review all schema fields for SQLite-specific types:
   - SQLite `String` fields used as booleans → change to `Boolean`
   - SQLite `String` fields used as dates → change to `DateTime`
   - SQLite `String` fields used as JSON → change to `Json`
   - Any `@default(autoincrement())` on `Int` IDs → verify compatibility
   - Any SQLite-specific pragmas or features

3. Update `packages/database/.env`:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/bdesh_ecom"
   ```

4. Run migration:
   ```bash
   cd packages/database
   npx prisma migrate dev --name init-postgres
   ```
   This creates the `prisma/migrations/` directory needed for production.

5. Seed the database:
   ```bash
   npx prisma db seed
   ```

### 2. Prisma Migration for Production

Currently there are **no migration files** in the repo (only `dev.db`). You need:

```bash
cd packages/database
npx prisma migrate dev --name init
```

This generates `prisma/migrations/` which is required for `prisma migrate deploy` in production.

### 3. Subdomain Multi-Tenancy on Vercel

The [`getSubdomain()`](apps/web/lib/subdomain.ts:1) function extracts subdomains from the host header. On Vercel:

- **Wildcard domains** (`*.bdesh.shop`) require a **Vercel Pro plan** ($20/mo)
- Without Pro, you can only add individual subdomains manually
- Alternative: Use path-based routing (`/store/{subdomain}`) as a fallback

The current code already has a `?subdomain=` query param fallback in [`store/[[...path]]/page.tsx`](apps/web/app/store/[[...path]]/page.tsx:48), which works without wildcard domains.

---

## Option A: Deploy Everything on Railway

Railway provides both the compute (Node.js) and database (PostgreSQL) in one platform. Best for simplicity.

### Architecture

```
┌─────────────────────────────────────┐
│           Railway Project           │
│                                     │
│  ┌─────────────┐  ┌──────────────┐  │
│  │  Next.js App │  │  PostgreSQL  │  │
│  │  (Node.js)   │──│  15          │  │
│  │  Port 3000   │  │  Railway DB  │  │
│  └─────────────┘  └──────────────┘  │
│                                     │
│  Custom Domain: bdesh.shop          │
└─────────────────────────────────────┘
```

### Step-by-Step: Railway Deployment

#### 1. Prepare the Repository

Create a `Dockerfile` at the repo root (Railway auto-detects Next.js but monorepos need guidance):

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/ai/package.json ./packages/ai/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
RUN npm ci

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx turbo run build --filter=@bdesh/web

# Production
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/web

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

> **Note**: For the standalone output, you need to add `output: "standalone"` to [`next.config.ts`](apps/web/next.config.ts:3).

Alternatively, use a simpler `nixpacks` approach with a custom start command:

**Create `railway.toml`** at repo root:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "cd apps/web && npx prisma migrate deploy && npx next start"
healthcheckPath = "/"
healthcheckTimeout = 300

[build.nixpacks]
# Tell nixpacks this is a Node.js monorepo
```

#### 2. Add `output: "standalone"` to Next.js Config

In [`apps/web/next.config.ts`](apps/web/next.config.ts:3):
```typescript
const nextConfig: NextConfig = {
  output: "standalone",  // ADD THIS
  reactStrictMode: true,
  // ... rest of config
};
```

This enables Docker-optimized builds with a minimal `server.js`.

#### 3. Create Railway Project

1. Go to [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → select your `bdesh-ecom` repo
3. Railway auto-detects Node.js — configure as needed

#### 4. Add PostgreSQL Service

1. In the same Railway project → **New Service** → **Database** → **PostgreSQL**
2. Railway auto-creates a `DATABASE_URL` variable
3. Go to the web service → **Variables** → add:
   ```
   DATABASE_URL=${{PostgreSQL.DATABASE_URL}}
   ```

#### 5. Set Environment Variables

In the Railway web service, add these variables:

```env
DATABASE_URL=<from Railway PostgreSQL>
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://bdesh.shop
NEXT_PUBLIC_APP_URL=https://bdesh.shop
OPENAI_API_KEY=sk-proj-...
NODE_ENV=production
```

#### 6. Configure Custom Domain

1. Railway service → **Settings** → **Domains**
2. Add `bdesh.shop` and `*.bdesh.shop`
3. Add DNS records at your domain registrar:
   - `A` record → Railway's IP
   - `*` CNAME → `bdesh.shop`

#### 7. Deploy

Railway auto-deploys on every push to main. First deploy will:
1. Install npm dependencies
2. Build the monorepo via Turborepo
3. Run `prisma migrate deploy` (if configured in start command)
4. Start the Next.js server

---

## Option B: Deploy on Vercel (Frontend + API) + Railway (Database)

Best for performance — Vercel's edge network + serverless functions for the Next.js app, Railway just for PostgreSQL.

### Architecture

```
┌──────────────────────────────────┐
│         Vercel (Serverless)      │
│                                  │
│  Next.js App                     │
│  ├─ Static pages (CDN)          │
│  ├─ SSR pages (Edge/Serverless) │
│  └─ API Routes (Serverless)     │
│                                  │
│  Domain: bdesh.shop              │
└──────────┬───────────────────────┘
           │ DATABASE_URL
           ▼
┌──────────────────────────────────┐
│     Railway (Database Only)     │
│                                  │
│  PostgreSQL 15                   │
│  Connection pooling via pgbouncer│
│                                  │
└──────────────────────────────────┘
```

### Step-by-Step: Vercel + Railway

#### 1. Set Up PostgreSQL on Railway

1. Create a new Railway project
2. Add **PostgreSQL** service only
3. Go to PostgreSQL service → **Variables** → copy `DATABASE_URL`
4. **Enable connection pooling**: Railway provides a pooled `DATABASE_URL` (uses `pgbouncer`) — use this for Vercel serverless

#### 2. Configure Vercel Project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. **Framework Preset**: Next.js
4. **Root Directory**: Set to `apps/web` (NOT the repo root)
5. **Build Command**: `cd ../.. && npx turbo run build --filter=@bdesh/web`
6. **Output Directory**: `.next`
7. **Install Command**: `cd ../.. && npm ci`

> ⚠️ **Important**: Vercel needs to build from the monorepo root because `apps/web` depends on `packages/*`. The root directory setting tells Vercel where the `next.config.ts` lives, but the build/install commands run from the repo root.

#### 3. Create `vercel.json` at Repo Root

```json
{
  "buildCommand": "npx turbo run build --filter=@bdesh/web",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "outputDirectory": "apps/web/.next"
}
```

#### 4. Set Environment Variables on Vercel

In Vercel project → **Settings** → **Environment Variables**:

```env
DATABASE_URL=postgresql://...@railway.proxy.rlwy.net:5432/railway
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://bdesh.shop
NEXT_PUBLIC_APP_URL=https://bdesh.shop
OPENAI_API_KEY=sk-proj-...
```

> **Use the Railway pooled connection string** (port `5432` via proxy) for serverless. It handles connection pooling which is critical for Vercel's many concurrent function instances.

#### 5. Handle Prisma in Serverless

Vercel serverless functions need Prisma Client generated at build time. The `postinstall` script in [`packages/database/package.json`](packages/database/package.json:8) already runs `prisma generate`, but you need to ensure:

1. `DATABASE_URL` is available at build time (Vercel sets env vars during build)
2. Add to [`apps/web/package.json`](apps/web/package.json:5) scripts:
   ```json
   "postbuild": "cd ../../packages/database && npx prisma generate"
   ```
   Or rely on the existing `postinstall` hook.

3. For **Prisma migrations**, run them separately (not during Vercel build):
   ```bash
   # Run locally or in CI:
   DATABASE_URL=<railway-url> npx prisma migrate deploy
   ```
   
   Or add a GitHub Action:
   ```yaml
   name: Deploy Migrations
   on:
     push:
       branches: [main]
   jobs:
     migrate:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
         - run: npm ci
         - run: cd packages/database && npx prisma migrate deploy
           env:
             DATABASE_URL: ${{ secrets.DATABASE_URL }}
   ```

#### 6. Configure Custom Domain on Vercel

1. Vercel project → **Settings** → **Domains**
2. Add `bdesh.shop`
3. Add DNS records at registrar:
   - `A` record → `76.76.21.21` (Vercel)
   - `CNAME` `www` → `cname.vercel-dns.com`

4. For **wildcard subdomains** (`*.bdesh.shop`):
   - Requires **Vercel Pro** plan
   - Add `*.bdesh.shop` in domain settings
   - Add wildcard DNS: `*` CNAME → `cname.vercel-dns.com`

#### 7. Deploy

Vercel auto-deploys on push to `main`. The build process:
1. Runs `npm ci` at repo root
2. Runs `turbo build --filter=@bdesh/web`
3. Prisma Client is generated via `postinstall`
4. Next.js builds with static + serverless output
5. Vercel deploys static assets to CDN, API routes as serverless functions

---

## Option C: Hybrid — Vercel (Frontend) + Railway (Backend + DB)

Use Vercel for the marketing/landing pages and Railway for the full app with API routes. This avoids Vercel serverless cold starts for API-heavy workloads.

### When to Choose This

- Your API routes have heavy computation (AI generation, image processing)
- You need persistent WebSocket connections
- You want to avoid Vercel's serverless function timeout limits (10s hobby, 60s Pro)
- You need background jobs or cron tasks

### Architecture

```
┌──────────────────────┐     ┌──────────────────────────┐
│   Vercel (Static +   │     │   Railway (Full App)     │
│   Edge SSR)          │     │                          │
│                      │     │  Next.js (Node.js)       │
│  Landing page        │     │  ├─ API Routes            │
│  Marketing pages     │     │  ├─ Dashboard             │
│  Store SSR pages     │────▶│  ├─ AI Builder           │
│                      │     │  └─ Admin Panel           │
│  bdesh.shop          │     │                          │
│                      │     │  PostgreSQL 15            │
└──────────────────────┘     │  app.bdesh.shop          │
                              └──────────────────────────┘
```

This is more complex to configure and generally not recommended unless you hit Vercel's limits.

---

## Environment Variables Checklist

| Variable | Required | Where to Get | Notes |
|----------|----------|-------------|-------|
| `DATABASE_URL` | ✅ | Railway PostgreSQL | Use pooled URL for Vercel |
| `NEXTAUTH_SECRET` | ✅ | `openssl rand -base64 32` | Same value on all services |
| `NEXTAUTH_URL` | ✅ | Your domain | `https://bdesh.shop` |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your domain | `https://bdesh.shop` |
| `OPENAI_API_KEY` | ✅ | OpenAI Platform | `sk-proj-...` |
| `STRIPE_SECRET_KEY` | If using Stripe | Stripe Dashboard | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | If using Stripe | Stripe Dashboard | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | If using Stripe | Stripe Dashboard | `pk_live_...` |
| `NODE_ENV` | ✅ | — | `production` |

---

## Recommended: Option B (Vercel + Railway PostgreSQL)

| Factor | Vercel + Railway | Railway Only |
|--------|-----------------|--------------|
| **Next.js Optimization** | ✅ Edge/Serverless, ISR, Image Optimization | ❌ Standard Node.js server |
| **CDN** | ✅ Global edge CDN | ❌ Single region |
| **Cold Starts** | ⚠️ Serverless cold starts | ✅ Always warm |
| **API Timeout** | ⚠️ 10s (Hobby), 60s (Pro) | ✅ No limit |
| **Cost** | ⚠️ Free tier + $5/mo Railway | ✅ ~$5/mo Railway |
| **Subdomain Support** | ⚠️ Pro plan for wildcards | ✅ Native support |
| **Simplicity** | ⚠️ Two platforms | ✅ One platform |
| **Auto-scaling** | ✅ Built-in | ⚠️ Manual |

### My Recommendation

**Start with Railway only (Option A)** for simplicity and cost. Once you validate the product and need better global performance, migrate the frontend to Vercel (Option B).

---

## Pre-Deployment Checklist

- [ ] **Migrate SQLite → PostgreSQL** in Prisma schema
- [ ] **Generate Prisma migrations** (`prisma migrate dev --name init-postgres`)
- [ ] **Add `output: "standalone"`** to [`next.config.ts`](apps/web/next.config.ts:3) (for Railway/Docker)
- [ ] **Test PostgreSQL locally** with `docker-compose.yml` (change from SQLite)
- [ ] **Set all environment variables** on the deployment platform
- [ ] **Run `prisma migrate deploy`** against production database
- [ ] **Seed production database** with essential data
- [ ] **Configure custom domain** and SSL
- [ ] **Configure wildcard subdomain** (if using multi-tenancy)
- [ ] **Set up Stripe webhooks** for production
- [ ] **Test auth flow** (login, register, session)
- [ ] **Test store creation** and storefront rendering
- [ ] **Test AI features** with production API key
- [ ] **Set up monitoring** (Vercel Analytics / Railway metrics)
- [ ] **Set up CI/CD** for running Prisma migrations before deploy

---

## Quick Start Commands

### For Railway (Option A):

```bash
# 1. Switch to PostgreSQL
cd packages/database
# Edit prisma/schema.prisma: provider = "postgresql"

# 2. Generate migration
npx prisma migrate dev --name init-postgres

# 3. Add standalone output to next.config.ts
# output: "standalone"

# 4. Push to GitHub, Railway auto-deploys

# 5. Run migrations on Railway
# railway run --service web npx prisma migrate deploy
```

### For Vercel + Railway (Option B):

```bash
# 1. Create Railway project with PostgreSQL only
# 2. Copy DATABASE_URL (pooled)

# 3. Import repo to Vercel
# Root Directory: apps/web
# Build Command: cd ../.. && npx turbo run build --filter=@bdesh/web

# 4. Set env vars on Vercel

# 5. Run migrations (local or CI):
DATABASE_URL=<railway-pooled-url> npx prisma migrate deploy

# 6. Push to GitHub, Vercel auto-deploys
```
