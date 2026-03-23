-- CreateTable
CREATE TABLE "application_goal_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "weekStartsOn" INTEGER NOT NULL DEFAULT 1,
    "weeklyTargetCount" INTEGER NOT NULL DEFAULT 0,
    "monthlyTargetCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "application_goal_settings_pkey" PRIMARY KEY ("id")
);
