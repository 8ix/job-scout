import { z } from "zod";

export const sourceEnum = z.enum(["Adzuna", "Reed", "JSearch", "ATS", "RSS"]);
export type Source = z.infer<typeof sourceEnum>;
