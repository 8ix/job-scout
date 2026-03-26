import { z } from "zod";

const criterionPairSchema = z.object({
  positive: z.array(z.string()),
  negative: z.array(z.string()),
});

export const searchCriteriaSchema = z.object({
  /** Optional: who the assistant is helping, career level, fixed background — user-written only. */
  introContext: z.string().default(""),
  /** Optional: extra behaviour / output expectations — user-written only. */
  additionalInstructions: z.string().default(""),
  whereWork: criterionPairSchema,
  compensation: criterionPairSchema,
  companyCulture: criterionPairSchema,
  role: criterionPairSchema,
  skillsMatch: criterionPairSchema,
});

export type CriterionPair = z.infer<typeof criterionPairSchema>;
export type SearchCriteria = z.infer<typeof searchCriteriaSchema>;

/** Keys for the five positive/negative section editors (excludes free-text fields). */
export const CRITERION_SECTION_KEYS = [
  "whereWork",
  "compensation",
  "companyCulture",
  "role",
  "skillsMatch",
] as const satisfies readonly (keyof SearchCriteria)[];

export type CriterionSectionKey = (typeof CRITERION_SECTION_KEYS)[number];

export const emptySearchCriteria = (): SearchCriteria => ({
  introContext: "",
  additionalInstructions: "",
  whereWork: { positive: [], negative: [] },
  compensation: { positive: [], negative: [] },
  companyCulture: { positive: [], negative: [] },
  role: { positive: [], negative: [] },
  skillsMatch: { positive: [], negative: [] },
});

export function parseSearchCriteriaJson(value: unknown): SearchCriteria {
  const parsed = searchCriteriaSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  return emptySearchCriteria();
}

export const patchSearchCriteriaSchema = searchCriteriaSchema;
