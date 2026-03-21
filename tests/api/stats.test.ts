import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";

vi.stubEnv("API_KEY", "test-key");
vi.stubEnv("NEXTAUTH_SECRET", "test-secret");

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

describe("GET /api/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("returns aggregated stats with byScore bands", async () => {
    prismaMock.opportunity.count
      .mockResolvedValueOnce(100)   // total
      .mockResolvedValueOnce(15);  // applied
    prismaMock.rejection.count.mockResolvedValue(50);
    prismaMock.$queryRaw.mockResolvedValue([
      { score: 3, count: 20n },
      { score: 6, count: 10n },
      { score: 7, count: 15n },
      { score: 8, count: 25n },
      { score: 9, count: 20n },
      { score: 10, count: 10n },
    ]);
    prismaMock.opportunity.groupBy
      .mockResolvedValueOnce([
        { source: "Adzuna", _count: { id: 60 } },
        { source: "Reed", _count: { id: 40 } },
      ])
      .mockResolvedValueOnce([
        { createdAt: new Date("2026-03-15"), _count: { id: 5 } },
        { createdAt: new Date("2026-03-16"), _count: { id: 8 } },
      ]);

    const { GET } = await import("@/app/api/stats/route");
    const request = new Request("http://localhost/api/stats");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totalOpportunities).toBe(100);
    expect(body.totalRejections).toBe(50);
    expect(body.applied).toBe(15);
    expect(body.conversionRate).toBeCloseTo(0.15);
    expect(body.bySource).toHaveLength(2);
    expect(body.byScore).toEqual([
      { band: "0–5", count: 20 },
      { band: "6", count: 10 },
      { band: "7", count: 15 },
      { band: "8", count: 25 },
      { band: "9", count: 20 },
      { band: "10", count: 10 },
    ]);
  });

  it("handles empty state gracefully", async () => {
    prismaMock.opportunity.count
      .mockResolvedValueOnce(0)   // total
      .mockResolvedValueOnce(0);  // applied
    prismaMock.rejection.count.mockResolvedValue(0);
    prismaMock.$queryRaw.mockResolvedValue([]);
    prismaMock.opportunity.groupBy
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const { GET } = await import("@/app/api/stats/route");
    const request = new Request("http://localhost/api/stats");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totalOpportunities).toBe(0);
    expect(body.conversionRate).toBe(0);
    expect(body.bySource).toEqual([]);
    expect(body.byScore).toEqual([
      { band: "0–5", count: 0 },
      { band: "6", count: 0 },
      { band: "7", count: 0 },
      { band: "8", count: 0 },
      { band: "9", count: 0 },
      { band: "10", count: 0 },
    ]);
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { GET } = await import("@/app/api/stats/route");
    const request = new Request("http://localhost/api/stats");

    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});
