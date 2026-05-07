# Stage 1: Build
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Dummy DATABASE_URL/DIRECT_URL for prisma generate (doesn't need real DB connection)
ARG DATABASE_URL=postgresql://dummy:dummy@dummy:5432/dummy
ARG DIRECT_URL=postgresql://dummy:dummy@dummy:5432/dummy
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL

# Copy package files first for better layer caching
COPY package*.json ./
COPY packages/database/package.json ./packages/database/
COPY packages/ai/package.json ./packages/ai/
COPY packages/ui/package.json ./packages/ui/
COPY frontend/web/package.json ./frontend/web/
COPY packages/shared/package.json ./packages/shared/

# Copy prisma schema BEFORE npm ci so that the postinstall script
# "prisma generate" in @bdesh/database can find it
COPY packages/database/prisma ./packages/database/prisma

# Copy file: dependencies that npm ci needs to resolve
COPY src/dataconnect-generated ./src/dataconnect-generated

# Install dependencies (without --ignore-scripts so prisma engine downloads)
# The @bdesh/database postinstall will run "prisma generate" and succeed
# because the schema is already copied above
RUN npm ci --include-workspace-root

# Copy remaining source code
COPY . .

# Re-run prisma generate explicitly to ensure client is built with full source
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build packages in dependency order
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

# Copy standalone output from builder
COPY --from=builder /app/frontend/web/.next/standalone ./
COPY --from=builder /app/frontend/web/.next/static ./frontend/web/.next/static
COPY --from=builder /app/frontend/web/public ./frontend/web/public

# Copy Prisma files needed for runtime migrations
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Copy entrypoint script
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations then start the app
CMD ["./entrypoint.sh"]
