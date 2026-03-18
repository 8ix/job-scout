import { z } from "zod";

export const createHeartbeatSchema = z.object({
  source: z.string().min(1),
  jobsReceived: z.number().int().min(0),
  jobsNew: z.number().int().min(0),
  jobsScored: z.number().int().min(0),
  jobsOpportunity: z.number().int().min(0),
  ranAt: z.string().datetime(),
});

export type CreateHeartbeatInput = z.infer<typeof createHeartbeatSchema>;
