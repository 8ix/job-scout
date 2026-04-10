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

describe("POST /api/opportunities/:id/unarchive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("restores an archived application and returns 200", async () => {
    const existing = buildOpportunity({
      id: "opp-1",
      status: "rejected",
      stage: "Archived",
      applicationClosedReason: "stale_auto",
      jobId: "job-abc",
      source: "Adzuna",
      appliedAt: new Date("2026-01-15"),
    });

    prismaMock.opportunity.findUnique.mockResolvedValue(existing);
    prismaMock.applicationStageLog.findMany.mockResolvedValue([
      buildApplicationStageLog({ opportunityId: "opp-1", stage: "Archived", createdAt: new Date("2026-03-20") }),
      buildApplicationStageLog({ opportunityId: "opp-1", stage: "Screening", createdAt: new Date("2026-01-20") }),
      buildApplicationStageLog({ opportunityId: "opp-1", stage: "Applied", createdAt: new Date("2026-01-15") }),
    ]);
    const restored = {
      ...existing,
      status: "applied",
      stage: "Screening",
      applicationClosedReason: null,
    };
    prismaMock.opportunity.update.mockResolvedValue(restored);
    prismaMock.applicationStageLog.create.mockResolvedValue(
      buildApplicationStageLog({ opportunityId: "opp-1", stage: "Screening" })
    );
    prismaMock.rejection.deleteMany.mockResolvedValue({ count: 1 });

    const { POST } = await import("@/app/api/opportunities/[id]/unarchive/route");
    const request = new Request("http://localhost/api/opportunities/opp-1/unarchive", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "opp-1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("applied");
    expect(body.stage).toBe("Screening");
    expect(body.applicationClosedReason).toBeNull();
  });

  it("returns 401 without a session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { POST } = await import("@/app/api/opportunities/[id]/unarchive/route");
    const request = new Request("http://localhost/api/opportunities/opp-1/unarchive", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "opp-1" }) });
    expect(response.status).toBe(401);
  });

  it("returns 404 for an unknown opportunity", async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue(null);

    const { POST } = await import("@/app/api/opportunities/[id]/unarchive/route");
    const request = new Request("http://localhost/api/opportunities/missing/unarchive", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "missing" }) });
    expect(response.status).toBe(404);
  });

  it("returns 400 when the opportunity is not archived", async () => {
    const existing = buildOpportunity({
      id: "opp-active",
      status: "applied",
      stage: "Screening",
    });
    prismaMock.opportunity.findUnique.mockResolvedValue(existing);

    const { POST } = await import("@/app/api/opportunities/[id]/unarchive/route");
    const request = new Request("http://localhost/api/opportunities/opp-active/unarchive", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "opp-active" }) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/archived/i);
  });
});
