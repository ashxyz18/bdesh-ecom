# BdeshShop Deployment Guide — Railway & Vercel

## Project Overview

| Aspect | Detail |
|--------|--------|
| **Framework** | Next.js 16.2.4 (App Router) |
| **Monorepo** | Turborepo + npm workspaces |
| **Database** | Prisma 6 with PostgreSQL |
| **API Routes** | 62+ serverless API handlers |
| **Multi-tenancy** | Subdomain-based store routing |
| **Auth** | Custom session/cookie-based (NOT NextAuth) |
| **Payments** | Stripe + bKash/Nagad/Rocket |

---

## ✅ Already Completed

These changes are already pushed to GitHub (`ashxyz18/bdesh-ecom`):

- [x] Prisma schema migrated from SQLite → PostgreSQL
- [x] `output: "standalone"` added to `next.config.ts`
- [x] Prisma migration SQL generated (`packages/database/prisma/migrations/0_init/`)
- [x] `Dockerfile` created for Railway container builds
- [x] `railway.toml` created with auto-migration on deploy
- [x] `vercel.json` created for monorepo build config
- [x] `.gitignore` updated (excludes `*.db`, `*.lnk`, `video/`)

---

## Environment Variables

Your app uses **custom auth** (not NextAuth), so `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are **NOT needed**.

### Required

| Variable | Where Used | Example |
|----------|-----------|---------|
| `DATABASE_URL` | Prisma DB connection | `postgresql://postgres:xxx@proxy.rlwy.net:5432/railway` |
| `NEXT_PUBLIC_APP_URL` | SEO, sitemap, store URLs, metadata | `https://bdesh.shop` |
| `NEXT_PUBLIC_BASE_URL` | Payment callbacks (bKash/Nagad/Rocket) | `https://bdesh.shop` |
| `OPENAI_API_KEY` | AI features (builder, content, chat) | `sk-proj-...` |

### Optional

| Variable | Where Used | Example |
|----------|-----------|---------|
| `OPENROUTER_API_KEY` | Alternative AI provider | `sk-or-v1-...` |
| `STRIPE_SECRET_KEY` | Stripe card payments | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe frontend | `pk_live_...` |

> **Note:** `NODE_ENV=production` is set automatically by Railway/Vercel.

---

## 🚂 Option A: Deploy on Railway (Recommended)

Railway provides both compute and database in one platform. Simplest setup.

### Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Sign up with GitHub (authorizes Railway to access your repos)

### Step 2: Deploy from GitHub

1. Click **"Deploy from GitHub repo"**
2. Select **`ashxyz18/bdesh-ecom`**
3. Railway detects the `railway.toml` and `Dockerfile` automatically

### Step 3: Add PostgreSQL Database

1. In your Railway project dashboard, click **"+ New Service"**
2. Select **"Database"** → **"PostgreSQL"**
3. Wait for PostgreSQL to provision (~30 seconds)
4. Click the PostgreSQL service → **"Variables"** tab
5. Copy the `DATABASE_URL` value

### Step 4: Set Environment Variables

1. Click your **web service** (the Next.js app)
2. Go to **"Variables"** tab
3. Add these variables:

```
DATABASE_URL=<paste from PostgreSQL service, or use reference syntax>
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
NEXT_PUBLIC_BASE_URL=https://your-app.up.railway.app
OPENAI_API_KEY=sk-proj-your-key-here
```

> **Tip:** For `DATABASE_URL`, you can use Railway's reference syntax:
> Click "Add Variable" → "Reference" → select PostgreSQL → `DATABASE_URL`
> This auto-fills `${{PostgreSQL.DATABASE_URL}}`

### Step 5: Deploy

1. Railway auto-deploys when you push to GitHub
2. The `railway.toml` start command runs `prisma migrate deploy` before starting the app
3. First deploy takes 3-5 minutes (building the Docker image)
4. Watch the deploy logs for any errors

### Step 6: Get Your URL

1. Go to your web service → **"Settings"** → **"Domains"**
2. Railway gives you a `*.up.railway.app` URL
3. Update `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_BASE_URL` to match
4. Add a custom domain if you have one (e.g., `bdesh.shop`)

### Step 7: Seed the Database

After the first successful deploy, run the seed script:

1. Go to your web service → **"Settings"** → **"CLI"**
2. Or run locally:
   ```bash
   DATABASE_URL=<your-railway-db-url> npx prisma db seed
   ```

---

## ▲ Option B: Deploy on Vercel + Railway (Best Performance)

Vercel handles the frontend/API (serverless), Railway handles just the database.

### Step 1: Set Up PostgreSQL on Railway

1. Go to **https://railway.app** → **"Start a New Project"**
2. Select **"Deploy PostgreSQL"** (database only, no web service)
3. Wait for provisioning
4. Go to PostgreSQL service → **"Variables"** tab
5. Copy the **pooled** `DATABASE_URL` (the one with `proxy.rlwy.net` — important for serverless)

### Step 2: Deploy to Vercel

1. Go to **https://vercel.com** → **"Add New Project"**
2. Import **`ashxyz18/bdesh-ecom`** from GitHub
3. **Configure build settings:**

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Next.js |
   | **Root Directory** | `apps/web` (click "Edit" to change) |
   | **Build Command** | `cd ../.. && npx turbo run build --filter=@bdesh/web` |
   | **Install Command** | `cd ../.. && npm ci` |
   | **Output Directory** | `.next` (auto-detected) |

4. **Set environment variables** before clicking Deploy:

   ```
   DATABASE_URL=postgresql://postgres:xxx@proxy.rlwy.net:5432/railway
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   NEXT_PUBLIC_BASE_URL=https://your-project.vercel.app
   OPENAI_API_KEY=sk-proj-your-key-here
   ```

5. Click **"Deploy"**
6. Vercel builds the monorepo and deploys (~2-3 minutes)

### Step 3: Run Prisma Migrations

Vercel doesn't run migrations automatically. Run locally:

```bash
cd packages/database
DATABASE_URL=<railway-pooled-url> npx prisma migrate deploy
```

Or set up a GitHub Action (see below).

### Step 4: Custom Domain (Optional)

1. Vercel project → **Settings** → **Domains**
2. Add `bdesh.shop`
3. Add DNS records at your registrar:
   - `A` record → `76.76.21.21`
   - `CNAME` `www` → `cname.vercel-dns.com`
4. For wildcard subdomains (`*.bdesh.shop`): requires **Vercel Pro** ($20/mo)

---

## 🔧 GitHub Action for Auto-Migrations (Vercel Setup)

Create `.github/workflows/migrate.yml`:

```yaml
name: Deploy DB Migrations
on:
  push:
    branches: [master]
    paths: ['packages/database/prisma/**']

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: cd packages/database && npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

Add `DATABASE_URL` as a GitHub secret in **Settings → Secrets and variables → Actions**.

---

## 🐛 Troubleshooting

### Build fails on Railway/Vercel
- Check build logs for TypeScript errors
- Ensure `DATABASE_URL` is set (Prisma needs it at build time for `prisma generate`)
- The `postinstall` script in `packages/database/package.json` runs `prisma generate` automatically

### Database connection errors
- For Vercel: Use the **pooled** Railway URL (with `proxy.rlwy.net`)
- For Railway: Use the reference syntax `${{PostgreSQL.DATABASE_URL}}`
- Ensure PostgreSQL service is running before the web service starts

### Cookie/session not working in production
- Your auth uses `secure: process.env.NODE_ENV === "production"` — cookies only work over HTTPS
- Both Railway and Vercel provide HTTPS automatically
- If using a custom domain, ensure SSL is configured

### AI features not working
- Set `OPENAI_API_KEY` or `OPENROUTER_API_KEY`
- AI routes check headers first (`x-ai-api-key`), then env vars as fallback

### Payment callbacks failing
- Ensure `NEXT_PUBLIC_BASE_URL` is set correctly
- bKash/Nagad/Rocket callbacks redirect to `{NEXT_PUBLIC_BASE_URL}/api/payments/callback/{gateway}`
