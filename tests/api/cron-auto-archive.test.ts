import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";

describe("GET /api/cron/auto-archive-stale-applications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv("CRON_SECRET", "cron-secret");
    prismaMock.opportunity.findMany.mockResolvedValue([]);
  });

  it("returns 401 without Authorization", async () => {
    const { GET } = await import("@/app/api/cron/auto-archive-stale-applications/route");
    const res = await GET(new Request("http://localhost/api/cron/auto-archive-stale-applications"));
    expect(res.status).toBe(401);
  });

  it("returns archived count when authorized", async () => {
    prismaMock.applicationWorkflowSettings.findUnique.mockResolvedValue({
      id: "default",
      staleIdleDays: 40,
    });
    prismaMock.applicationWorkflowSettings.create.mockResolvedValue({
      id: "default",
      staleIdleDays: 40,
    });

    const { GET } = await import("@/app/api/cron/auto-archive-stale-applications/route");
    const res = await GET(
      new Request("http://localhost/api/cron/auto-archive-stale-applications", {
        headers: { Authorization: "Bearer cron-secret" },
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.archived).toBe(0);
  });
});
