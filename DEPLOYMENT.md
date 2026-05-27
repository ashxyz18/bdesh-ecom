# Deployment Guide

This is the production-readiness checklist for **bdesh-ecom**. Follow each section in order before going live.

---

## 1. Environment variables

Set these in your hosting provider's environment variables panel (e.g. **Vercel → Project Settings → Environment Variables**). All must be set for **Production** *and* **Preview** environments.

### Required

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string with connection pooling. Use **PgBouncer** or **Supabase pooled URL**. | `postgresql://user:pass@pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Direct (non-pooled) URL — Prisma uses this for migrations. | `postgresql://user:pass@db.supabase.com:5432/postgres` |
| `NEXT_PUBLIC_APP_URL` | Your production URL. **If missing, canonical/OG/sitemap URLs render as `localhost:3000`.** | `https://bdesh.shop` |
| `NEXT_PUBLIC_PLATFORM_HOST` | Apex host for subdomain routing. | `bdesh.com` |

### Recommended

| Variable | Purpose |
|---|---|
| `NEXTAUTH_SECRET` / `JWT_SECRET` | Long random string. Used once auth is upgraded to cookie sessions. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console verification token. |

### Image storage (CRITICAL — see Section 5)

| Variable | Purpose |
|---|---|
| `CLOUDFLARE_R2_ACCESS_KEY_ID` / `SECRET_ACCESS_KEY` / `BUCKET_NAME` | If using R2. |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | If using Cloudinary. |

---

## 2. Database setup

Apply the Prisma schema before the first deploy:

```bash
# From the repo root
npm run db:migrate          # Runs prisma migrate deploy
# OR if migrations don't exist yet:
npm run db:push             # Pushes the schema directly
```

**Migrations included in this repo:**
- `0_init` — initial schema
- `20260527_add_custom_domain` — adds `Store.customDomain` for custom-domain routing

### Connection pooling

Prisma's serverless deployments need a pooler. On Vercel:
- **Supabase**: Use the "Connection Pooling" URL with `?pgbouncer=true&connection_limit=1`
- **Neon / Vercel Postgres**: Use the pooled URL with `?sslmode=require`

Without pooling, you'll exhaust database connections under load.

---

## 3. Verify the build

Locally before deploying:

```bash
cd frontend/web
npm install
npm run type-check     # Must pass
npm run lint           # Must pass
npm run build          # Must succeed end-to-end
```

If `build` fails because of missing env vars, make sure `.env.local` is set up with at least `DATABASE_URL`.

---

## 4. Custom domains (subdomain + bring-your-own)

The platform supports both `<store>.bdesh.com` subdomains and full custom domains via [`middleware.ts`](frontend/web/middleware.ts).

**To enable on your domain:**

1. Point an A record for `*.bdesh.com` → your hosting provider's IP / `cname.vercel-dns.com`.
2. On Vercel, add `*.bdesh.com` as a wildcard domain.
3. For each merchant's custom domain (`mystore.com`):
   - Merchant adds CNAME `www.mystore.com → cname.vercel-dns.com`
   - Merchant adds A record `mystore.com → 76.76.21.21`
   - You add `mystore.com` as a domain on Vercel (manual today; automate via Vercel API later)
   - Merchant sets the `customDomain` value in **Dashboard → Settings → Domain**

The middleware looks up the host via the cached `/api/storefront/resolve` endpoint and rewrites the request internally to `/store/<id>`.

---

## 5. ⚠️ Image uploads — **must fix before launch**

The current implementation at `app/api/stores/[storeId]/upload/route.ts` writes files to `public/uploads/` on the local filesystem.

**This will not work on Vercel.** Vercel's filesystem is read-only at runtime, and even with workarounds the disk is wiped on every deploy. Every uploaded logo/product photo will silently disappear.

### Required fix

Replace the upload handler with a cloud storage backend. Recommended options:

| Option | Cost | Setup time |
|---|---|---|
| **Cloudflare R2** | ~$0.015/GB stored, no egress | 30 min |
| **AWS S3** | ~$0.023/GB stored | 1 hr |
| **Cloudinary** | Free tier 25GB | 15 min — also gives auto-resizing |
| **UploadThing** | Free tier 2GB | 10 min — easiest |

Replace the upload handler body with the SDK's upload call and store the returned URL in the DB. The `Media` Prisma model already exists for this — just write rows there.

Until this is fixed, **disable the logo/banner/product image uploaders in the dashboard** so users don't lose data.

---

## 6. ⚠️ Authentication — known limitation

The current auth uses `localStorage` + an `x-user-id` HTTP header. **This is trivially spoofable** — any visitor can open devtools, set `localStorage.user = {id: "anyone"}`, and impersonate any account.

**Mitigation timeline:**
- Until proper sessions are built, do **not** open public signups for users with sensitive data.
- Restrict the dashboard to a small set of trusted merchants.

**Permanent fix:**
Replace with httpOnly cookie sessions. The `Session` Prisma model already exists. In short:
1. On `/api/auth/login`, generate a token, write to `Session` table, set as httpOnly cookie.
2. Add a `getServerSession()` helper to `lib/auth.ts` that reads the cookie and validates against the `Session` table.
3. Replace every `request.headers.get("x-user-id")` with `await getServerSession(request)`.

Estimated effort: half a day.

---

## 7. Payments — placeholders only

Checkout creates `Order` rows with the right `paymentMethod` (`cod`, `bkash`, `nagad`, `rocket`) but **does not actually call any payment gateway**. Cash on Delivery works fine; the others mark the order PENDING and never collect money.

Before accepting paid orders:
- bKash: integrate the **bKash Tokenized Checkout API** in `app/api/stores/[storeId]/orders/route.ts` after order creation.
- Nagad: similar.
- Stripe (international): use the existing `stripe` npm package.

---

## 8. SEO & branding assets

These files must exist in `frontend/web/public/`:

| File | Required for | Notes |
|---|---|---|
| `og-image.jpg` | Social sharing previews | 1200×630, **currently missing** |
| `logo.png` | JSON-LD structured data | 512×512 |
| `favicon.ico` | Browser tab | ✅ exists |
| `apple-touch-icon.png` | iOS bookmarks | 180×180 |

Add these before launch or links shared on Facebook/Twitter will look broken.

---

## 9. Performance — what's already optimized

Recent commits substantially improved load times:

- `/templates` is server-rendered with `revalidate=300`
- `/api/templates` is edge-cached (`s-maxage=300, stale-while-revalidate=3600`)
- Landing page (`app/page.tsx`) is now a server component
- Hero section animates via CSS, no JS-blocking first paint
- Storefront pages (`/store/[storeId]/...`) use React `cache()` to dedupe Prisma queries

If you still see slow loads:
- Confirm Vercel region matches your DB region (e.g. `iad1` for US-East databases)
- Check `next build` output for chunk sizes — `framer-motion` is the largest unused dep, can be removed
- Run `ANALYZE=true npm run build` to inspect bundles

---

## 10. Pre-launch checklist

- [ ] All env vars set in Vercel (Production AND Preview)
- [ ] `DATABASE_URL` uses connection pooler
- [ ] `npm run db:migrate` applied to production DB
- [ ] Image upload backend swapped to cloud storage
- [ ] Auth fixed OR public signup disabled until then
- [ ] `/og-image.jpg` and `/logo.png` exist in `public/`
- [ ] Real payment gateway wired (or COD-only mode confirmed)
- [ ] Custom domain DNS configured if used
- [ ] Tested signup → onboarding → add product → view storefront end to end
- [ ] Tested checkout → order appears in `/dashboard/orders`
- [ ] Tested 3 templates (modern, boutique, aurora) on a real signup
- [ ] Lighthouse score ≥ 80 on landing page
- [ ] Robots.txt and sitemap.xml return correct hostname (verify with `curl https://yourdomain.com/sitemap.xml`)

---

## 11. Monitoring after launch

Recommended additions (not currently set up):

- **Error tracking**: Sentry (free tier covers small sites)
- **Analytics**: Plausible or Vercel Analytics
- **Uptime**: BetterStack / UptimeRobot for `/api/health` (add a simple `/api/health` route that pings the DB)
- **Alerts**: notify when order count drops to 0 over a 24hr window

---

## 12. Known limitations to communicate to early users

- Image uploads will be lost on every deploy until Section 5 is done
- Account security is weak (Section 6) — internal/trusted users only
- Online payments are placeholders — only COD is real
- DNS / SSL for custom domains is not yet automated — manual per-customer setup
