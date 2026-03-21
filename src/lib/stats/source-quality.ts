import type { PrismaClient } from "@/generated/prisma/client";
import {
  SOURCE_QUALITY_MAX_SOURCES,
  SOURCE_QUALITY_WINDOW_DAYS,
} from "@/lib/constants/dashboard";

export type SourceQualityRow = {
  source: string;
  opportunitiesIngested: number;
  avgScore: number | null;
  appliedInWindow: number;
  applyRate: number;
  disqualifiedOnly: number;
};

type OppAggRow = {
  source: string;
  _count: { id: number };
  _avg: { score: number | null };
};

type RejOnlyRow = { source: string; count: bigint };

function windowStart(days: number, now: Date): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** applyRate = appliedInWindow / max(opportunitiesIngested, 1) */
export function computeApplyRate(appliedInWindow: number, opportunitiesIngested: number): number {
  const denom = Math.max(opportunitiesIngested, 1);
  return appliedInWindow / denom;
}

/**
 * Build rows for sources that had opportunities ingested in the window.
 */
export function rowsFromOpportunityGroups(
  oppGroups: OppAggRow[],
  applies: Map<string, number>,
  disqualifiedOnly: Map<string, number>
): SourceQualityRow[] {
  return oppGroups.map((o) => {
    const ingested = o._count.id;
    const applied = applies.get(o.source) ?? 0;
    const dq = disqualifiedOnly.get(o.source) ?? 0;
    const avg = o._avg.score;
    return {
      source: o.source,
      opportunitiesIngested: ingested,
      avgScore: avg != null ? Math.round(avg * 10) / 10 : null,
      appliedInWindow: applied,
      applyRate: computeApplyRate(applied, ingested),
      disqualifiedOnly: dq,
    };
  });
}

/** Add sources that only appear as orphan rejections in the window (no opp ingest in window). */
export function appendRejectionOnlySources(
  rows: SourceQualityRow[],
  applies: Map<string, number>,
  disqualifiedOnly: Map<string, number>
): SourceQualityRow[] {
  const seen = new Set(rows.map((r) => r.source));
  const extra: SourceQualityRow[] = [];
  for (const [source, dq] of disqualifiedOnly) {
    if (seen.has(source) || dq === 0) continue;
    const applied = applies.get(source) ?? 0;
    extra.push({
      source,
      opportunitiesIngested: 0,
      avgScore: null,
      appliedInWindow: applied,
      applyRate: computeApplyRate(applied, 0),
      disqualifiedOnly: dq,
    });
  }
  return [...rows, ...extra];
}

export function sortAndCapSourceQuality(rows: SourceQualityRow[]): SourceQualityRow[] {
  const sorted = [...rows].sort((a, b) => {
    const byIngest = b.opportunitiesIngested - a.opportunitiesIngested;
    if (byIngest !== 0) return byIngest;
    return b.disqualifiedOnly - a.disqualifiedOnly;
  });
  return sorted.slice(0, SOURCE_QUALITY_MAX_SOURCES);
}

export async function getSourceQuality(
  prisma: PrismaClient,
  options?: { now?: Date; windowDays?: number }
): Promise<SourceQualityRow[]> {
  const now = options?.now ?? new Date();
  const days = options?.windowDays ?? SOURCE_QUALITY_WINDOW_DAYS;
  const start = windowStart(days, now);

  const [oppGroups, applyGroups, rejOnlyRows] = await Promise.all([
    prisma.opportunity.groupBy({
      by: ["source"],
      where: { createdAt: { gte: start } },
      _count: { id: true },
      _avg: { score: true },
    }),
    prisma.opportunity.groupBy({
      by: ["source"],
      where: {
        appliedAt: { gte: start, not: null },
      },
      _count: { id: true },
    }),
    prisma.$queryRaw<RejOnlyRow[]>`
      SELECT r."source", COUNT(*)::bigint AS count
      FROM rejections r
      WHERE r."createdAt" >= ${start}
        AND NOT EXISTS (
          SELECT 1 FROM opportunities o
          WHERE o."jobId" = r."jobId" AND o."source" = r."source"
        )
      GROUP BY r."source"
    `,
  ]);

  const applyMap = new Map(applyGroups.map((g) => [g.source, g._count.id]));
  const dqMap = new Map(rejOnlyRows.map((r) => [r.source, Number(r.count)]));

  const fromOpps = rowsFromOpportunityGroups(oppGroups as OppAggRow[], applyMap, dqMap);
  const merged = appendRejectionOnlySources(fromOpps, applyMap, dqMap);
  return sortAndCapSourceQuality(merged);
}
