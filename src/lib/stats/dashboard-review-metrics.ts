import type { PrismaClient } from "@/generated/prisma/client";
import { createdAtLteForMinAgeDays } from "@/lib/opportunities/min-age-filter";
import {
  CONVERSION_BY_SOURCE_MAX_ROWS,
  CONVERSION_COHORT_WINDOW_DAYS,
  FIRST_CALL_MEDIAN_WINDOW_DAYS,
} from "@/lib/constants/dashboard";

export type ReviewQueueVerdictRow = { verdict: string; count: number };
export type ReviewQueueScoreRow = { score: number; count: number };

export type ConversionBySourceRow = {
  source: string;
  ingested: number;
  applied: number;
  rate: number;
};

export type ApplyToFirstCallStats = {
  windowDays: number;
  medianDays: number | null;
  sampleSize: number;
};

function windowStart(days: number, now: Date): Date {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getStuckNewCount(
  prisma: PrismaClient,
  options: { stuckDays: number; scoreMin: number; now?: Date }
): Promise<number> {
  const now = options.now ?? new Date();
  const cutoff = createdAtLteForMinAgeDays(options.stuckDays, now);
  return prisma.opportunity.count({
    where: {
      status: "new",
      score: { gte: options.scoreMin },
      createdAt: { lte: cutoff },
    },
  });
}

export async function getReviewQueueBreakdown(
  prisma: PrismaClient,
  options: { scoreMin: number }
): Promise<{ byVerdict: ReviewQueueVerdictRow[]; byScore: ReviewQueueScoreRow[] }> {
  const baseWhere = { status: "new" as const, score: { gte: options.scoreMin } };

  const [verdictGroups, scoreGroups] = await Promise.all([
    prisma.opportunity.groupBy({
      by: ["verdict"],
      where: baseWhere,
      _count: { id: true },
    }),
    prisma.opportunity.groupBy({
      by: ["score"],
      where: baseWhere,
      _count: { id: true },
    }),
  ]);

  const byVerdict: ReviewQueueVerdictRow[] = verdictGroups.map((g) => ({
    verdict: g.verdict ?? "Unspecified",
    count: g._count.id,
  }));
  byVerdict.sort((a, b) => b.count - a.count);

  const byScore: ReviewQueueScoreRow[] = scoreGroups
    .filter((g) => g.score >= options.scoreMin && g.score <= 10)
    .map((g) => ({ score: g.score, count: g._count.id }))
    .sort((a, b) => a.score - b.score);

  return { byVerdict, byScore };
}

type ConversionRawRow = { source: string; ingested: bigint; applied: bigint };

export async function getRollingConversionBySource(
  prisma: PrismaClient,
  options?: { windowDays?: number; maxRows?: number; now?: Date }
): Promise<ConversionBySourceRow[]> {
  const windowDays = options?.windowDays ?? CONVERSION_COHORT_WINDOW_DAYS;
  const maxRows = options?.maxRows ?? CONVERSION_BY_SOURCE_MAX_ROWS;
  const now = options?.now ?? new Date();
  const start = windowStart(windowDays, now);

  const rows = await prisma.$queryRaw<ConversionRawRow[]>`
    SELECT
      o."source",
      COUNT(*)::bigint AS ingested,
      COUNT(*) FILTER (WHERE o."appliedAt" IS NOT NULL)::bigint AS applied
    FROM opportunities o
    WHERE o."createdAt" >= ${start}
    GROUP BY o."source"
    ORDER BY ingested DESC
    LIMIT ${maxRows}
  `;

  return rows.map((r) => {
    const ingested = Number(r.ingested);
    const applied = Number(r.applied);
    return {
      source: r.source,
      ingested,
      applied,
      rate: ingested > 0 ? applied / ingested : 0,
    };
  });
}

type FirstCallRawRow = { sample_size: bigint; median_days: number | null };

export async function getApplyToFirstCallStats(
  prisma: PrismaClient,
  options?: { windowDays?: number; now?: Date }
): Promise<ApplyToFirstCallStats> {
  const windowDays = options?.windowDays ?? FIRST_CALL_MEDIAN_WINDOW_DAYS;
  const now = options?.now ?? new Date();
  const windowStartDate = windowStart(windowDays, now);

  const rows = await prisma.$queryRaw<FirstCallRawRow[]>`
    WITH first_evt AS (
      SELECT
        e."opportunityId",
        MIN(e."scheduledAt") AS first_at
      FROM application_scheduled_events e
      WHERE e.kind IN ('screening', 'interview')
      GROUP BY e."opportunityId"
    ),
    pairs AS (
      SELECT
        EXTRACT(EPOCH FROM (f.first_at - o."appliedAt")) / 86400.0 AS days_between
      FROM opportunities o
      INNER JOIN first_evt f ON f."opportunityId" = o.id
      WHERE o."appliedAt" IS NOT NULL
        AND o."appliedAt" >= ${windowStartDate}
        AND f.first_at >= o."appliedAt"
    )
    SELECT
      COUNT(*)::bigint AS sample_size,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_between) AS median_days
    FROM pairs
  `;

  const row = rows[0];
  const sampleSize = row ? Number(row.sample_size) : 0;
  const medianDays =
    row?.median_days != null && Number.isFinite(row.median_days)
      ? Math.round(row.median_days * 10) / 10
      : null;

  return {
    windowDays,
    medianDays,
    sampleSize,
  };
}
