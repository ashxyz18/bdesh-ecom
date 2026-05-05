FROM node:20-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /app/

# Copy only package files first for better caching
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/*/package*.json ./packages/

# Install all dependencies (workspace-aware)
RUN npm install --ignore-scripts

# Copy source code
COPY . .

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build with Turbopack disabled
RUN cd apps/web && NEXT_TURBOPACK=0 npm run build

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
