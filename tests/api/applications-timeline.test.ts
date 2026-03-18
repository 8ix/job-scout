import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";
import { buildOpportunity, buildApplicationStageLog } from "../helpers/factories";

vi.stubEnv("API_KEY", "test-key");
vi.stubEnv("NEXTAUTH_SECRET", "test-secret");

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

describe("GET /api/applications/timeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("returns applications with stage timelines for reporting", async () => {
    const opp = buildOpportunity({
      id: "opp-1",
      status: "applied",
      stage: "Interview",
      title: "Senior Dev",
      company: "Acme",
      source: "Reed",
      appliedAt: new Date("2026-03-01T10:00:00Z"),
    });
    const logs = [
      buildApplicationStageLog({
        id: "log-1",
        opportunityId: "opp-1",
        stage: "Applied",
        createdAt: new Date("2026-03-01T10:00:00Z"),
      }),
      buildApplicationStageLog({
        id: "log-2",
        opportunityId: "opp-1",
        stage: "Screening",
        createdAt: new Date("2026-03-05T14:00:00Z"),
      }),
      buildApplicationStageLog({
        id: "log-3",
        opportunityId: "opp-1",
        stage: "Interview",
        createdAt: new Date("2026-03-10T09:00:00Z"),
      }),
    ];
    prismaMock.opportunity.findMany.mockResolvedValue([
      { ...opp, stageLogs: logs },
    ]);

    const { GET } = await import("@/app/api/applications/timeline/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("opp-1");
    expect(body[0].title).toBe("Senior Dev");
    expect(body[0].company).toBe("Acme");
    expect(body[0].stage).toBe("Interview");
    expect(body[0].stageTimeline).toHaveLength(3);
    expect(body[0].stageTimeline[0]).toEqual({
      stage: "Applied",
      changedAt: "2026-03-01T10:00:00.000Z",
    });
    expect(body[0].stageTimeline[1]).toEqual({
      stage: "Screening",
      changedAt: "2026-03-05T14:00:00.000Z",
    });
    expect(body[0].stageTimeline[2]).toEqual({
      stage: "Interview",
      changedAt: "2026-03-10T09:00:00.000Z",
    });
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { GET } = await import("@/app/api/applications/timeline/route");
    const response = await GET();

    expect(response.status).toBe(401);
  });
});
