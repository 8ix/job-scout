-- Set stage='Applied' for existing opportunities with status='applied' and NULL stage
UPDATE "opportunities"
SET "stage" = 'Applied'
WHERE "status" = 'applied' AND "stage" IS NULL;
