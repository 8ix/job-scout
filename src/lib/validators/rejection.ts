import { z } from "zod";
import { sourceEnum } from "./source";

export const createRejectionSchema = z.object({
  jobId: z.string().min(1),
  source: sourceEnum,
  title: z.string().min(1),
  company: z.string().nullish(),
  url: z.string().url(),
  score: z.number().int().min(0).max(10),
  redFlags: z.string().nullish(),
});

export type CreateRejectionInput = z.infer<typeof createRejectionSchema>;
