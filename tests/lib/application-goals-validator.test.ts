import { describe, it, expect } from "vitest";
import { patchApplicationGoalsSchema } from "@/lib/validators/application-goals";

describe("patchApplicationGoalsSchema", () => {
  it("accepts partial patch with valid timezone", () => {
    const r = patchApplicationGoalsSchema.safeParse({ timezone: "Europe/London" });
    expect(r.success).toBe(true);
  });

  it("rejects empty object", () => {
    const r = patchApplicationGoalsSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects invalid timezone", () => {
    const r = patchApplicationGoalsSchema.safeParse({ timezone: "NotReal" });
    expect(r.success).toBe(false);
  });

  it("accepts target zeros", () => {
    const r = patchApplicationGoalsSchema.safeParse({
      weeklyTargetCount: 0,
      monthlyTargetCount: 0,
    });
    expect(r.success).toBe(true);
  });
});
