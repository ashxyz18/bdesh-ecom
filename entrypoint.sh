#!/bin/sh
set -e

echo "Running database migrations..."
npm exec -- prisma migrate deploy --schema=packages/database/prisma/schema.prisma

echo "Starting application..."
exec node frontend/web/server.js
