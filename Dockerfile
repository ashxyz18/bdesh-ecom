# Stage 1: Build
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Copy package files first for better layer caching
COPY package*.json ./
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY packages/ai/package.json ./packages/ai/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/

# Install dependencies
RUN npm ci --include-workspace-root --ignore-scripts

# Install autoprefixer globally
RUN npm install -g autoprefixer@10.4.20

# Copy source code
COPY . .

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build packages
RUN cd packages/shared && npx tsc
RUN cd packages/database && npx tsc
RUN cd packages/ui && npx tsc
RUN cd packages/ai && npx tsc

# Build web app
RUN cd apps/web && NEXT_TURBOPACK=0 npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only necessary files from builder
COPY --from=builder /app/apps/web/.next apps/web/.next
COPY --from=builder /app/apps/web/public apps/web/public
COPY --from=builder /app/apps/web/package.json apps/web/
COPY --from=builder /app/apps/web/next.config.ts apps/web/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/web

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npx", "next", "start"]
