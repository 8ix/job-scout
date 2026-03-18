-- CreateIndex: composite index for efficient timeline queries (opportunityId + createdAt)
CREATE INDEX "application_stage_logs_opportunityId_createdAt_idx" ON "application_stage_logs"("opportunityId", "createdAt");

-- Backfill: add stage log for applied opportunities that have a stage but no logs
INSERT INTO "application_stage_logs" ("id", "opportunityId", "stage", "createdAt")
SELECT
  gen_random_uuid(),
  o.id,
  o.stage,
  COALESCE(o."appliedAt", o."createdAt")
FROM "opportunities" o
WHERE o.status = 'applied'
  AND o.stage IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "application_stage_logs" l
    WHERE l."opportunityId" = o.id
  );
