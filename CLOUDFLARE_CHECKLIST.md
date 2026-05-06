# Cloudflare Deployment Checklist

Use this checklist to ensure your project is ready for Cloudflare Pages deployment.

## Pre-Deployment

- [ ] Cloudflare account created and verified
- [ ] Domain connected to Cloudflare or using Cloudflare nameservers
- [ ] API Token created in Cloudflare Dashboard
- [ ] Account ID obtained from Cloudflare Dashboard

## Local Setup

- [ ] Node.js 18+ installed
- [ ] `npm install` completed successfully
- [ ] `.env.cloudflare` file created with all required variables
- [ ] `npm run build` completes without errors
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes (or at least no critical errors)

## Code Configuration

- [ ] `wrangler.toml` updated with your Cloudflare Account ID
- [ ] `cloudflare.json` reviewed and updated if needed
- [ ] `next.config.ts` has `output: "standalone"` configuration
- [ ] Security headers configured in `next.config.ts`
- [ ] Functions middleware files created and reviewed
  - [ ] `functions/_middleware.ts` - Security headers
  - [ ] `functions/[[path]].ts` - Catch-all routing

## Environment Variables

- [ ] `CLOUDFLARE_ACCOUNT_ID` set in GitHub secrets
- [ ] `CLOUDFLARE_API_TOKEN` set in GitHub secrets
- [ ] `CLOUDFLARE_PROJECT_NAME` set in GitHub secrets
- [ ] Database connection string validated (e.g., Neon, Supabase)
- [ ] Authentication secrets (`NEXTAUTH_SECRET`, `JWT_SECRET`) generated
- [ ] API keys configured (OpenAI, Google, Groq, etc.)
- [ ] Payment gateway credentials verified
- [ ] Email service credentials configured

## Cloudflare Dashboard Setup

- [ ] Cloudflare Pages project created
- [ ] Project name set to match `CLOUDFLARE_PROJECT_NAME`
- [ ] Build command set to `npm run build`
- [ ] Build output directory set to `frontend/web/.next/standalone`
- [ ] Build cwd set to `frontend/web`
- [ ] All environment variables added in Pages Settings
- [ ] Custom domain connected (if desired)
- [ ] SSL/TLS certificate configured

## Performance & Security

- [ ] Caching rules configured for static assets
- [ ] Cache TTL set appropriately for different content types
- [ ] Security headers reviewed and tested
- [ ] CORS configuration verified for API routes
- [ ] CSP (Content Security Policy) validated
- [ ] HSTS (HTTP Strict Transport Security) enabled
- [ ] WAF rules reviewed (optional)
- [ ] DDoS protection enabled (default for all Cloudflare users)

## GitHub Integration

- [ ] GitHub repository connected to Cloudflare Pages
- [ ] GitHub Actions workflows created:
  - [ ] `.github/workflows/cloudflare-deploy.yml`
  - [ ] `.github/workflows/build-test.yml`
- [ ] Branch protection rules configured (optional)
- [ ] Deploy previews enabled for pull requests
- [ ] Notifications configured for deployment status

## Database & Services

- [ ] Production database set up (Neon PostgreSQL recommended)
- [ ] Database URL configured in Cloudflare Pages environment
- [ ] Database connection pooling enabled (important for serverless)
- [ ] Email service (SMTP) configured and tested
- [ ] Payment gateways (Stripe, bKash, Nagad) configured
- [ ] AI service API keys configured (OpenAI, Google, Groq, etc.)

## Monitoring & Logging

- [ ] Cloudflare Analytics enabled
- [ ] Real User Monitoring (RUM) enabled
- [ ] Error tracking configured (optional)
- [ ] Performance monitoring set up
- [ ] Deployment notifications configured
- [ ] GitHub Actions logs accessible and reviewed

## Testing

- [ ] Production build tested locally
- [ ] API endpoints tested in production environment
- [ ] Authentication flow tested
- [ ] Payment gateway tested in production mode (or sandbox)
- [ ] Email notifications tested
- [ ] Images served correctly from CDN
- [ ] Static assets cached properly
- [ ] Database queries working correctly

## Deployment

- [ ] First deployment completed successfully
- [ ] Deployment logs reviewed for errors
- [ ] Website accessible at Cloudflare domain
- [ ] Custom domain working correctly
- [ ] All pages loading without errors
- [ ] API endpoints responding correctly
- [ ] Database queries working
- [ ] External APIs (payment, email, AI) working

## Post-Deployment

- [ ] Monitor deployment metrics for 24 hours
- [ ] Check Cloudflare Analytics for errors
- [ ] Review Real User Monitoring data
- [ ] Performance metrics reviewed (Core Web Vitals)
- [ ] Security headers verified in browser DevTools
- [ ] Set up continuous monitoring and alerting
- [ ] Document any issues encountered
- [ ] Plan for scaling if needed
- [ ] Schedule regular backups

## Documentation

- [ ] Deployment process documented
- [ ] Team members trained on deployment
- [ ] Troubleshooting guide created
- [ ] Rollback procedure documented
- [ ] Emergency contact list updated
- [ ] README updated with Cloudflare information

## Additional Notes

- **Edge Cases to Test**: Internationalization, subdomain routing, dynamic routes
- **Common Issues**: CORS errors, missing environment variables, database connection pooling
- **Performance Targets**: 
  - First Contentful Paint (FCP): < 1.8s
  - Largest Contentful Paint (LCP): < 2.5s
  - Cumulative Layout Shift (CLS): < 0.1

---

**Status**: Ready for Cloudflare Pages deployment ✅

Last Updated: May 7, 2026
