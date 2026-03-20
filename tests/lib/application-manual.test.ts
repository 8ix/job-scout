import { describe, it, expect } from "vitest";
import {
  createManualApplicationSchema,
  createScheduledEventSchema,
} from "@/lib/validators/application-manual";

describe("createManualApplicationSchema", () => {
  it("accepts minimal valid payload", () => {
    const parsed = createManualApplicationSchema.safeParse({
      title: "Engineer",
      company: "Acme",
      url: "https://jobs.example.com/1",
      score: 6,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid score", () => {
    const parsed = createManualApplicationSchema.safeParse({
      title: "E",
      company: "C",
      url: "https://x.com",
      score: 11,
    });
    expect(parsed.success).toBe(false);
  });
});

describe("createScheduledEventSchema", () => {
  it("accepts screening kind and ISO datetime", () => {
    const parsed = createScheduledEventSchema.safeParse({
      kind: "screening",
      scheduledAt: "2026-06-01T14:00:00.000Z",
    });
    expect(parsed.success).toBe(true);
  });
});
