import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";

vi.stubEnv("NEXTAUTH_SECRET", "test-secret");

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

const defaultRow = {
  id: "default",
  timezone: "UTC",
  weekStartsOn: 1,
  weeklyTargetCount: 0,
  monthlyTargetCount: 0,
};

describe("/api/preferences/application-goals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
    prismaMock.applicationGoalSettings.upsert.mockResolvedValue(defaultRow);
    prismaMock.applicationGoalSettings.update.mockResolvedValue(defaultRow);
  });

  it("GET returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const { GET } = await import("@/app/api/preferences/application-goals/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("GET returns settings with weekly and monthly null when targets are 0", async () => {
    const { GET } = await import("@/app/api/preferences/application-goals/route");
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.settings).toMatchObject({
      timezone: "UTC",
      weekStartsOn: 1,
      weeklyTargetCount: 0,
      monthlyTargetCount: 0,
    });
    expect(body.weekly).toBeNull();
    expect(body.monthly).toBeNull();
    expect(prismaMock.opportunity.count).not.toHaveBeenCalled();
  });

  it("GET returns weekly progress when weekly target is set", async () => {
    prismaMock.applicationGoalSettings.upsert.mockResolvedValue({
      ...defaultRow,
      weeklyTargetCount: 5,
    });
    prismaMock.opportunity.count.mockResolvedValueOnce(3).mockResolvedValueOnce(2);

    const { GET } = await import("@/app/api/preferences/application-goals/route");
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.weekly).not.toBeNull();
    expect(body.weekly.enabled).toBe(true);
    expect(body.weekly.target).toBe(5);
    expect(body.weekly.currentCount).toBe(3);
    expect(body.weekly.previousCount).toBe(2);
    expect(body.weekly.currentHit).toBe(false);
    expect(body.weekly.previousHit).toBe(false);
    expect(body.monthly).toBeNull();
    expect(prismaMock.opportunity.count).toHaveBeenCalledTimes(2);
  });

  it("GET returns both cadences when both targets are set", async () => {
    prismaMock.applicationGoalSettings.upsert.mockResolvedValue({
      ...defaultRow,
      weeklyTargetCount: 3,
      monthlyTargetCount: 10,
    });
    prismaMock.opportunity.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(5);

    const { GET } = await import("@/app/api/preferences/application-goals/route");
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.weekly?.currentCount).toBe(1);
    expect(body.monthly?.currentCount).toBe(4);
    expect(prismaMock.opportunity.count).toHaveBeenCalledTimes(4);
  });

  it("PATCH returns 400 for invalid timezone", async () => {
    const { PATCH } = await import("@/app/api/preferences/application-goals/route");
    const res = await PATCH(
      new Request("http://localhost/api/preferences/application-goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: "Invalid/Zone_XYZ" }),
      })
    );
    expect(res.status).toBe(400);
    expect(prismaMock.applicationGoalSettings.update).not.toHaveBeenCalled();
  });

  it("PATCH returns 400 when body is empty object", async () => {
    const { PATCH } = await import("@/app/api/preferences/application-goals/route");
    const res = await PATCH(
      new Request("http://localhost/api/preferences/application-goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
  });

  it("PATCH updates settings and returns dashboard payload", async () => {
    prismaMock.applicationGoalSettings.upsert.mockResolvedValue({
      ...defaultRow,
      weeklyTargetCount: 4,
      monthlyTargetCount: 0,
    });
    prismaMock.opportunity.count.mockResolvedValueOnce(4).mockResolvedValueOnce(0);

    const { PATCH } = await import("@/app/api/preferences/application-goals/route");
    const res = await PATCH(
      new Request("http://localhost/api/preferences/application-goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyTargetCount: 4, timezone: "UTC" }),
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(prismaMock.applicationGoalSettings.update).toHaveBeenCalledWith({
      where: { id: "default" },
      data: { weeklyTargetCount: 4, timezone: "UTC" },
    });
    expect(body.settings.weeklyTargetCount).toBe(4);
    expect(body.weekly?.currentHit).toBe(true);
  });
});
