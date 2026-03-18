-- AlterTable
ALTER TABLE "opportunities" ADD COLUMN     "stage" TEXT;

-- CreateTable
CREATE TABLE "application_contacts" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_stage_logs" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_stage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "application_contacts_opportunityId_idx" ON "application_contacts"("opportunityId");

-- CreateIndex
CREATE INDEX "application_stage_logs_opportunityId_idx" ON "application_stage_logs"("opportunityId");

-- CreateIndex
CREATE INDEX "opportunities_stage_idx" ON "opportunities"("stage");

-- AddForeignKey
ALTER TABLE "application_contacts" ADD CONSTRAINT "application_contacts_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_stage_logs" ADD CONSTRAINT "application_stage_logs_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
