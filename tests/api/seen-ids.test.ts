import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";

vi.stubEnv("API_KEY", "test-key");

describe("POST /api/seen-ids", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.feed.findUnique.mockResolvedValue({
      id: "f1",
      name: "Adzuna",
      createdAt: new Date(),
    });
    prismaMock.feed.findMany.mockResolvedValue([
      { name: "Adzuna" },
      { name: "JSearch" },
      { name: "Reed" },
    ]);
  });

  it("returns only IDs from the request that exist in opportunities or rejections", async () => {
    prismaMock.opportunity.findMany.mockResolvedValue([
      { jobId: "id1" },
      { jobId: "id2" },
    ]);
    prismaMock.rejection.findMany.mockResolvedValue([{ jobId: "id3" }]);

    const { POST } = await import("@/app/api/seen-ids/route");
    const request = new Request("http://localhost/api/seen-ids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "test-key",
      },
      body: JSON.stringify({ source: "Adzuna", ids: ["id1", "id2", "id3", "id4", "id5"] }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("Adzuna");
    expect(body.ids).toEqual(expect.arrayContaining(["id1", "id2", "id3"]));
    expect(body.ids).toHaveLength(3);
  });

  it("deduplicates IDs that appear in both opportunities and rejections", async () => {
    prismaMock.opportunity.findMany.mockResolvedValue([{ jobId: "shared" }]);
    prismaMock.rejection.findMany.mockResolvedValue([{ jobId: "shared" }]);

    const { POST } = await import("@/app/api/seen-ids/route");
    const request = new Request("http://localhost/api/seen-ids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "test-key",
      },
      body: JSON.stringify({ source: "Reed", ids: ["shared", "new-id"] }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ids).toEqual(["shared"]);
  });

  it("returns empty ids when none of the requested IDs exist", async () => {
    prismaMock.opportunity.findMany.mockResolvedValue([]);
    prismaMock.rejection.findMany.mockResolvedValue([]);

    const { POST } = await import("@/app/api/seen-ids/route");
    const request = new Request("http://localhost/api/seen-ids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "test-key",
      },
      body: JSON.stringify({ source: "JSearch", ids: ["unknown1", "unknown2"] }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("JSearch");
    expect(body.ids).toEqual([]);
  });

  it("returns empty ids when ids array is empty", async () => {
    prismaMock.opportunity.findMany.mockResolvedValue([]);
    prismaMock.rejection.findMany.mockResolvedValue([]);

    const { POST } = await import("@/app/api/seen-ids/route");
    const request = new Request("http://localhost/api/seen-ids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "test-key",
      },
      body: JSON.stringify({ source: "Adzuna", ids: [] }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ids).toEqual([]);
  });

  it("returns 400 when source is missing", async () => {
    const { POST } = await import("@/app/api/seen-ids/route");
    const request = new Request("http://localhost/api/seen-ids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "test-key",
      },
      body: JSON.stringify({ ids: ["id1"] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when source is not a recognised feed", async () => {
    prismaMock.feed.findUnique.mockResolvedValue(null);

    const { POST } = await import("@/app/api/seen-ids/route");
    const request = new Request("http://localhost/api/seen-ids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "test-key",
      },
      body: JSON.stringify({ source: "Indeed", ids: ["id1"] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when ids is not an array", async () => {
    const { POST } = await import("@/app/api/seen-ids/route");
    const request = new Request("http://localhost/api/seen-ids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "test-key",
      },
      body: JSON.stringify({ source: "Adzuna", ids: "not-array" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 401 without API key", async () => {
    const { POST } = await import("@/app/api/seen-ids/route");
    const request = new Request("http://localhost/api/seen-ids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "Adzuna", ids: ["id1"] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
