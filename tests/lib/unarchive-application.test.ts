import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";
import { buildOpportunity, buildApplicationStageLog } from "../helpers/factories";

describe("unarchiveApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("restores a stale_auto archived application to the last active stage", async () => {
    const existing = buildOpportunity({
      id: "opp-1",
      status: "rejected",
      stage: "Archived",
      applicationClosedReason: "stale_auto",
      jobId: "job-abc",
      source: "Adzuna",
      appliedAt: new Date("2026-01-01"),
    });

    const logs = [
      buildApplicationStageLog({ opportunityId: "opp-1", stage: "Archived", createdAt: new Date("2026-03-01") }),
      buildApplicationStageLog({ opportunityId: "opp-1", stage: "Screening", createdAt: new Date("2026-01-05") }),
      buildApplicationStageLog({ opportunityId: "opp-1", stage: "Applied", createdAt: new Date("2026-01-01") }),
    ];

    prismaMock.applicationStageLog.findMany.mockResolvedValue(logs);
    const restored = { ...existing, status: "applied", stage: "Screening", applicationClosedReason: null };
    prismaMock.opportunity.update.mockResolvedValue(restored);
    prismaMock.applicationStageLog.create.mockResolvedValue(
      buildApplicationStageLog({ opportunityId: "opp-1", stage: "Screening" })
    );
    prismaMock.rejection.deleteMany.mockResolvedValue({ count: 1 });

    const { unarchiveApplication } = await import(
      "@/lib/applications/unarchive-application"
    );
    const result = await unarchiveApplication(prismaMock as never, "opp-1", existing as never);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(prismaMock.opportunity.update).toHaveBeenCalledWith({
      where: { id: "opp-1" },
      data: {
        status: "applied",
        stage: "Screening",
        applicationClosedReason: null,
      },
    });

    expect(prismaMock.applicationStageLog.create).toHaveBeenCalledWith({
      data: { opportunityId: "opp-1", stage: "Screening" },
    });

    expect(prismaMock.rejection.deleteMany).toHaveBeenCalledWith({
      where: { jobId: "job-abc", source: "Adzuna" },
    });
  });

  it("falls back to Applied when all stage logs are terminal", async () => {
    const existing = buildOpportunity({
      id: "opp-2",
      status: "rejected",
      stage: "Rejected",
      applicationClosedReason: "employer_rejected",
      jobId: "job-xyz",
      source: "Reed",
    });

    const logs = [
      buildApplicationStageLog({ opportunityId: "opp-2", stage: "Rejected", createdAt: new Date() }),
    ];

    prismaMock.applicationStageLog.findMany.mockResolvedValue(logs);
    prismaMock.opportunity.update.mockResolvedValue({
      ...existing,
      status: "applied",
      stage: "Applied",
      applicationClosedReason: null,
    });
    prismaMock.applicationStageLog.create.mockResolvedValue(
      buildApplicationStageLog({ opportunityId: "opp-2", stage: "Applied" })
    );
    prismaMock.rejection.deleteMany.mockResolvedValue({ count: 0 });

    const { unarchiveApplication } = await import(
      "@/lib/applications/unarchive-application"
    );
    const result = await unarchiveApplication(prismaMock as never, "opp-2", existing as never);

    expect(result.ok).toBe(true);
    expect(prismaMock.opportunity.update).toHaveBeenCalledWith({
      where: { id: "opp-2" },
      data: {
        status: "applied",
        stage: "Applied",
        applicationClosedReason: null,
      },
    });
  });

  it("falls back to Applied when no stage logs exist", async () => {
    const existing = buildOpportunity({
      id: "opp-3",
      status: "rejected",
      stage: "Archived",
      applicationClosedReason: "user_archived",
      jobId: "job-no-logs",
      source: "Adzuna",
    });

    prismaMock.applicationStageLog.findMany.mockResolvedValue([]);
    prismaMock.opportunity.update.mockResolvedValue({
      ...existing,
      status: "applied",
      stage: "Applied",
      applicationClosedReason: null,
    });
    prismaMock.applicationStageLog.create.mockResolvedValue(
      buildApplicationStageLog({ opportunityId: "opp-3", stage: "Applied" })
    );
    prismaMock.rejection.deleteMany.mockResolvedValue({ count: 0 });

    const { unarchiveApplication } = await import(
      "@/lib/applications/unarchive-application"
    );
    const result = await unarchiveApplication(prismaMock as never, "opp-3", existing as never);

    expect(result.ok).toBe(true);
    expect(prismaMock.opportunity.update).toHaveBeenCalledWith({
      where: { id: "opp-3" },
      data: {
        status: "applied",
        stage: "Applied",
        applicationClosedReason: null,
      },
    });
  });

  it("returns error if opportunity is not archived", async () => {
    const existing = buildOpportunity({
      id: "opp-4",
      status: "applied",
      stage: "Screening",
    });

    const { unarchiveApplication } = await import(
      "@/lib/applications/unarchive-application"
    );
    const result = await unarchiveApplication(prismaMock as never, "opp-4", existing as never);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(prismaMock.opportunity.update).not.toHaveBeenCalled();
  });
});
