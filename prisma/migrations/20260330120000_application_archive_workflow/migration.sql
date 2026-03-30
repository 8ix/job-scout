-- AlterTable
ALTER TABLE "opportunities" ADD COLUMN "application_closed_reason" TEXT;

-- CreateTable
CREATE TABLE "application_workflow_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "staleIdleDays" INTEGER NOT NULL DEFAULT 40,

    CONSTRAINT "application_workflow_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "application_workflow_settings" ("id", "staleIdleDays") VALUES ('default', 40);

-- CreateIndex
CREATE INDEX "opportunities_application_closed_reason_idx" ON "opportunities"("application_closed_reason");
