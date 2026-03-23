import { describe, it, expect, vi } from "vitest";
import { getOutcomeFunnel } from "@/lib/stats/outcome-funnel";

describe("getOutcomeFunnel", () => {
  it("returns three counts for the window", async () => {
    const prisma = {
      opportunity: {
        count: vi
          .fn()
          .mockResolvedValueOnce(100)
          .mockResolvedValueOnce(12),
      },
      rejection: {
        count: vi.fn().mockResolvedValueOnce(25).mockResolvedValueOnce(5),
      },
    };

    const fixedNow = new Date("2026-06-15T12:00:00.000Z");
    const result = await getOutcomeFunnel(prisma as never, 7, fixedNow);

    expect(result).toEqual({
      windowDays: 7,
      ingested: 100,
      applied: 12,
      disqualifiedListings: 25,
      blockedListings: 5,
    });
  });
});
