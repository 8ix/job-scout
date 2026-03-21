import { describe, it, expect } from "vitest";
import { DEFAULT_OPPORTUNITY_SCORE_MIN } from "@/lib/constants/opportunities";

describe("opportunities constants", () => {
  it("default score min matches opportunities page default filter", () => {
    expect(DEFAULT_OPPORTUNITY_SCORE_MIN).toBe(6);
  });
});
