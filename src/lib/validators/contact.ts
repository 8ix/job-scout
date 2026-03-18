import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(1).max(200),
  role: z.string().max(100).nullish(),
  email: z.string().email().max(255).nullish().or(z.literal("")),
  phone: z.string().max(50).nullish(),
  notes: z.string().max(500).nullish(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
