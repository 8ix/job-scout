import { describe, it, expect } from "vitest";
import { bucketHistogramIntoBands } from "@/lib/stats/incoming-score-distribution";

describe("bucketHistogramIntoBands", () => {
  it("maps per-score counts into 0–5 and single-score bands", () => {
    const histogram = new Map<number, number>([
      [2, 5],
      [4, 3],
      [6, 10],
      [8, 7],
    ]);
    const bands = bucketHistogramIntoBands(histogram);
    expect(bands).toEqual([
      { band: "0–5", count: 8 },
      { band: "6", count: 10 },
      { band: "7", count: 0 },
      { band: "8", count: 7 },
      { band: "9", count: 0 },
      { band: "10", count: 0 },
    ]);
  });

  it("returns zeros for empty histogram", () => {
    const bands = bucketHistogramIntoBands(new Map());
    expect(bands.every((b) => b.count === 0)).toBe(true);
    expect(bands).toHaveLength(6);
  });
});
