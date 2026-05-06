# Cloudflare Pages Deployment Troubleshooting

This document explains the build errors encountered during Cloudflare Pages deployment and how to resolve them.

## Error: Schema Validation Failed

**Error Message:**
```
Schema validation failed: 
- invalid_union_variant for type field receiving 'function'
```

**Root Cause:**
The initial `wrangler.toml` configuration had invalid settings:
- `type = "javascript"` - Not a valid enum value for Wrangler
- Incompatible configuration format for Cloudflare Pages

**Solution:**
Fixed the `wrangler.toml` to use proper Cloudflare Workers configuration format:
- Removed invalid `type` field
- Added proper `main` entry point
- Configured correct environment variables
- Used standard Cloudflare configuration format

## Build Directory Issues

**Issue:**
The `.next/standalone` directory format is meant for Docker containers, not Cloudflare Pages.

**Solution:**
Updated GitHub Actions workflow to use `.next` directory instead:
- `.next` contains all compiled Next.js output
- Cloudflare Pages can serve both static and dynamic content from this directory
- Functions middleware handles dynamic routes

## Error: Module Not Found (Monorepo Packages)

**Error Message:**
```
Module not found: Can't resolve '@bdesh/database'
Module not found: Can't resolve '@bdesh/shared'
```

**Root Cause:**
In a monorepo setup, the monorepo packages must be built before the frontend can import them. The Cloudflare Pages build was only running the frontend build without building the dependencies first.

**Solution:**
Created a `build:cloudflare` script that builds all packages in the correct order:

```json
"build:cloudflare": "npm run build && npm run build --workspace=@bdesh/web -- --no-fork"
```

Updated configuration files:
- `wrangler.toml`: Changed build command to `npm run build:cloudflare` from root (`.`)
- `.cloudflare-pages`: Changed build command to `npm run build:cloudflare` from root (`.`)
- `.github/workflows/cloudflare-deploy.yml`: Uses `npm run build:cloudflare` instead of `npm run build`

**Build Order:**
1. Turbo builds all packages in dependency order:
   - `@bdesh/database` (Prisma setup)
   - `@bdesh/shared` (Schemas, utilities)
   - `@bdesh/ui` (Component library)
   - `@bdesh/ai` (AI services)
2. Next.js build in `frontend/web` with all dependencies available
3. Output placed in `frontend/web/.next` for Cloudflare deployment

**Configuration Files

### Updated Files

1. **wrangler.toml**
   - Main configuration for Cloudflare Workers integration
   - Defines build command, environment variables, and routes
   - Uses root directory build to support monorepo

2. **.cloudflare-pages**
   - Cloudflare Pages specific configuration
   - Defines caching rules for static and dynamic assets
   - Sets environment variables per deployment environment
   - Publishes from `frontend/web/.next`

3. **package.json**
   - Root package.json includes `build:cloudflare` script
   - Ensures proper build sequence for monorepo

4. **.github/workflows/cloudflare-deploy.yml**
   - GitHub Actions workflow for CI/CD
   - Builds Next.js project with dependencies
   - Deploys to Cloudflare Pages with proper credentials
   - Includes database client generation step

## Deployment Steps

### 1. Local Prerequisites

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Build locally to verify
npm run build
```

### 2. GitHub Actions Deployment

The workflow automatically deploys when you push to `main`, `master`, or `develop` branches:

1. **Checkout code** - Fetch latest repository
2. **Setup Node.js** - Use Node 20 LTS
3. **Install dependencies** - Run npm ci
4. **Generate database client** - Create Prisma client
5. **Build project** - Run turbo build
6. **Deploy to Cloudflare** - Upload to Cloudflare Pages
7. **Comment PR** - Add deployment info to pull requests

### 3. Environment Variables

Add these secrets to GitHub repository:

```
CLOUDFLARE_ACCOUNT_ID    - From Cloudflare dashboard
CLOUDFLARE_API_TOKEN     - Create in Cloudflare settings
CLOUDFLARE_PROJECT_NAME  - Your Pages project name
```

Also configure in Cloudflare Pages dashboard:

```
DATABASE_URL             - Neon, Supabase, or other PostgreSQL
NEXTAUTH_SECRET          - Generate with: openssl rand -base64 32
NEXTAUTH_URL             - Your deployment domain
NODE_ENV                 - production
```

### 4. Caching Configuration

The `.cloudflare-pages` file defines caching rules:

- **Static Assets** (JS, CSS, images, fonts): 1 year cache
- **API Routes**: No caching (always fresh)
- **HTML Pages**: Served fresh each time

## Common Issues & Solutions

### Issue: Build Takes Too Long

**Solution:**
- Check for circular dependencies in packages
- Ensure all monorepo packages build successfully locally
- Review package.json dependencies for unnecessary packages

### Issue: Database Connection Errors

**Solution:**
- Use Neon or Supabase for serverless PostgreSQL
- Enable connection pooling
- Test DATABASE_URL format: `postgresql://user:pass@host:port/db`

### Issue: Missing Environment Variables

**Solution:**
1. Add variables to Cloudflare Pages Settings
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)

### Issue: 404 Errors on API Routes

**Solution:**
- Functions middleware routes all requests correctly
- Check `.well-known/` routes if using special files
- Verify API route files are in `/app/api/` directory

### Issue: Type Errors During Build

**Solution:**
- Run `npm run type-check` locally
- Check packages for TypeScript compilation errors
- Update TypeScript definitions if needed

## Performance Optimization

### Enable Cloudflare Features

1. **Mirage** - Image optimization and format selection
2. **Polish** - Automatic image compression
3. **Rocket Loader** - Async JavaScript loading
4. **Web Analytics** - Real User Monitoring (RUM)

### Core Web Vitals Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Optimization Tips

- Minimize CSS and JavaScript
- Use Next.js Image component for images
- Enable incremental static generation
- Configure proper cache headers
- Use Cloudflare's global CDN

## Rollback Procedure

If deployment causes issues:

1. Go to Cloudflare Dashboard
2. Pages → Your Project → Deployments
3. Click on previous working deployment
4. Click "Rollback to this deployment"

## Monitoring Deployment

### View Build Logs

```bash
# Using Wrangler
wrangler pages deployments list
wrangler pages deployment tail
```

### Check Analytics

1. Cloudflare Dashboard
2. Pages → Your Project → Analytics
3. View Real User Monitoring data
4. Check error rates and performance

### Debugging

1. Check GitHub Actions logs for build errors
2. View Cloudflare Pages build output
3. Check browser DevTools for runtime errors
4. Monitor server logs for API errors

## Next Steps

1. ✅ Configure Cloudflare account and API token
2. ✅ Add GitHub repository secrets
3. ✅ Push to main branch to trigger deployment
4. ✅ Monitor build in Cloudflare dashboard
5. ✅ Test deployed application
6. ✅ Set up custom domain
7. ✅ Monitor performance metrics

## Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/frameworks/nextjs/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/wrangler/)
- [Next.js Build Configuration](https://nextjs.org/docs/app/api-reference/next-config-js)

## Support

For additional issues:

1. Check Cloudflare Status Page
2. Review GitHub Actions logs
3. Check Next.js documentation
4. Review Cloudflare Community Forums
5. Contact Cloudflare Support

---

**Last Updated:** May 7, 2026
**Configuration Version:** 1.1
**Next.js Version:** 16.2.4
**Cloudflare Pages:** Ready for Production
