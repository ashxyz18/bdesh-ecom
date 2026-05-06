# Cloudflare Pages Quick Setup

A quick reference guide for getting your BDESH E-commerce application deployed on Cloudflare Pages.

## Prerequisites

- Cloudflare account (free or paid)
- Domain connected to Cloudflare (or use Cloudflare nameservers)
- GitHub repository connected to Cloudflare
- GitHub Actions enabled

## 1. Create Cloudflare API Token (2 minutes)

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Account Settings** → **API Tokens**
3. Click **Create Token**
4. Select **"Edit Cloudflare Workers"** template
5. Grant permissions:
   - Account > Workers & Pages > Edit
   - Zone > Page Rules > Edit
6. Copy the token (you'll need it soon)

## 2. Get Your Account ID (1 minute)

1. In Cloudflare Dashboard, go to **Account Settings** → **General**
2. Find **Account ID** and copy it

## 3. Add GitHub Secrets (2 minutes)

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these three secrets:

| Secret Name | Value |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Your Account ID from step 2 |
| `CLOUDFLARE_API_TOKEN` | Token from step 1 |
| `CLOUDFLARE_PROJECT_NAME` | `bdesh-ecommerce` (or your preferred name) |

## 4. Create Cloudflare Pages Project (3 minutes)

1. In Cloudflare Dashboard, go to **Pages**
2. Click **Create a Project**
3. Select **Connect to Git**
4. Find and select your GitHub repository
5. Click **Begin setup**
6. Set build configuration:
   - **Project name**: `bdesh-ecommerce`
   - **Production branch**: `master`
   - **Build command**: (leave empty - handled by GitHub Actions)
   - **Build output directory**: (leave empty)
7. Set environment variables:

```
NODE_ENV = production
NEXT_TELEMETRY_DISABLED = 1
DATABASE_URL = <your-database-url>
NEXTAUTH_SECRET = <generate-with-openssl-rand-base64-32>
NEXTAUTH_URL = <your-domain>
```

8. Click **Save and Deploy**

## 5. Configure Environment Variables (5 minutes)

In Cloudflare Pages project settings:

### Production Environment

```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NEXTAUTH_SECRET=<base64-random-string>
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Add API Keys (Optional)

```
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
```

## 6. Deploy (5 minutes)

Option A: **Automatic (Recommended)**
```bash
git push origin master
# GitHub Actions will automatically deploy
```

Option B: **Manual Deployment**
```bash
npm install -g wrangler
wrangler pages deploy frontend/web/.next --account-id=YOUR_ID --project-name=bdesh-ecommerce
```

## 7. Connect Custom Domain (3 minutes)

1. In Cloudflare Pages project
2. Go to **Custom domains**
3. Click **Set up a domain**
4. Enter your domain (e.g., `store.example.com`)
5. Verify DNS records
6. Done! Your site is live

## 8. Verify Deployment

Check these indicators:

✅ GitHub Actions workflow completes  
✅ Cloudflare Pages shows "Success"  
✅ Your domain loads the site  
✅ API endpoints respond  
✅ Database queries work  

## Quick Troubleshooting

| Issue | Solution |
|---|---|
| Build fails: "Module not found" | Run `npm run build:cloudflare` locally, check monorepo packages build |
| Build fails: Other errors | Check GitHub Actions logs, run `npm run build` locally |
| Environment variables missing | Redeploy after adding variables to Pages settings |
| 404 on routes | Check Next.js build configuration in `next.config.ts` |
| Database connection error | Verify DATABASE_URL format, check connection pooling |
| Build takes forever | Check for circular dependencies, run `npm run type-check` |

## Commands Reference

```bash
# Local development
npm run dev

# Local build test (full monorepo)
npm run build:cloudflare

# Local build test (just frontend)
npm run build

# Type checking
npm run type-check

# Check database migrations
npm run db:generate

# View Cloudflare deployment info
wrangler pages deployments list
wrangler pages deployment tail
```

## Monorepo Build Process

This project uses a monorepo structure with multiple packages:
- `packages/database` - Prisma database setup
- `packages/shared` - Shared schemas and utilities
- `packages/ui` - UI component library
- `packages/ai` - AI service clients
- `frontend/web` - Next.js application

The `build:cloudflare` script ensures all packages are built in the correct dependency order before deploying. This is critical for avoiding "Module not found" errors.

## Security Checklist

- [ ] Set strong `NEXTAUTH_SECRET` (min 32 characters)
- [ ] Enable HTTPS on Cloudflare (automatic)
- [ ] Set up rate limiting in Cloudflare WAF
- [ ] Enable bot protection if needed
- [ ] Review security headers in `next.config.ts`
- [ ] Add API authentication for sensitive endpoints
- [ ] Use environment-specific secrets

## Performance Tips

1. **Enable Cloudflare optimizations**
   - Mirage (image optimization)
   - Polish (auto-compression)
   - Rocket Loader (async JS)

2. **Configure caching**
   - Static assets: 1 year
   - API routes: No caching
   - HTML: Revalidate frequently

3. **Monitor performance**
   - Check Core Web Vitals
   - Monitor error rates
   - Review Real User Monitoring

## After Deployment

1. ✅ Test all pages and features
2. ✅ Verify database connectivity
3. ✅ Check payment gateway integration
4. ✅ Send test emails
5. ✅ Monitor performance metrics
6. ✅ Check error logs
7. ✅ Verify backups are configured

## Support Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub Actions Help](https://docs.github.com/en/actions)
- [Cloudflare Community](https://community.cloudflare.com/)

## Next Steps

After successful deployment:

1. Set up monitoring alerts
2. Configure automatic backups
3. Plan capacity scaling
4. Document your deployment process
5. Train team on Cloudflare dashboard

---

**Estimated Setup Time:** 20 minutes  
**Difficulty Level:** Beginner-friendly  
**Support:** See CLOUDFLARE_DEPLOYMENT.md for detailed guide
