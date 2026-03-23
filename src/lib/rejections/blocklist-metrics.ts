import type { PrismaClient } from "@/generated/prisma/client";

/** Rejections created by workflow / scoring (POST /api/rejections or similar). */
export const WORKFLOW_REJECTION_FILTER = { ingestBlocklistPattern: null } as const;

/** Rejections created when ingest blocklist blocked POST /api/opportunities. */
export const INGEST_BLOCKLIST_REJECTION_FILTER = { ingestBlocklistPattern: { not: null } } as const;

export type BlocklistPatternRow = {
  pattern: string;
  count: number;
  topScope: string | null;
};

/**
 * Top blocklist patterns in the window (by volume), with the most common scope per pattern.
 */
export async function getIngestBlocklistPatternBreakdown(
  prisma: PrismaClient,
  options: { windowDays: number; limit?: number; now?: Date }
): Promise<BlocklistPatternRow[]> {
  const limit = options.limit ?? 12;
  const now = options.now ?? new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - options.windowDays);
  start.setHours(0, 0, 0, 0);

  const groups = await prisma.rejection.groupBy({
    by: ["ingestBlocklistPattern", "ingestBlocklistScope"],
    where: {
      createdAt: { gte: start },
      ingestBlocklistPattern: { not: null },
    },
    _count: { id: true },
  });

  const byPattern = new Map<
    string,
    { count: number; scopeCounts: Map<string, number> }
  >();

  for (const g of groups) {
    const p = g.ingestBlocklistPattern!;
    const scope = g.ingestBlocklistScope ?? "unknown";
    const c = g._count.id;
    const cur = byPattern.get(p) ?? { count: 0, scopeCounts: new Map<string, number>() };
    cur.count += c;
    cur.scopeCounts.set(scope, (cur.scopeCounts.get(scope) ?? 0) + c);
    byPattern.set(p, cur);
  }

  const rows: BlocklistPatternRow[] = [...byPattern.entries()].map(([pattern, v]) => {
    let topScope: string | null = null;
    let topN = 0;
    for (const [s, n] of v.scopeCounts) {
      if (n > topN) {
        topN = n;
        topScope = s;
      }
    }
    return { pattern, count: v.count, topScope };
  });

  rows.sort((a, b) => b.count - a.count);
  return rows.slice(0, limit);
}
