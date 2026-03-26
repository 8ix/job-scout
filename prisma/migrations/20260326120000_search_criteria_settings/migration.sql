-- Drop legacy prompts table
DROP TABLE IF EXISTS "system_prompts";

CREATE TABLE "search_criteria_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "criteria" JSONB NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_criteria_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "search_criteria_settings" ("id", "criteria", "systemPrompt", "updatedAt")
VALUES (
  'default',
  '{"introContext":"","additionalInstructions":"","whereWork":{"positive":[],"negative":[]},"compensation":{"positive":[],"negative":[]},"companyCulture":{"positive":[],"negative":[]},"role":{"positive":[],"negative":[]},"skillsMatch":{"positive":[],"negative":[]}}'::jsonb,
  '',
  CURRENT_TIMESTAMP
);
