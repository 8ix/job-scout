import type { PrismaClient } from "@/generated/prisma/client";
import {
  PIPELINE_STAGES_TOP_FIRST,
  normalizeApplicationStage,
} from "@/lib/applications/pipeline";

export type PipelineStageCount = {
  stage: string;
  count: number;
};

const ORDER_SET = new Set<string>(PIPELINE_STAGES_TOP_FIRST);

/**
 * Order stage labels for dashboard: known pipeline order first, then "Other" bucket.
 */
export function orderPipelineSnapshotCounts(
  counts: Map<string, number>
): PipelineStageCount[] {
  const ordered: PipelineStageCount[] = [];
  for (const stage of PIPELINE_STAGES_TOP_FIRST) {
    const n = counts.get(stage) ?? 0;
    if (n > 0) ordered.push({ stage, count: n });
  }
  let other = 0;
  for (const [stage, n] of counts) {
    if (!ORDER_SET.has(stage) && n > 0) {
      other += n;
    }
  }
  if (other > 0) {
    ordered.push({ stage: "Other", count: other });
  }
  return ordered;
}

/**
 * Build stage counts from Prisma groupBy on applied opportunities.
 */
export function mapGroupByToStageCounts(
  groups: { stage: string | null; _count: { id: number } }[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const g of groups) {
    const label = normalizeApplicationStage(g.stage);
    map.set(label, (map.get(label) ?? 0) + g._count.id);
  }
  return map;
}

export async function getPipelineSnapshot(prisma: PrismaClient): Promise<{
  totalActive: number;
  stages: PipelineStageCount[];
}> {
  const groups = await prisma.opportunity.groupBy({
    by: ["stage"],
    where: { status: "applied" },
    _count: { id: true },
  });

  const counts = mapGroupByToStageCounts(groups);
  let total = 0;
  for (const n of counts.values()) total += n;

  return {
    totalActive: total,
    stages: orderPipelineSnapshotCounts(counts),
  };
}
