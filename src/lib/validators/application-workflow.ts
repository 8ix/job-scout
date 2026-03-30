import { z } from "zod";

export const patchApplicationWorkflowSchema = z.object({
  staleIdleDays: z.number().int().min(7).max(365),
});

export type PatchApplicationWorkflowInput = z.infer<typeof patchApplicationWorkflowSchema>;

export const RESET_CONFIRM_PHRASE = "RESET MY JOB SCOUT DATA" as const;

export const resetApplicationDataSchema = z
  .object({
    password: z.string().min(1),
    confirmPhrase: z.literal(RESET_CONFIRM_PHRASE),
    deleteApplicationHistory: z.boolean(),
    deleteAllRejections: z.boolean(),
    /** Unchecked by default — deletes every opportunity including leads never applied. */
    deleteAllOpportunities: z.boolean(),
  })
  .refine(
    (d) => d.deleteApplicationHistory || d.deleteAllRejections || d.deleteAllOpportunities,
    { message: "Select at least one reset scope" }
  );

export type ResetApplicationDataInput = z.infer<typeof resetApplicationDataSchema>;
