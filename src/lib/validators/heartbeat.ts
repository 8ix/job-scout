import { z } from "zod";
import { sourceEnum } from "./source";

export const createHeartbeatSchema = z.object({
  source: sourceEnum,
  jobsReceived: z.number().int().min(0),
  jobsNew: z.number().int().min(0),
  jobsScored: z.number().int().min(0),
  jobsOpportunity: z.number().int().min(0),
  ranAt: z.string().datetime(),
});

export type CreateHeartbeatInput = z.infer<typeof createHeartbeatSchema>;
