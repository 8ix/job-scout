import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFeedIngestSummary } from "@/lib/feeds/feed-ingest-summary";
import { MANUAL_SOURCE } from "@/lib/constants/manual-source";

const prismaMock = {
  feed: { findMany: vi.fn() },
  opportunity: { groupBy: vi.fn() },
  rejection: { groupBy: vi.fn() },
};

describe("getFeedIngestSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("omits manual feed from summary rows and from source filters", async () => {
    prismaMock.feed.findMany.mockResolvedValue([{ name: MANUAL_SOURCE }, { name: "adzuna" }]);

    prismaMock.opportunity.groupBy.mockImplementation((args: { _max?: unknown; _count?: unknown }) => {
      if (args._max) {
        return Promise.resolve([{ source: "adzuna", _max: { createdAt: new Date("2025-12-31T12:00:00Z") } }]);
      }
      return Promise.resolve([{ source: "adzuna", _count: { id: 2 } }]);
    });
    prismaMock.rejection.groupBy.mockImplementation((args: { _max?: unknown }) => {
      if (args._max) {
        return Promise.resolve([{ source: "adzuna", _max: { createdAt: null } }]);
      }
      return Promise.resolve([{ source: "adzuna", _count: { id: 0 } }]);
    });

    const rows = await getFeedIngestSummary(prismaMock as never, new Date("2026-01-01T12:00:00Z"));

    expect(rows).toHaveLength(1);
    expect(rows[0].source).toBe("adzuna");

    const lastOppCall = prismaMock.opportunity.groupBy.mock.calls.find((c) => (c[0] as { _max?: unknown })._max);
    expect(lastOppCall?.[0]).toMatchObject({
      where: { source: { in: ["adzuna"] } },
    });
  });
});
