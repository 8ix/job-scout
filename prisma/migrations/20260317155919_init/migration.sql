-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "workingModel" TEXT,
    "listingType" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "score" INTEGER NOT NULL,
    "verdict" TEXT NOT NULL,
    "matchReasons" TEXT,
    "redFlags" TEXT,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postedAt" TIMESTAMP(3),

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rejections" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "url" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "redFlags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rejections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_prompts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "userPromptTemplate" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "system_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_heartbeats" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "jobsReceived" INTEGER NOT NULL,
    "jobsNew" INTEGER NOT NULL,
    "jobsScored" INTEGER NOT NULL,
    "jobsOpportunity" INTEGER NOT NULL,
    "ranAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feed_heartbeats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "opportunities_createdAt_idx" ON "opportunities"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "opportunities_score_idx" ON "opportunities"("score" DESC);

-- CreateIndex
CREATE INDEX "opportunities_status_idx" ON "opportunities"("status");

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_source_jobId_key" ON "opportunities"("source", "jobId");

-- CreateIndex
CREATE INDEX "rejections_createdAt_idx" ON "rejections"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "rejections_source_idx" ON "rejections"("source");

-- CreateIndex
CREATE INDEX "feed_heartbeats_ranAt_idx" ON "feed_heartbeats"("ranAt" DESC);
