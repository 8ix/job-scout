import { z } from "zod";

const workingModelEnum = z.enum(["Remote", "Hybrid", "On-site", "Unknown"]);
const listingTypeEnum = z.enum(["Direct", "Recruiter"]);
const scheduledKindEnum = z.enum(["screening", "interview", "other"]);

export const createManualApplicationSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  url: z.string().min(1),
  score: z.number().int().min(0).max(10),
  location: z.string().nullish(),
  workingModel: workingModelEnum.nullish(),
  listingType: listingTypeEnum.nullish(),
  salaryMin: z.number().int().nullish(),
  salaryMax: z.number().int().nullish(),
  description: z.string().nullish(),
  appliedVia: z.string().min(1).nullish(),
  recruiterContact: z.string().nullish(),
  fullJobSpecification: z.string().nullish(),
  postedAt: z.string().datetime().nullish(),
});

export const createScheduledEventSchema = z.object({
  kind: scheduledKindEnum,
  scheduledAt: z.string().datetime(),
  notes: z.string().nullish(),
});

export const updateScheduledEventSchema = z.object({
  kind: scheduledKindEnum.optional(),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().nullish(),
});

export type CreateManualApplicationInput = z.infer<typeof createManualApplicationSchema>;
export type CreateScheduledEventInput = z.infer<typeof createScheduledEventSchema>;
