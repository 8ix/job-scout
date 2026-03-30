import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";

vi.stubEnv("NEXTAUTH_SECRET", "test-secret");

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

describe("/api/settings/application-workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("GET returns staleIdleDays", async () => {
    prismaMock.applicationWorkflowSettings.findUnique.mockResolvedValue({
      id: "default",
      staleIdleDays: 40,
    });

    const { GET } = await import("@/app/api/settings/application-workflow/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.staleIdleDays).toBe(40);
  });

  it("PATCH updates staleIdleDays", async () => {
    prismaMock.applicationWorkflowSettings.upsert.mockResolvedValue({
      id: "default",
      staleIdleDays: 45,
    });

    const { PATCH } = await import("@/app/api/settings/application-workflow/route");
    const res = await PATCH(
      new Request("http://localhost/api/settings/application-workflow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staleIdleDays: 45 }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.staleIdleDays).toBe(45);
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const { GET } = await import("@/app/api/settings/application-workflow/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
