import type { PrismaClient } from "@/generated/prisma/client";
import { normalizeRoleMatchKey } from "@/lib/opportunities/normalize-role-match";
import { RECENT_APPLICATION_ROLE_MATCH_DAYS } from "@/lib/constants/opportunities";

const RED_FLAGS =
  `Duplicate listing — you already have an active application for the same role (title + company match within ${RECENT_APPLICATION_ROLE_MATCH_DAYS} days). Skipped to avoid clutter.`;

type OpportunityLike = {
  jobId: string;
  source: string;
  title: string;
  company: string;
  url: string;
  score: number;
};

/**
 * Returns the id of a matching active application if one exists for the
 * same normalized title+company applied within the rolling window.
 */
export async function findRecentActiveApplicationRoleMatch(
  prisma: PrismaClient,
  title: string,
  company: string,
  windowDays: number = RECENT_APPLICATION_ROLE_MATCH_DAYS,
  now: Date = new Date()
): Promise<string | null> {
  const since = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  const key = normalizeRoleMatchKey(title, company);

  const active = await prisma.opportunity.findMany({
    where: {
      status: "applied",
      appliedAt: { not: null, gte: since },
    },
    select: { id: true, title: true, company: true },
  });

  const match = active.find(
    (o) => normalizeRoleMatchKey(o.title, o.company) === key
  );
  return match?.id ?? null;
}

/**
 * Upsert a rejection row for the duplicate listing (mirrors blocklist persistence).
 */
export async function persistRecentApplicationDuplicateRejection(
  prisma: PrismaClient,
  rest: OpportunityLike
) {
  const base = {
    jobId: rest.jobId,
    source: rest.source,
    title: rest.title,
    company: rest.company,
    url: rest.url,
    score: rest.score,
    redFlags: RED_FLAGS,
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
