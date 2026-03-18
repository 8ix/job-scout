import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";
import { buildRejection } from "../helpers/factories";

vi.stubEnv("API_KEY", "test-key");
vi.stubEnv("NEXTAUTH_SECRET", "test-secret");

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

describe("POST /api/rejections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.feed.findUnique.mockResolvedValue({ id: "f1", name: "Reed", createdAt: new Date() });
  });

  it("creates a rejection with valid input and API key", async () => {
    const input = {
      jobId: "job-abc",
      source: "Reed",
      title: "Junior PHP Developer",
      company: "Some Corp",
      url: "https://example.com/job/456",
      score: 2,
      redFlags: "PHP only",
    };
    const created = buildRejection({ ...input, id: "uuid-rej" });
    prismaMock.rejection.create.mockResolvedValue(created);

    const { POST } = await import("@/app/api/rejections/route");
    const request = new Request("http://localhost/api/rejections", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
      body: JSON.stringify(input),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.id).toBe("uuid-rej");
  });

  it("returns 401 without API key", async () => {
    const { POST } = await import("@/app/api/rejections/route");
    const request = new Request("http://localhost/api/rejections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid input", async () => {
    const { POST } = await import("@/app/api/rejections/route");
    const request = new Request("http://localhost/api/rejections", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
      body: JSON.stringify({ title: "Missing fields" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

describe("GET /api/rejections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("returns paginated rejections", async () => {
    const rejs = [buildRejection(), buildRejection()];
    prismaMock.rejection.findMany.mockResolvedValue(rejs);
    prismaMock.rejection.count.mockResolvedValue(2);

    const { GET } = await import("@/app/api/rejections/route");
    const request = new Request("http://localhost/api/rejections?page=1&limit=20");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.total).toBe(2);
  });

  it("applies source filter", async () => {
    prismaMock.rejection.findMany.mockResolvedValue([]);
    prismaMock.rejection.count.mockResolvedValue(0);

    const { GET } = await import("@/app/api/rejections/route");
    const request = new Request("http://localhost/api/rejections?source=Adzuna");

    await GET(request);

    const findManyCall = prismaMock.rejection.findMany.mock.calls[0][0];
    expect(findManyCall.where.source).toBe("Adzuna");
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { GET } = await import("@/app/api/rejections/route");
    const request = new Request("http://localhost/api/rejections");

    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});
