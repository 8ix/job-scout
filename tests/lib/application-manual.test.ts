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

  it("accepts omitted or null url", () => {
    const a = createManualApplicationSchema.safeParse({
      title: "Engineer",
      company: "Acme",
      score: 6,
    });
    expect(a.success).toBe(true);
    if (a.success) expect(a.data.url).toBeNull();

    const b = createManualApplicationSchema.safeParse({
      title: "Engineer",
      company: "Acme",
      url: null,
      score: 6,
    });
    expect(b.success).toBe(true);
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
