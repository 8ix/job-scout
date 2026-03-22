/**
 * Bands for the **score distribution** chart and `/api/stats` `byScore`: scores **6–10** only.
 * Scores **0–5** are treated as the disqualification baseline in typical setups and are omitted
 * from the chart so the view stays useful as volume grows (see `ScoreChart` disclaimer).
 *
 * Underlying counts still include all scores from opportunities and orphan rejections in SQL;
 * only the folded bands shown to users start at 6.
 */
export const OPPORTUNITY_SCORE_DISTRIBUTION_BANDS = [
  { band: "6", min: 6, max: 6 },
  { band: "7", min: 7, max: 7 },
  { band: "8", min: 8, max: 8 },
  { band: "9", min: 9, max: 9 },
  { band: "10", min: 10, max: 10 },
] as const;

export type OpportunityScoreBandLabel = (typeof OPPORTUNITY_SCORE_DISTRIBUTION_BANDS)[number]["band"];
