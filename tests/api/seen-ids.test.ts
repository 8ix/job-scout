import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";

vi.stubEnv("API_KEY", "test-key");

describe("GET /api/seen-ids", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns combined IDs from both tables for a valid source", async () => {
    prismaMock.opportunity.findMany.mockResolvedValue([
      { jobId: "opp-1" },
      { jobId: "opp-2" },
    ]);
    prismaMock.rejection.findMany.mockResolvedValue([
      { jobId: "rej-1" },
      { jobId: "rej-2" },
    ]);

    const { GET } = await import("@/app/api/seen-ids/route");
    const request = new Request(
      "http://localhost/api/seen-ids?source=Adzuna",
      { headers: { "X-API-Key": "test-key" } }
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("Adzuna");
    expect(body.ids).toEqual(
      expect.arrayContaining(["opp-1", "opp-2", "rej-1", "rej-2"])
    );
    expect(body.ids).toHaveLength(4);
  });

  it("deduplicates IDs that appear in both tables", async () => {
    prismaMock.opportunity.findMany.mockResolvedValue([
      { jobId: "shared-1" },
      { jobId: "opp-only" },
    ]);
    prismaMock.rejection.findMany.mockResolvedValue([
      { jobId: "shared-1" },
      { jobId: "rej-only" },
    ]);

    const { GET } = await import("@/app/api/seen-ids/route");
    const request = new Request(
      "http://localhost/api/seen-ids?source=Reed",
      { headers: { "X-API-Key": "test-key" } }
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ids).toHaveLength(3);
    expect(body.ids).toEqual(
      expect.arrayContaining(["shared-1", "opp-only", "rej-only"])
    );
  });

  it("returns empty ids array when no records exist for the source", async () => {
    prismaMock.opportunity.findMany.mockResolvedValue([]);
    prismaMock.rejection.findMany.mockResolvedValue([]);

    const { GET } = await import("@/app/api/seen-ids/route");
    const request = new Request(
      "http://localhost/api/seen-ids?source=JSearch",
      { headers: { "X-API-Key": "test-key" } }
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("JSearch");
    expect(body.ids).toEqual([]);
  });

  it("returns 400 when source query param is missing", async () => {
    const { GET } = await import("@/app/api/seen-ids/route");
    const request = new Request("http://localhost/api/seen-ids", {
      headers: { "X-API-Key": "test-key" },
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns 400 when source is not a recognised enum value", async () => {
    const { GET } = await import("@/app/api/seen-ids/route");
    const request = new Request(
      "http://localhost/api/seen-ids?source=Indeed",
      { headers: { "X-API-Key": "test-key" } }
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns 401 without API key", async () => {
    const { GET } = await import("@/app/api/seen-ids/route");
    const request = new Request(
      "http://localhost/api/seen-ids?source=Adzuna"
    );

    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});
