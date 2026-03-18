-- CreateTable
CREATE TABLE "feeds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feeds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feeds_name_key" ON "feeds"("name");

-- Seed default feeds
INSERT INTO "feeds" ("id", "name") VALUES
  (gen_random_uuid(), 'Adzuna'),
  (gen_random_uuid(), 'Reed'),
  (gen_random_uuid(), 'JSearch');
