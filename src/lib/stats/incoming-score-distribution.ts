import type { PrismaClient } from "@/generated/prisma/client";
import { OPPORTUNITY_SCORE_DISTRIBUTION_BANDS } from "@/lib/constants/opportunity-scores";

type ScoreCountRow = { score: number; count: bigint };

/**
 * Fold per-score counts into dashboard/API bands (6 … 10 only; see `OPPORTUNITY_SCORE_DISTRIBUTION_BANDS`).
 */
export function bucketHistogramIntoBands(
  histogram: Map<number, number>
): { band: string; count: number }[] {
  return OPPORTUNITY_SCORE_DISTRIBUTION_BANDS.map(({ band, min, max }) => {
    let count = 0;
    for (let s = min; s <= max; s++) {
      count += histogram.get(s) ?? 0;
    }
    return { band, count };
  });
}

/**
 * **Incoming score distribution**: every job counted once, using the **system/scoring** score.
 *
 * - All rows in `opportunities` (any `status`, including user-disqualified) use `opportunities.score`.
 * - Rows only in `rejections` (e.g. API disqualified with no opportunity row) use `rejections.score`.
 * - Rejections that duplicate an existing opportunity (`source` + `jobId`) are skipped so we never
 *   double-count (e.g. applied → stage disqualified creates both records).
 */
export async function getIncomingScoreDistribution(
  prisma: PrismaClient
): Promise<{ band: string; count: number }[]> {
  const rows = await prisma.$queryRaw<ScoreCountRow[]>`
    WITH combined AS (
      SELECT "score" FROM opportunities
      UNION ALL
      SELECT r."score"
      FROM rejections r
      WHERE NOT EXISTS (
        SELECT 1 FROM opportunities o
        WHERE o."jobId" = r."jobId" AND o."source" = r."source"
      )
    )
    SELECT "score", COUNT(*)::bigint AS count
    FROM combined
    GROUP BY "score"
    ORDER BY "score"
  `;

  const histogram = new Map<number, number>();
  for (const row of rows) {
    histogram.set(row.score, Number(row.count));
  }

  return bucketHistogramIntoBands(histogram);
}
