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
  verdict: verdictEnum.nullish(),
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
    title: z.string().min(1).optional(),
    company: z.string().min(1).optional(),
    url: z.string().min(1).optional(),
    score: z.number().int().min(0).max(10).optional(),
    location: z.string().nullish(),
    workingModel: workingModelEnum.nullish(),
    listingType: listingTypeEnum.nullish(),
    salaryMin: z.number().int().nullish(),
    salaryMax: z.number().int().nullish(),
    description: z.string().nullish(),
    postedAt: z.string().datetime().nullish(),
    appliedVia: z.string().nullish(),
    recruiterContact: z.string().nullish(),
    fullJobSpecification: z.string().nullish(),
    verdict: z.string().nullish(),
    matchReasons: z.string().nullish(),
    redFlags: z.string().nullish(),
  })
  .refine(
    (data) => Object.entries(data).some(([, v]) => v !== undefined),
    { message: "At least one field is required" }
  );

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
