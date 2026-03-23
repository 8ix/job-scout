import type { PrismaClient } from "@/generated/prisma/client";
import {
  INGEST_BLOCKLIST_REJECTION_FILTER,
  WORKFLOW_REJECTION_FILTER,
} from "@/lib/rejections/blocklist-metrics";

export type OutcomeFunnelSnapshot = {
  windowDays: number;
  ingested: number;
  applied: number;
  /** Workflow disqualified listings (rejections without ingest blocklist match). */
  disqualifiedListings: number;
  /** Server-blocked by ingest blocklist (same rows as amber cards on Disqualified). */
  blockedListings: number;
};

function windowStart(days: number, now: Date): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getOutcomeFunnel(
  prisma: PrismaClient,
  windowDays: number,
  now: Date = new Date()
): Promise<OutcomeFunnelSnapshot> {
  const start = windowStart(windowDays, now);

  const [ingested, applied, disqualifiedListings, blockedListings] = await Promise.all([
    prisma.opportunity.count({
      where: { createdAt: { gte: start } },
    }),
    prisma.opportunity.count({
      where: {
        appliedAt: { gte: start, not: null },
      },
    }),
    prisma.rejection.count({
      where: {
        createdAt: { gte: start },
        ...WORKFLOW_REJECTION_FILTER,
      },
    }),
    prisma.rejection.count({
      where: {
        createdAt: { gte: start },
        ...INGEST_BLOCKLIST_REJECTION_FILTER,
      },
    }),
  ]);

  return {
    windowDays,
    ingested,
    applied,
    disqualifiedListings,
    blockedListings,
  };
}
