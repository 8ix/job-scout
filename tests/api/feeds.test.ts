import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";

vi.stubEnv("API_KEY", "test-key");
vi.stubEnv("NEXTAUTH_SECRET", "test-secret");

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

describe("GET /api/feeds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("returns all feeds ordered by name", async () => {
    const feeds = [
      { id: "f1", name: "Adzuna", createdAt: new Date() },
      { id: "f2", name: "Reed", createdAt: new Date() },
    ];
    prismaMock.feed.findMany.mockResolvedValue(feeds);

    const { GET } = await import("@/app/api/feeds/route");
    const request = new Request("http://localhost/api/feeds");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].name).toBe("Adzuna");
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { GET } = await import("@/app/api/feeds/route");
    const request = new Request("http://localhost/api/feeds");

    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});

describe("POST /api/feeds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("creates a feed with valid input", async () => {
    const created = { id: "f1", name: "Total Jobs", createdAt: new Date() };
    prismaMock.feed.findUnique.mockResolvedValue(null);
    prismaMock.feed.create.mockResolvedValue(created);

    const { POST } = await import("@/app/api/feeds/route");
    const request = new Request("http://localhost/api/feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Total Jobs" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.name).toBe("Total Jobs");
  });

  it("returns 400 for empty name", async () => {
    const { POST } = await import("@/app/api/feeds/route");
    const request = new Request("http://localhost/api/feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 409 when feed name already exists", async () => {
    prismaMock.feed.findUnique.mockResolvedValue({
      id: "f1",
      name: "Adzuna",
      createdAt: new Date(),
    });

    const { POST } = await import("@/app/api/feeds/route");
    const request = new Request("http://localhost/api/feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Adzuna" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBeDefined();
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { POST } = await import("@/app/api/feeds/route");
    const request = new Request("http://localhost/api/feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/feeds/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("deletes a feed with no associated data", async () => {
    prismaMock.feed.findUnique.mockResolvedValue({
      id: "f1",
      name: "Empty Feed",
      createdAt: new Date(),
    });
    prismaMock.opportunity.count.mockResolvedValue(0);
    prismaMock.rejection.count.mockResolvedValue(0);
    prismaMock.feedHeartbeat.count.mockResolvedValue(0);
    prismaMock.feed.delete.mockResolvedValue({});

    const { DELETE } = await import("@/app/api/feeds/[id]/route");
    const request = new Request("http://localhost/api/feeds/f1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "f1" }) });
    expect(response.status).toBe(204);
  });

  it("returns 409 when feed has associated data", async () => {
    prismaMock.feed.findUnique.mockResolvedValue({
      id: "f1",
      name: "Adzuna",
      createdAt: new Date(),
    });
    prismaMock.opportunity.count.mockResolvedValue(5);
    prismaMock.rejection.count.mockResolvedValue(0);
    prismaMock.feedHeartbeat.count.mockResolvedValue(0);

    const { DELETE } = await import("@/app/api/feeds/[id]/route");
    const request = new Request("http://localhost/api/feeds/f1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "f1" }) });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBeDefined();
  });

  it("returns 404 for non-existent feed", async () => {
    prismaMock.feed.findUnique.mockResolvedValue(null);

    const { DELETE } = await import("@/app/api/feeds/[id]/route");
    const request = new Request("http://localhost/api/feeds/bad-id", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "bad-id" }) });
    expect(response.status).toBe(404);
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { DELETE } = await import("@/app/api/feeds/[id]/route");
    const request = new Request("http://localhost/api/feeds/f1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "f1" }) });
    expect(response.status).toBe(401);
  });
});
