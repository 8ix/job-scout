import { z } from "zod";

const verdictEnum = z.enum(["Strong fit", "Conditional fit", "Weak fit", "Not a fit"]);
const workingModelEnum = z.enum(["Remote", "Hybrid", "On-site", "Unknown"]);
const listingTypeEnum = z.enum(["Direct", "Recruiter"]);
const statusEnum = z.enum(["new", "reviewed", "applied", "rejected", "archived"]);
export const applicationStageEnum = z.enum([
  "Applied",
  "Screening",
  "Interview",
  "Final Round",
  "Offer",
  "Rejected",
  "Archived",
]);

export const createOpportunitySchema = z.object({
  jobId: z.string().min(1),
  source: z.string().min(1),
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().nullish(),
  workingModel: workingModelEnum.nullish(),
  listingType: listingTypeEnum.nullish(),
  salaryMin: z.number().int().nullish(),
  salaryMax: z.number().int().nullish(),
  score: z.number().int().min(0).max(10),
  verdict: verdictEnum,
  matchReasons: z.string().nullish(),
  redFlags: z.string().nullish(),
  url: z.string().url(),
  description: z.string().nullish(),
  postedAt: z.string().datetime().nullish(),
});

export const updateOpportunitySchema = z
  .object({
    status: statusEnum.optional(),
    stage: applicationStageEnum.optional(),
  })
  .refine((data) => data.status !== undefined || data.stage !== undefined, {
    message: "At least one of status or stage is required",
  });

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
