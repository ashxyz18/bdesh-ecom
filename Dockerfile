FROM node:20-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Copy all source code
COPY . .

# Install dependencies (workspace-aware)
RUN npm install --ignore-scripts

# Install autoprefixer at root level for Turbopack resolution
RUN npm install autoprefixer@10.4.20 --save-dev

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build with Turbopack disabled
RUN NEXT_TURBOPACK=0 npx turbo run build --filter=@bdesh/web

# Setup user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app/apps/web

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npx", "next", "start", "-p", "3000"]
