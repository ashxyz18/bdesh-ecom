FROM node:20-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Copy everything first (so workspace packages are available)
COPY . .

# Install all dependencies (workspace-aware) - cache bust 2026-05-05
RUN npm ci --include-workspace-root --ignore-scripts

# Install autoprefixer globally for Turbopack
RUN npm install -g autoprefixer@10.4.20

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build packages first, then web app
RUN cd packages/shared && npx tsc
RUN cd packages/database && npx tsc
RUN cd packages/ui && npx tsc
RUN cd packages/ai && npx tsc
RUN cd apps/web && NEXT_TURBOPACK=0 npm run build

# Setup user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app/apps/web

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npx", "next", "start"]
