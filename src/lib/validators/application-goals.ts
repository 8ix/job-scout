import { z } from "zod";
import { isValidIanaTimeZone } from "@/lib/goals/timezone-validation";

const WEEKLY_TARGET_MAX = 100;
const MONTHLY_TARGET_MAX = 500;

export const patchApplicationGoalsSchema = z
  .object({
    timezone: z.string().trim().min(1).max(120).optional(),
    weekStartsOn: z.number().int().min(0).max(6).optional(),
    weeklyTargetCount: z.number().int().min(0).max(WEEKLY_TARGET_MAX).optional(),
    monthlyTargetCount: z.number().int().min(0).max(MONTHLY_TARGET_MAX).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "At least one field required" })
  .superRefine((data, ctx) => {
    if (data.timezone !== undefined && !isValidIanaTimeZone(data.timezone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid IANA time zone",
        path: ["timezone"],
      });
    }
  });

export type PatchApplicationGoalsInput = z.infer<typeof patchApplicationGoalsSchema>;
