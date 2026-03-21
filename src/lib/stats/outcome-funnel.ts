import type { PrismaClient } from "@/generated/prisma/client";

export type OutcomeFunnelSnapshot = {
  windowDays: number;
  ingested: number;
  applied: number;
  disqualifiedListings: number;
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

  const [ingested, applied, disqualifiedListings] = await Promise.all([
    prisma.opportunity.count({
      where: { createdAt: { gte: start } },
    }),
    prisma.opportunity.count({
      where: {
        appliedAt: { gte: start, not: null },
      },
    }),
    prisma.rejection.count({
      where: { createdAt: { gte: start } },
    }),
  ]);

  return {
    windowDays,
    ingested,
    applied,
    disqualifiedListings,
  };
}
