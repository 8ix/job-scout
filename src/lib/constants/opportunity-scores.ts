/**
 * Bands for "score distribution" charts: counts rows in `opportunities` by numeric `score`.
 * This is unrelated to the **Disqualified** page / `rejections` table (separate listings).
 */
export const OPPORTUNITY_SCORE_DISTRIBUTION_BANDS = [
  { band: "0–5", min: 0, max: 5 },
  { band: "6", min: 6, max: 6 },
  { band: "7", min: 7, max: 7 },
  { band: "8", min: 8, max: 8 },
  { band: "9", min: 9, max: 9 },
  { band: "10", min: 10, max: 10 },
] as const;

export type OpportunityScoreBandLabel = (typeof OPPORTUNITY_SCORE_DISTRIBUTION_BANDS)[number]["band"];
