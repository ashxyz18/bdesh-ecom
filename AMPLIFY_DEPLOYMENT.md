# AWS Amplify Deployment Guide

## Prerequisites
- AWS Account with Amplify Console access
- GitHub/GitLab/Bitbucket repository connected to Amplify
- Supabase project with PostgreSQL database

## Step 1: Connect Repository

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app" → "Host web app"**
3. Connect your Git provider and select the repository
4. Select the **main/production** branch

## Step 2: Build Settings

Amplify will auto-detect the `amplify.yml` in the repo root. Verify:
- **Build specification**: Should show the contents of `amplify.yml`
- **Monorepo**: Amplify should detect the root as the app root (NOT `frontend/web`)

## Step 3: Environment Variables

Add these in the Amplify Console → **App settings** → **Environment variables**:

### Required
| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.yqtfndxryhzjduaafvqi:58kJ99cTFsHpGBoG@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | Pooled connection |
| `DIRECT_URL` | `postgresql://postgres.yqtfndxryhzjduaafvqi:58kJ99cTFsHpGBoG@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres` | Direct connection for migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yqtfndxryhzjduaafvqi.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_y6kuTzPLxpO_Ux-XxrUr9A_fq3vGGiU` | Supabase anon key |
| `NEXTAUTH_SECRET` | *(generate with `openssl rand -base64 32`)* | Must be a real secret, not `...` |
| `NEXTAUTH_URL` | `https://your-app.amplifyapp.com` | Your Amplify app URL |

### Optional
| Variable | Value | Notes |
|---|---|---|
| `RUN_MIGRATIONS` | `true` | Set to run `prisma migrate deploy` at build time |
| `MIGRATE_SECRET` | *(random string)* | Protects the `/api/migrate` endpoint |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.amplifyapp.com` | Public app URL |
| `OPENAI_API_KEY` | `sk-proj-...` | For AI features |
| `SMTP_HOST` | `smtp.example.com` | Email service |
| `SMTP_PORT` | `587` | Email port |
| `SMTP_USER` | `noreply@bdesh.shop` | Email user |
| `SMTP_PASS` | *(your smtp password)* | Email password |
| `SMTP_FROM` | `noreply@bdesh.shop` | Sender address |

## Step 4: Database Migrations

You have two options:

### Option A: Build-time migrations (recommended)
Set `RUN_MIGRATIONS=true` in Amplify env vars. Migrations run during the build phase.

### Option B: Runtime migrations via API
After each deployment, call the migration endpoint:
```bash
curl -X POST https://your-app.amplifyapp.com/api/migrate \
  -H "Authorization: Bearer YOUR_MIGRATE_SECRET"
```

## Step 5: Deploy

1. Click **"Save and deploy"**
2. Monitor the build logs for errors
3. Once deployed, verify:
   - Visit `https://your-app.amplifyapp.com/api/health` — should return `{"status":"healthy"}`
   - If using runtime migrations, call `/api/migrate` first

## Troubleshooting

### Build fails: "Artifact directory doesn't exist: dist"
- Ensure `amplify.yml` exists at the repo root with `baseDirectory: frontend/web/.next`

### Build fails: "prisma: not found"
- The `amplify.yml` runs `npx prisma generate` in preBuild — ensure `@prisma/client` and `prisma` are in `packages/database/package.json`

### API routes return 500
- Check `DATABASE_URL` and `DIRECT_URL` are set correctly
- Verify Supabase allows connections from AWS IP ranges
- Check Amplify function logs in CloudWatch

### Images not loading
- Amplify serves from `frontend/web/public` — ensure images are in the repo
- Remote images need `remotePatterns` in `next.config.ts` (already configured)

### Custom domain
1. Go to **App settings** → **Domain management**
2. Add your custom domain (e.g., `bdesh.shop`)
3. Configure DNS records as instructed
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the custom domain
