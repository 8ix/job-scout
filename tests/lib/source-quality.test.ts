import { describe, it, expect } from "vitest";
import {
  computeApplyRate,
  rowsFromOpportunityGroups,
  appendRejectionOnlySources,
  sortAndCapSourceQuality,
} from "@/lib/stats/source-quality";

describe("computeApplyRate", () => {
  it("divides by max(ingested, 1)", () => {
    expect(computeApplyRate(3, 10)).toBeCloseTo(0.3);
    expect(computeApplyRate(0, 0)).toBe(0);
    expect(computeApplyRate(2, 0)).toBe(2);
  });
});

describe("rowsFromOpportunityGroups", () => {
  it("merges apply and disqualified-only maps", () => {
    const rows = rowsFromOpportunityGroups(
      [
        { source: "A", _count: { id: 10 }, _avg: { score: 7.33 } },
        { source: "B", _count: { id: 5 }, _avg: { score: null } },
      ],
      new Map([
        ["A", 2],
        ["B", 1],
      ]),
      new Map([
        ["A", 1],
        ["B", 0],
      ])
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      source: "A",
      opportunitiesIngested: 10,
      avgScore: 7.3,
      appliedInWindow: 2,
      disqualifiedOnly: 1,
    });
    expect(rows[0].applyRate).toBeCloseTo(0.2);
    expect(rows[1]).toMatchObject({
      source: "B",
      opportunitiesIngested: 5,
      avgScore: null,
      appliedInWindow: 1,
      disqualifiedOnly: 0,
    });
  });
});

describe("appendRejectionOnlySources", () => {
  it("adds sources only present in disqualified map", () => {
    const base = rowsFromOpportunityGroups(
      [{ source: "A", _count: { id: 2 }, _avg: { score: 8 } }],
      new Map(),
      new Map([["A", 0]])
    );
    const merged = appendRejectionOnlySources(
      base,
      new Map(),
      new Map([
        ["A", 0],
        ["Z", 4],
      ])
    );
    expect(merged).toHaveLength(2);
    const z = merged.find((r) => r.source === "Z");
    expect(z).toMatchObject({
      opportunitiesIngested: 0,
      disqualifiedOnly: 4,
    });
  });
});

describe("sortAndCapSourceQuality", () => {
  it("sorts by ingest then dq and caps", () => {
    const capped = sortAndCapSourceQuality([
      {
        source: "low",
        opportunitiesIngested: 1,
        avgScore: 5,
        appliedInWindow: 0,
        applyRate: 0,
        disqualifiedOnly: 0,
      },
      {
        source: "high",
        opportunitiesIngested: 5,
        avgScore: 7,
        appliedInWindow: 1,
        applyRate: 0.2,
        disqualifiedOnly: 2,
      },
    ]);
    expect(capped[0].source).toBe("high");
    expect(capped).toHaveLength(2);
  });
});
