import { describe, it, expect } from "vitest";
import { OPPORTUNITY_SCORE_DISTRIBUTION_BANDS } from "@/lib/constants/opportunity-scores";

describe("OPPORTUNITY_SCORE_DISTRIBUTION_BANDS", () => {
  it("covers chart bands 6–10 only", () => {
    expect(OPPORTUNITY_SCORE_DISTRIBUTION_BANDS).toHaveLength(5);
    expect(OPPORTUNITY_SCORE_DISTRIBUTION_BANDS[0]).toEqual({
      band: "6",
      min: 6,
      max: 6,
    });
    expect(OPPORTUNITY_SCORE_DISTRIBUTION_BANDS[4]).toEqual({
      band: "10",
      min: 10,
      max: 10,
    });
  });
});
