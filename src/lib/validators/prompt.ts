import { z } from "zod";

export const createPromptSchema = z.object({
  name: z.string().min(1),
  systemPrompt: z.string().min(1),
  userPromptTemplate: z.string().min(1),
  notes: z.string().nullish(),
});

export type CreatePromptInput = z.infer<typeof createPromptSchema>;
