import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";
import { buildFeedHeartbeat } from "../helpers/factories";

vi.stubEnv("API_KEY", "test-key");
vi.stubEnv("NEXTAUTH_SECRET", "test-secret");

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

describe("POST /api/heartbeats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.feed.findUnique.mockResolvedValue({ id: "f1", name: "Adzuna", createdAt: new Date() });
  });

  it("creates a heartbeat with valid input and API key", async () => {
    const input = {
      source: "Adzuna",
      jobsReceived: 50,
      jobsNew: 10,
      jobsScored: 10,
      jobsOpportunity: 3,
      ranAt: new Date().toISOString(),
    };
    const created = buildFeedHeartbeat({ ...input, id: "hb-1" });
    prismaMock.feedHeartbeat.create.mockResolvedValue(created);

    const { POST } = await import("@/app/api/heartbeats/route");
    const request = new Request("http://localhost/api/heartbeats", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
      body: JSON.stringify(input),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.id).toBe("hb-1");
  });

  it("returns 401 without API key", async () => {
    const { POST } = await import("@/app/api/heartbeats/route");
    const request = new Request("http://localhost/api/heartbeats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid input", async () => {
    const { POST } = await import("@/app/api/heartbeats/route");
    const request = new Request("http://localhost/api/heartbeats", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
      body: JSON.stringify({ source: "InvalidSource" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

describe("GET /api/heartbeats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("returns heartbeats list", async () => {
    const hbs = [buildFeedHeartbeat(), buildFeedHeartbeat()];
    prismaMock.feedHeartbeat.findMany.mockResolvedValue(hbs);

    const { GET } = await import("@/app/api/heartbeats/route");
    const request = new Request("http://localhost/api/heartbeats");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
  });

  it("filters by source", async () => {
    prismaMock.feedHeartbeat.findMany.mockResolvedValue([]);

    const { GET } = await import("@/app/api/heartbeats/route");
    const request = new Request("http://localhost/api/heartbeats?source=Reed");

    await GET(request);

    const call = prismaMock.feedHeartbeat.findMany.mock.calls[0][0];
    expect(call.where.source).toBe("Reed");
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { GET } = await import("@/app/api/heartbeats/route");
    const request = new Request("http://localhost/api/heartbeats");

    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});
