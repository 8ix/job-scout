import { z } from "zod";

export const createPromptSchema = z.object({
  name: z.string().min(1),
  systemPrompt: z.string().min(1),
  userPromptTemplate: z.string().min(1),
  notes: z.string().nullish(),
});

export const updatePromptSchema = z.object({
  name: z.string().min(1).optional(),
  systemPrompt: z.string().min(1).optional(),
  userPromptTemplate: z.string().min(1).optional(),
  notes: z.string().nullish().optional(),
});

export type CreatePromptInput = z.infer<typeof createPromptSchema>;
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;
