import { z } from "zod";

const workingModelEnum = z.enum(["Remote", "Hybrid", "On-site", "Unknown"]);
const listingTypeEnum = z.enum(["Direct", "Recruiter"]);
const scheduledKindEnum = z.enum(["screening", "interview", "other"]);

/** Empty / omitted → null; otherwise must look like an http(s) listing URL. */
export const manualApplicationUrlSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === undefined || v === null) return null;
    const t = String(v).trim();
    return t === "" ? null : t;
  })
  .refine((s) => s === null || /^https?:\/\/.+/i.test(s), {
    message: "Listing URL must be http(s) or left empty",
  });

export const createManualApplicationSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  url: manualApplicationUrlSchema,
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
