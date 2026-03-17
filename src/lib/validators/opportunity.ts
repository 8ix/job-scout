import { z } from "zod";
import { sourceEnum } from "./source";
const verdictEnum = z.enum(["Strong fit", "Conditional fit", "Weak fit", "Not a fit"]);
const workingModelEnum = z.enum(["Remote", "Hybrid", "On-site", "Unknown"]);
const listingTypeEnum = z.enum(["Direct", "Recruiter"]);
const statusEnum = z.enum(["new", "reviewed", "applied", "rejected", "archived"]);

export const createOpportunitySchema = z.object({
  jobId: z.string().min(1),
  source: sourceEnum,
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

export const updateOpportunitySchema = z.object({
  status: statusEnum,
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
