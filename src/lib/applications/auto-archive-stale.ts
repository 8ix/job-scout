import type { Opportunity } from "@/generated/prisma/client";
import type { PrismaClient } from "@/generated/prisma/client";
import { MISSING_LISTING_URL_PLACEHOLDER } from "@/lib/constants/missing-listing-url";
import {
  APPLICATION_CLOSED_REASON_STALE_AUTO,
  REJECTION_REDFLAGS_STALE_AUTO,
} from "@/lib/applications/application-closed-reason";
import { isStaleIdleApplication } from "@/lib/applications/pipeline";

export type OpportunityWithEvents = Opportunity & {
  scheduledEvents: { scheduledAt: Date }[];
};

/**
 * Find applied opportunities that are stale (no future events, applied older than threshold).
 */
export async function findStaleAppliedOpportunities(
  prisma: PrismaClient,
  staleIdleDays: number,
  now: Date
): Promise<OpportunityWithEvents[]> {
  const opps = await prisma.opportunity.findMany({
    where: { status: "applied", appliedAt: { not: null } },
    include: {
      scheduledEvents: true,
    },
  });

  return opps.filter((o) =>
    isStaleIdleApplication(
      {
        appliedAt: o.appliedAt!.toISOString(),
        scheduledEvents: o.scheduledEvents.map((e) => ({
          scheduledAt: e.scheduledAt.toISOString(),
        })),
      },
      now,
      staleIdleDays
    )
  );
}

/**
 * Auto-archive one application: same end state as user choosing Archived, with stale_auto reason.
 */
export async function autoArchiveStaleApplication(
  prisma: PrismaClient,
  opp: OpportunityWithEvents
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.opportunity.update({
      where: { id: opp.id },
      data: {
        stage: "Archived",
        status: "rejected",
        applicationClosedReason: APPLICATION_CLOSED_REASON_STALE_AUTO,
      },
    });
    await tx.applicationStageLog.create({
      data: {
        opportunityId: opp.id,
        stage: "Archived",
      },
    });
    await tx.rejection.create({
      data: {
        jobId: opp.jobId,
        source: opp.source,
        title: opp.title,
        company: opp.company,
        url: opp.url ?? MISSING_LISTING_URL_PLACEHOLDER,
        score: opp.score,
        redFlags: REJECTION_REDFLAGS_STALE_AUTO,
      },
    });
  });
}

export async function runAutoArchiveStaleApplications(
  prisma: PrismaClient,
  staleIdleDays: number,
  now: Date = new Date()
): Promise<{ archived: number }> {
  const stale = await findStaleAppliedOpportunities(prisma, staleIdleDays, now);
  for (const opp of stale) {
    await autoArchiveStaleApplication(prisma, opp);
  }
  return { archived: stale.length };
}
