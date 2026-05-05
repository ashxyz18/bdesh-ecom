FROM node:20-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_TURBOPACK=0
ENV NODE_ENV=production

# Copy all package files first
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/database/package*.json ./packages/database/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/ai/package*.json ./packages/ai/

# Install dependencies
RUN npm install --ignore-scripts

# Generate Prisma client
COPY packages/database ./packages/database
RUN cd packages/database && npx prisma generate

# Copy all source code
COPY . .

# Build the web app
RUN npx turbo run build --filter=@bdesh/web

# Setup user for running the app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app/apps/web

# Copy standalone output if using output: "standalone"
# COPY --from=builder /app/apps/web/.next/standalone ./
# COPY --from=builder /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npx", "next", "start"]
