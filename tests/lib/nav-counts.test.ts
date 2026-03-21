import { describe, it, expect, vi, beforeEach } from "vitest";
import { getNavCounts } from "@/lib/nav-counts";
import { DEFAULT_OPPORTUNITY_SCORE_MIN } from "@/lib/constants/opportunities";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    opportunity: {
      count: vi.fn(),
    },
    rejection: {
      count: vi.fn(),
    },
    feed: {
      count: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/lib/prisma");

describe("getNavCounts", () => {
  beforeEach(() => {
    vi.mocked(prisma.opportunity.count).mockResolvedValue(0);
    vi.mocked(prisma.rejection.count).mockResolvedValue(0);
    vi.mocked(prisma.feed.count).mockResolvedValue(0);
  });

  it("returns counts for opportunities (new + default score min), applications, rejections, and feeds", async () => {
    vi.mocked(prisma.opportunity.count)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(8);
    vi.mocked(prisma.rejection.count).mockResolvedValue(25);
    vi.mocked(prisma.feed.count).mockResolvedValue(4);

    const result = await getNavCounts();

    expect(result).toEqual({
      opportunities: 5,
      applications: 8,
      rejections: 25,
      feeds: 4,
    });
  });

  it("queries opportunities with status new, score gte default min, and applications with status applied", async () => {
    vi.clearAllMocks();
    await getNavCounts();

    expect(prisma.opportunity.count).toHaveBeenCalledWith({
      where: { status: "new", score: { gte: DEFAULT_OPPORTUNITY_SCORE_MIN } },
    });
    expect(prisma.opportunity.count).toHaveBeenCalledWith({
      where: { status: "applied" },
    });
  });
});
