# Stage 1: Build
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Copy package files first for better layer caching
COPY package*.json ./
COPY packages/database/package.json ./packages/database/
COPY packages/ai/package.json ./packages/ai/
COPY packages/ui/package.json ./packages/ui/
COPY frontend/web/package.json ./frontend/web/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm ci --include-workspace-root --ignore-scripts

# Copy source code
COPY . .

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build packages
RUN cd packages/shared && npx tsc
RUN cd packages/database && npx tsc
RUN cd packages/ai && npx tsc

# Build web app
RUN cd frontend/web && npm run build

# Stage 2: Production (using standalone output)
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy ONLY standalone output from builder
# Standalone includes all required runtime files
COPY --from=builder /app/frontend/web/.next/standalone ./
COPY --from=builder /app/frontend/web/.next/static ./frontend/web/.next/static
COPY --from=builder /app/frontend/web/public ./frontend/web/public

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use standalone server.js built by Next.js
CMD ["node", "server.js"]
