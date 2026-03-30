import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";
import { RESET_CONFIRM_PHRASE } from "@/lib/validators/application-workflow";

vi.stubEnv("NEXTAUTH_SECRET", "test-secret");
vi.stubEnv("DASHBOARD_PASSWORD", "dashboard-plain-pass");

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

describe("POST /api/settings/reset-application-data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => Promise<void>) => {
      await fn(prismaMock);
    });
    prismaMock.opportunity.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.rejection.deleteMany.mockResolvedValue({ count: 5 });
  });

  it("returns 401 with wrong password", async () => {
    const { POST } = await import("@/app/api/settings/reset-application-data/route");
    const res = await POST(
      new Request("http://localhost/api/settings/reset-application-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: "wrong",
          confirmPhrase: RESET_CONFIRM_PHRASE,
          deleteApplicationHistory: true,
          deleteAllRejections: true,
          deleteAllOpportunities: false,
        }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("deletes per scope when password and phrase match", async () => {
    const { POST } = await import("@/app/api/settings/reset-application-data/route");
    const res = await POST(
      new Request("http://localhost/api/settings/reset-application-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: "dashboard-plain-pass",
          confirmPhrase: RESET_CONFIRM_PHRASE,
          deleteApplicationHistory: true,
          deleteAllRejections: true,
          deleteAllOpportunities: false,
        }),
      })
    );
    expect(res.status).toBe(200);
    expect(prismaMock.opportunity.deleteMany).toHaveBeenCalledWith({
      where: { appliedAt: { not: null } },
    });
    expect(prismaMock.rejection.deleteMany).toHaveBeenCalled();
  });

  it("deleteAllOpportunities wipes full table", async () => {
    const { POST } = await import("@/app/api/settings/reset-application-data/route");
    await POST(
      new Request("http://localhost/api/settings/reset-application-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: "dashboard-plain-pass",
          confirmPhrase: RESET_CONFIRM_PHRASE,
          deleteApplicationHistory: false,
          deleteAllRejections: false,
          deleteAllOpportunities: true,
        }),
      })
    );
    expect(prismaMock.opportunity.deleteMany).toHaveBeenCalledWith();
  });
});
