import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  computeApplyRate,
  rowsFromOpportunityGroups,
  appendRejectionOnlySources,
  sortAndCapSourceQuality,
  getSourceQuality,
} from "@/lib/stats/source-quality";
import { MANUAL_SOURCE } from "@/lib/constants/manual-source";

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

describe("getSourceQuality", () => {
  const prismaMock = {
    opportunity: { groupBy: vi.fn() },
    $queryRaw: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.opportunity.groupBy.mockResolvedValue([]);
    prismaMock.$queryRaw.mockResolvedValue([]);
  });

  it("excludes manual source from opportunity and apply aggregations", async () => {
    await getSourceQuality(prismaMock as never, {
      now: new Date("2026-03-01T12:00:00Z"),
      windowDays: 14,
    });

    expect(prismaMock.opportunity.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ source: { not: MANUAL_SOURCE } }),
      })
    );
    const applyCall = prismaMock.opportunity.groupBy.mock.calls.find(
      (c) => (c[0] as { where?: { appliedAt?: unknown } }).where?.appliedAt != null
    );
    expect(applyCall?.[0]).toMatchObject({
      where: { source: { not: MANUAL_SOURCE } },
    });
  });

  it("passes manual exclusion into rejection-only SQL", async () => {
    await getSourceQuality(prismaMock as never, { now: new Date("2026-03-01T12:00:00Z") });
    const values = prismaMock.$queryRaw.mock.calls[0].slice(1) as unknown[];
    expect(values).toContain(MANUAL_SOURCE);
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
