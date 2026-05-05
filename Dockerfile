FROM node:20-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Copy everything
COPY . .

# Install all dependencies (workspace-aware)
RUN npm install --ignore-scripts

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build packages first, then web app directly (bypass turbo, use webpack)
RUN cd packages/shared && npx tsc
RUN cd packages/database && npx tsc
RUN cd packages/ui && npx tsc
RUN cd packages/ai && npx tsc
RUN cd apps/web && npx next build

# Setup user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app/apps/web

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npx", "next", "start", "-p", "3000"]
