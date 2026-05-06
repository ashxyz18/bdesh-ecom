# Cloudflare Deployment Guide

This guide explains how to deploy the BDESH E-commerce website to Cloudflare Pages.

## Prerequisites

1. **Cloudflare Account**: Create an account at [cloudflare.com](https://cloudflare.com)
2. **Domain**: Have your domain connected to Cloudflare
3. **Wrangler CLI**: Install with `npm install -g @cloudflare/wrangler`
4. **API Token**: Generate from Cloudflare Dashboard

## Setup Instructions

### 1. Connect Domain to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Add your domain/site
3. Update nameservers to Cloudflare's nameservers

### 2. Create API Token

1. Go to **Account Settings** → **API Tokens**
2. Click **Create Token**
3. Use "Edit Cloudflare Workers" template or create custom token with:
   - Zone > Pages Builds > Edit
   - Zone > Pages > Build Cache
   - Account > Workers & Pages > Edit

### 3. Configure Local Environment

```bash
# Create .env.cloudflare file
cp .env.example .env.cloudflare

# Add Cloudflare variables:
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_PROJECT_NAME=bdesh-ecommerce
```

### 4. Update wrangler.toml

Edit `wrangler.toml`:

```toml
account_id = "your_cloudflare_account_id"
```

### 5. Deploy to Cloudflare Pages

**Option A: Using Wrangler CLI**

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Deploy using Wrangler
npm install -g @cloudflare/wrangler
wrangler pages deploy frontend/web/.next/standalone
```

**Option B: Using GitHub Actions (Recommended)**

1. Add secrets to GitHub repository:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`

2. The workflow in `.github/workflows/cloudflare-deploy.yml` will automatically deploy on push to main branch

### 6. Environment Variables in Cloudflare

Add environment variables in Cloudflare Pages project settings:

1. Go to **Pages** → **Your Project** → **Settings** → **Environment variables**
2. Add all required variables from `.env.example`:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `OPENAI_API_KEY` (or other AI services)
   - Payment gateway credentials
   - Email service credentials

### 7. Database Configuration

For production, update `DATABASE_URL` to point to a production database:

- **Option 1**: Neon PostgreSQL (recommended for serverless)
- **Option 2**: Supabase
- **Option 3**: Railway
- **Option 4**: Self-hosted PostgreSQL

### 8. Custom Domain Setup

1. Go to **Pages** → **Your Project** → **Custom Domains**
2. Add your custom domain
3. Update DNS records if needed

## Performance Optimizations

Cloudflare provides:

- **Global CDN**: Automatic content distribution
- **Automatic caching**: For static assets
- **Web optimization**: Mirage, Polish, Rocket Loader
- **Security**: DDoS protection, WAF rules
- **Analytics**: Real User Monitoring (RUM)

## Monitoring & Debugging

### View Deployment Logs

```bash
wrangler pages deployments list
wrangler pages deployment tail
```

### Real-time Logs

In Cloudflare Dashboard → Pages → Your Project → Logs

### Performance Metrics

- Lighthouse reports available in deployment details
- Core Web Vitals in Analytics
- Real User Monitoring (RUM) analytics

## Rollback

To rollback to previous deployment:

1. Cloudflare Dashboard → Pages → Deployments
2. Click on previous deployment
3. Click "Rollback to this deployment"

## Troubleshooting

### Build Failures

Check `wrangler.toml`:
- Verify `command` matches your build script
- Ensure `cwd` points to correct directory

### 404 Errors on Routes

Next.js routes should work automatically. If not:
- Check `functions/_middleware.ts`
- Verify `output: "standalone"` in `next.config.ts`

### Environment Variables Not Loading

1. Check Cloudflare Pages settings
2. Verify variable names match exactly
3. Redeploy after adding variables

### Database Connection Issues

- Use connection pooling (Neon recommended)
- Verify DATABASE_URL format
- Check firewall rules on database side

## Cost Estimation

Cloudflare Pages pricing:
- **Free**: 500 builds/month, unlimited requests
- **Pro**: $20/month (unlimited builds)

Additional services:
- Workers: $0.50 per million requests
- KV Storage: $0.50 per million operations

## Next Steps

1. Monitor performance in Cloudflare Analytics
2. Set up Page Rules for caching
3. Configure WAF rules for security
4. Enable Bot Management if needed
5. Set up email notifications for errors

## Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/frameworks/nextjs/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/wrangler/cli-wrangler/)
