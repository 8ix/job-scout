import { z } from "zod";

export const createFeedSchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateFeedInput = z.infer<typeof createFeedSchema>;
