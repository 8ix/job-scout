import { z } from "zod";

export const checkSeenIdsSchema = z.object({
  source: z.string().min(1),
  ids: z.array(z.string().min(1)),
});

export type CheckSeenIdsInput = z.infer<typeof checkSeenIdsSchema>;
