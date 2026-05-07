#!/bin/sh
set -e

echo "Running database migrations..."
cd packages/database
npx --no-install prisma migrate deploy --schema=prisma/schema.prisma
cd ../..

echo "Starting application..."
exec node frontend/web/server.js
