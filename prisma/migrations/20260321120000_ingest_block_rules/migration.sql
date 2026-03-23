-- CreateEnum
CREATE TYPE "IngestBlockScope" AS ENUM ('company', 'title', 'any');

-- CreateTable
CREATE TABLE "ingest_block_rules" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "pattern" TEXT NOT NULL,
    "scope" "IngestBlockScope" NOT NULL,
    "note" TEXT,

    CONSTRAINT "ingest_block_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ingest_block_rules_enabled_idx" ON "ingest_block_rules"("enabled");
