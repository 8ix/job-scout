import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getStuckNewCount,
  getReviewQueueBreakdown,
  getRollingConversionBySource,
  getApplyToFirstCallStats,
} from "@/lib/stats/dashboard-review-metrics";

const prismaMock = {
  opportunity: { count: vi.fn(), groupBy: vi.fn() },
  $queryRaw: vi.fn(),
};

describe("getStuckNewCount", () => {
  beforeEach(() => vi.clearAllMocks());

  it("counts new opps at or above score min older than cutoff", async () => {
    prismaMock.opportunity.count.mockResolvedValue(4);
    const now = new Date("2026-06-15T12:00:00.000Z");
    const n = await getStuckNewCount(prismaMock as never, {
      stuckDays: 7,
      scoreMin: 6,
      now,
    });
    expect(n).toBe(4);
    expect(prismaMock.opportunity.count).toHaveBeenCalledWith({
      where: {
        status: "new",
        score: { gte: 6 },
        createdAt: { lte: new Date("2026-06-08T00:00:00.000Z") },
      },
    });
  });
});

describe("getReviewQueueBreakdown", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns verdict and score groups", async () => {
    prismaMock.opportunity.groupBy
      .mockResolvedValueOnce([
        { verdict: "Strong fit", _count: { id: 3 } },
        { verdict: null, _count: { id: 1 } },
      ])
      .mockResolvedValueOnce([
        { score: 8, _count: { id: 2 } },
        { score: 6, _count: { id: 1 } },
      ]);

    const r = await getReviewQueueBreakdown(prismaMock as never, { scoreMin: 6 });
    expect(r.byVerdict.find((x) => x.verdict === "Unspecified")?.count).toBe(1);
    expect(r.byScore.map((x) => x.score)).toEqual([6, 8]);
  });
});

describe("getRollingConversionBySource", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps raw rows to rates", async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      { source: "A", ingested: 10n, applied: 3n },
      { source: "B", ingested: 5n, applied: 0n },
    ]);
    const rows = await getRollingConversionBySource(prismaMock as never, {
      windowDays: 30,
      maxRows: 12,
      now: new Date("2026-01-10T00:00:00.000Z"),
    });
    expect(rows[0]).toEqual({
      source: "A",
      ingested: 10,
      applied: 3,
      rate: 0.3,
    });
    expect(rows[1].rate).toBe(0);
  });
});

describe("getApplyToFirstCallStats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns median and sample from SQL", async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ sample_size: 8n, median_days: 14.25 }]);
    const r = await getApplyToFirstCallStats(prismaMock as never, {
      windowDays: 90,
      now: new Date("2026-01-01T00:00:00.000Z"),
    });
    expect(r.sampleSize).toBe(8);
    expect(r.medianDays).toBe(14.3);
    expect(r.windowDays).toBe(90);
  });

  it("handles empty sample", async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ sample_size: 0n, median_days: null }]);
    const r = await getApplyToFirstCallStats(prismaMock as never);
    expect(r.sampleSize).toBe(0);
    expect(r.medianDays).toBeNull();
  });
});
