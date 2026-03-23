import type { PrismaClient } from "@/generated/prisma/client";
import { MANUAL_SOURCE } from "@/lib/constants/manual-source";
import { isFeedIngestStale } from "./ingest-health";

export type FeedIngestSummaryRow = {
  source: string;
  opportunities24h: number;
  /** Workflow / scoring disqualified (POST /api/rejections), excluding ingest blocklist rows. */
  disqualified24h: number;
  /** Ingest blocklist blocks (422 on POST /api/opportunities) for this feed source. */
  blocked24h: number;
  lastIngestAt: Date | null;
  stale: boolean;
};

/**
 * Per configured feed: 24h opportunity/disqualified counts and last ingest time
 * (max of latest opportunity or rejection `createdAt` for that source).
 */
export async function getFeedIngestSummary(
  prisma: PrismaClient,
  now: Date = new Date()
): Promise<FeedIngestSummaryRow[]> {
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const feeds = await prisma.feed.findMany({ select: { name: true }, orderBy: { name: "asc" } });
  const sources = feeds.map((f) => f.name).filter((name) => name !== MANUAL_SOURCE);

  if (sources.length === 0) {
    return [];
  }

  const [oppsBySource, rejWorkflowBySource, rejBlockedBySource, lastOppBySource, lastRejBySource] =
    await Promise.all([
      prisma.opportunity.groupBy({
        by: ["source"],
        _count: { id: true },
        where: { createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.rejection.groupBy({
        by: ["source"],
        _count: { id: true },
        where: {
          createdAt: { gte: twentyFourHoursAgo },
          ingestBlocklistPattern: null,
        },
      }),
      prisma.rejection.groupBy({
        by: ["source"],
        _count: { id: true },
        where: {
          createdAt: { gte: twentyFourHoursAgo },
          ingestBlocklistPattern: { not: null },
        },
      }),
      prisma.opportunity.groupBy({
        by: ["source"],
        _max: { createdAt: true },
        where: { source: { in: sources } },
      }),
      prisma.rejection.groupBy({
        by: ["source"],
        _max: { createdAt: true },
        where: { source: { in: sources } },
      }),
    ]);

  const oppsMap = new Map(oppsBySource.map((o) => [o.source, o._count.id]));
  const rejWorkflowMap = new Map(rejWorkflowBySource.map((r) => [r.source, r._count.id]));
  const rejBlockedMap = new Map(rejBlockedBySource.map((r) => [r.source, r._count.id]));
  const lastOppMap = new Map(lastOppBySource.map((r) => [r.source, r._max.createdAt]));
  const lastRejMap = new Map(lastRejBySource.map((r) => [r.source, r._max.createdAt]));

  return sources.map((source) => {
    const lastOppAt = lastOppMap.get(source);
    const lastRejAt = lastRejMap.get(source);
    const fromData = [lastOppAt, lastRejAt].filter((d): d is Date => d != null);
    const lastIngestAt =
      fromData.length > 0 ? new Date(Math.max(...fromData.map((d) => d.getTime()))) : null;

    return {
      source,
      opportunities24h: oppsMap.get(source) ?? 0,
      disqualified24h: rejWorkflowMap.get(source) ?? 0,
      blocked24h: rejBlockedMap.get(source) ?? 0,
      lastIngestAt,
      stale: isFeedIngestStale(lastIngestAt, now),
    };
  });
}
