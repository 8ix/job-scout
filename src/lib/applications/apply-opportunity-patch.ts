import type { Opportunity } from "@/generated/prisma/client";
import type { PrismaClient } from "@/generated/prisma/client";
import type { UpdateOpportunityInput } from "@/lib/validators/opportunity";
import { MISSING_LISTING_URL_PLACEHOLDER } from "@/lib/constants/missing-listing-url";

type Result =
  | { ok: true; opportunity: Opportunity }
  | { ok: false; status: number; error: string };

/**
 * Shared PATCH logic for opportunities (session UI and API key routes).
 */
export async function applyOpportunityPatch(
  prisma: PrismaClient,
  id: string,
  existing: Opportunity,
  parsed: UpdateOpportunityInput
): Promise<Result> {
  const data: Record<string, unknown> = {};

  if (parsed.title !== undefined) data.title = parsed.title;
  if (parsed.company !== undefined) data.company = parsed.company;
  if (parsed.url !== undefined) data.url = parsed.url ?? null;
  if (parsed.score !== undefined) data.score = parsed.score;
  if (parsed.location !== undefined) data.location = parsed.location;
  if (parsed.workingModel !== undefined) data.workingModel = parsed.workingModel;
  if (parsed.listingType !== undefined) data.listingType = parsed.listingType;
  if (parsed.salaryMin !== undefined) data.salaryMin = parsed.salaryMin;
  if (parsed.salaryMax !== undefined) data.salaryMax = parsed.salaryMax;
  if (parsed.description !== undefined) data.description = parsed.description;
  if (parsed.postedAt !== undefined) {
    data.postedAt = parsed.postedAt ? new Date(parsed.postedAt) : null;
  }
  if (parsed.appliedVia !== undefined) data.appliedVia = parsed.appliedVia;
  if (parsed.recruiterContact !== undefined) data.recruiterContact = parsed.recruiterContact;
  if (parsed.fullJobSpecification !== undefined) {
    data.fullJobSpecification = parsed.fullJobSpecification;
  }
  if (parsed.verdict !== undefined) data.verdict = parsed.verdict;
  if (parsed.matchReasons !== undefined) data.matchReasons = parsed.matchReasons;
  if (parsed.redFlags !== undefined) data.redFlags = parsed.redFlags;

  if (parsed.status !== undefined) {
    data.status = parsed.status;
    if (parsed.status === "applied") {
      data.appliedAt = new Date();
      if (!existing.stage) {
        data.stage = "Applied";
      }
    }
  }
  if (parsed.stage !== undefined) {
    if (existing.status !== "applied") {
      return {
        ok: false,
        status: 400,
        error: "Stage can only be updated for applied opportunities",
      };
    }
    data.stage = parsed.stage;
    if (parsed.stage === "Rejected" || parsed.stage === "Archived") {
      data.status = "rejected";
    }
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, status: 400, error: "No valid fields to update" };
  }

  const opportunity = await prisma.opportunity.update({
    where: { id },
    data,
  });

  const newStage =
    parsed.stage ??
    (parsed.status === "applied" && !existing.stage ? "Applied" : null);
  if (newStage && newStage !== existing.stage) {
    await prisma.applicationStageLog.create({
      data: {
        opportunityId: id,
        stage: newStage,
      },
    });
  }

  if (
    parsed.stage &&
    (parsed.stage === "Rejected" || parsed.stage === "Archived") &&
    existing.stage !== "Rejected" &&
    existing.stage !== "Archived"
  ) {
    const redFlags =
      parsed.stage === "Rejected"
        ? "Organization rejected our application"
        : "Application went stale - archived";
    await prisma.rejection.create({
      data: {
        jobId: existing.jobId,
        source: existing.source,
        title: existing.title,
        company: existing.company,
        url: existing.url ?? MISSING_LISTING_URL_PLACEHOLDER,
        score: existing.score,
        redFlags,
      },
    });
  }

  return { ok: true, opportunity };
}
