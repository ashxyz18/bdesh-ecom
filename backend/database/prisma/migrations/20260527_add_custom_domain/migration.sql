-- Add customDomain column to stores table for direct host -> store lookups
ALTER TABLE "stores" ADD COLUMN "customDomain" TEXT;

-- Unique index so middleware can resolve domains in O(1) and prevent duplicates
CREATE UNIQUE INDEX "stores_customDomain_key" ON "stores"("customDomain");

-- Standard lookup index (matches @@index in Prisma schema for query planner hints)
CREATE INDEX "stores_customDomain_idx" ON "stores"("customDomain");
