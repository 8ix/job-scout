import { describe, it, expect, vi } from "vitest";
import { getIngestBlocklistPatternBreakdown } from "@/lib/rejections/blocklist-metrics";

describe("getIngestBlocklistPatternBreakdown", () => {
  it("aggregates counts by pattern and picks top scope", async () => {
    const prismaMock = {
      rejection: {
        groupBy: vi.fn().mockResolvedValue([
          { ingestBlocklistPattern: "Acme", ingestBlocklistScope: "company", _count: { id: 5 } },
          { ingestBlocklistPattern: "Acme", ingestBlocklistScope: "any", _count: { id: 1 } },
          { ingestBlocklistPattern: "Beta", ingestBlocklistScope: "title", _count: { id: 3 } },
        ]),
      },
    };

    const rows = await getIngestBlocklistPatternBreakdown(prismaMock as never, {
      windowDays: 30,
      now: new Date("2026-06-01T12:00:00Z"),
    });

    expect(rows[0].pattern).toBe("Acme");
    expect(rows[0].count).toBe(6);
    expect(rows[0].topScope).toBe("company");
    expect(rows[1].pattern).toBe("Beta");
    expect(rows[1].count).toBe(3);
  });
});
