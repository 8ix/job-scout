import { describe, it, expect } from "vitest";
import { OPPORTUNITY_SCORE_DISTRIBUTION_BANDS } from "@/lib/constants/opportunity-scores";

describe("OPPORTUNITY_SCORE_DISTRIBUTION_BANDS", () => {
  it("covers 0–10 without gaps", () => {
    expect(OPPORTUNITY_SCORE_DISTRIBUTION_BANDS).toHaveLength(6);
    expect(OPPORTUNITY_SCORE_DISTRIBUTION_BANDS[0]).toEqual({
      band: "0–5",
      min: 0,
      max: 5,
    });
    expect(OPPORTUNITY_SCORE_DISTRIBUTION_BANDS[5]).toEqual({
      band: "10",
      min: 10,
      max: 10,
    });
  });
});
