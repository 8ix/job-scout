/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";

vi.stubEnv("NEXTAUTH_SECRET", "test-secret");

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

describe("POST /api/applications/import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const { POST } = await import("@/app/api/applications/import/route");
    const form = new FormData();
    form.set(
      "file",
      new File(["external_id,application_date,company,role\n1,2026-01-01,X,Y"], "t.csv", { type: "text/csv" })
    );
    const res = await POST(
      new Request("http://localhost/api/applications/import", { method: "POST", body: form })
    );
    expect(res.status).toBe(401);
  });

  it("creates applications from CSV", async () => {
    prismaMock.opportunity.create.mockResolvedValue({ id: "opp-1" } as never);
    prismaMock.applicationStageLog.create.mockResolvedValue({} as never);

    const { POST } = await import("@/app/api/applications/import/route");
    const form = new FormData();
    form.set(
      "file",
      new File(["external_id,application_date,company,role\n1,2026-01-01,X,Y"], "t.csv", { type: "text/csv" })
    );
    const res = await POST(
      new Request("http://localhost/api/applications/import", { method: "POST", body: form })
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.created).toBe(1);
    expect(body.skipped).toBe(0);
    expect(prismaMock.opportunity.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.applicationStageLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { opportunityId: "opp-1", stage: "Applied" },
      })
    );
  });

  it("counts skipped rows on duplicate jobId", async () => {
    const { Prisma } = await import("@/generated/prisma/client");
    prismaMock.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("dup", { code: "P2002", clientVersion: "x" })
    );

    const { POST } = await import("@/app/api/applications/import/route");
    const form = new FormData();
    form.set(
      "file",
      new File(["external_id,application_date,company,role\n1,2026-01-01,X,Y"], "t.csv", { type: "text/csv" })
    );
    const res = await POST(
      new Request("http://localhost/api/applications/import", { method: "POST", body: form })
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.created).toBe(0);
    expect(body.skipped).toBe(1);
  });
});
