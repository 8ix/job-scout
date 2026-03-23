-- CreateTable
CREATE TABLE "application_correspondence" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_correspondence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "application_correspondence_opportunityId_idx" ON "application_correspondence"("opportunityId");

-- CreateIndex
CREATE INDEX "application_correspondence_receivedAt_idx" ON "application_correspondence"("receivedAt");

-- AddForeignKey
ALTER TABLE "application_correspondence" ADD CONSTRAINT "application_correspondence_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
