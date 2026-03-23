-- AlterTable
ALTER TABLE "rejections" ADD COLUMN     "ingest_blocklist_rule_id" TEXT,
ADD COLUMN     "ingest_blocklist_pattern" TEXT,
ADD COLUMN     "ingest_blocklist_scope" TEXT;

-- CreateIndex
CREATE INDEX "rejections_source_jobId_idx" ON "rejections"("source", "jobId");
