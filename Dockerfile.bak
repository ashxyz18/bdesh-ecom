FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Build stage
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_TURBOPACK=0
ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY packages/ai/package.json ./packages/ai/

# Install dependencies
RUN npm install --ignore-scripts

# Generate Prisma client
COPY packages/database ./packages/database
RUN cd packages/database && npx prisma generate

# Copy all source code
COPY . .

# Build the web app (disable Turbopack, use npx for turbo)
RUN npx turbo run build --filter=@bdesh/web

# Production stage
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app/apps/web

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./public

# Copy Prisma files for migrations
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
