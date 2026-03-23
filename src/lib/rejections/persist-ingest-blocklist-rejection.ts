import type { PrismaClient } from "@/generated/prisma/client";
import type { IngestBlockRuleForMatch } from "@/lib/ingest-blocklist/match";

const RED_FLAGS =
  "Blocked by ingest blocklist—job was not stored as an opportunity. Use GET /api/ingest-blocklist in your workflow to filter before scoring.";

type OpportunityLike = {
  jobId: string;
  source: string;
  title: string;
  company: string;
  url: string;
  score: number;
};

/**
 * Creates or refreshes a rejection row so Disqualified UI shows blocklist hits with pattern/scope.
 */
export async function persistIngestBlocklistRejection(
  prisma: PrismaClient,
  rest: OpportunityLike,
  blockedBy: IngestBlockRuleForMatch
) {
  const base = {
    jobId: rest.jobId,
    source: rest.source,
    title: rest.title,
    company: rest.company,
    url: rest.url,
    score: rest.score,
    redFlags: RED_FLAGS,
    ingestBlocklistRuleId: blockedBy.id,
    ingestBlocklistPattern: blockedBy.pattern,
    ingestBlocklistScope: blockedBy.scope,
  };

  const existing = await prisma.rejection.findFirst({
    where: { source: rest.source, jobId: rest.jobId },
    select: { id: true },
  });

  if (existing) {
    return prisma.rejection.update({
      where: { id: existing.id },
      data: base,
    });
  }

  return prisma.rejection.create({ data: base });
}
