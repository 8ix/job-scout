import { z } from "zod";
import { INGEST_BLOCKLIST_NOTE_MAX, INGEST_BLOCKLIST_PATTERN_MAX } from "@/lib/constants/ingest-blocklist";

export const ingestBlockScopeSchema = z.enum(["company", "title", "any"]);

export const createIngestBlockRuleSchema = z.object({
  pattern: z
    .string()
    .trim()
    .min(1, "Pattern is required")
    .max(INGEST_BLOCKLIST_PATTERN_MAX),
  scope: ingestBlockScopeSchema,
  note: z
    .string()
    .trim()
    .max(INGEST_BLOCKLIST_NOTE_MAX)
    .nullish()
    .transform((v) => (v === "" || v == null ? null : v)),
  enabled: z.boolean().optional().default(true),
});

export const patchIngestBlockRuleSchema = z
  .object({
    pattern: z
      .string()
      .trim()
      .min(1)
      .max(INGEST_BLOCKLIST_PATTERN_MAX)
      .optional(),
    scope: ingestBlockScopeSchema.optional(),
    note: z
      .union([
        z
          .string()
          .trim()
          .max(INGEST_BLOCKLIST_NOTE_MAX)
          .transform((v) => (v === "" ? null : v)),
        z.null(),
      ])
      .optional(),
    enabled: z.boolean().optional(),
  })
  .refine(
    (d) =>
      d.pattern !== undefined ||
      d.scope !== undefined ||
      d.note !== undefined ||
      d.enabled !== undefined,
    { message: "At least one field is required" }
  );

export type CreateIngestBlockRuleInput = z.infer<typeof createIngestBlockRuleSchema>;
export type PatchIngestBlockRuleInput = z.infer<typeof patchIngestBlockRuleSchema>;
