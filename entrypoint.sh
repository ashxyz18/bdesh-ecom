#!/bin/sh
set -e

echo "Checking database connection..."
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set. Cannot run migrations."
  exit 1
fi

echo "Running database migrations..."
npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma

echo "Starting application..."
exec node frontend/web/server.js
