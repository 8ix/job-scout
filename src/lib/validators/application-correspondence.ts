import { z } from "zod";
import {
  APPLICATION_CORRESPONDENCE_BODY_MAX,
  APPLICATION_CORRESPONDENCE_SUBJECT_MAX,
} from "@/lib/constants/application-correspondence";

export const createApplicationCorrespondenceSchema = z.object({
  receivedAt: z.string().datetime({ offset: true }),
  body: z
    .string()
    .trim()
    .min(1, "Body is required")
    .max(APPLICATION_CORRESPONDENCE_BODY_MAX),
  subject: z
    .string()
    .trim()
    .max(APPLICATION_CORRESPONDENCE_SUBJECT_MAX)
    .nullish()
    .transform((v) => (v === "" || v == null ? null : v)),
});

export type CreateApplicationCorrespondenceInput = z.infer<
  typeof createApplicationCorrespondenceSchema
>;
