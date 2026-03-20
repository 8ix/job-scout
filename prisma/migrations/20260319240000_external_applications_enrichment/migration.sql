-- Nullable AI fields (existing rows unchanged)
ALTER TABLE "opportunities" ALTER COLUMN "verdict" DROP NOT NULL;

-- Enrichment columns
ALTER TABLE "opportunities" ADD COLUMN IF NOT EXISTS "appliedVia" TEXT;
ALTER TABLE "opportunities" ADD COLUMN IF NOT EXISTS "recruiterContact" TEXT;
ALTER TABLE "opportunities" ADD COLUMN IF NOT EXISTS "fullJobSpecification" TEXT;

-- Reserved feed for manual/API applications
INSERT INTO "feeds" ("id", "name", "createdAt")
SELECT gen_random_uuid(), 'manual', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "feeds" WHERE "name" = 'manual');

CREATE TABLE "application_scheduled_events" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_scheduled_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "application_scheduled_events_scheduledAt_idx" ON "application_scheduled_events"("scheduledAt");
CREATE INDEX "application_scheduled_events_opportunityId_idx" ON "application_scheduled_events"("opportunityId");

ALTER TABLE "application_scheduled_events" ADD CONSTRAINT "application_scheduled_events_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
