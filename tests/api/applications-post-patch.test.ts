import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";

vi.stubEnv("API_KEY", "test-key");
vi.stubEnv("NEXTAUTH_SECRET", "test-secret");

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

describe("POST /api/applications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without session or API key", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const { POST } = await import("@/app/api/applications/route");
    const request = new Request("http://localhost/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Dev",
        company: "Co",
        url: "https://example.com/j",
        score: 7,
      }),
    });
    const res = await POST(request);
    expect(res.status).toBe(401);
  });

  it("creates manual application with session", async () => {
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
    const created = {
      id: "new-id",
      jobId: "uuid",
      source: "manual",
      title: "Dev",
      company: "Co",
      score: 7,
      status: "applied",
      stage: "Applied",
    };
    prismaMock.opportunity.create.mockResolvedValue(created);
    prismaMock.applicationStageLog.create.mockResolvedValue({});

    const { POST } = await import("@/app/api/applications/route");
    const request = new Request("http://localhost/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Dev",
        company: "Co",
        url: "https://example.com/j",
        score: 7,
      }),
    });
    const res = await POST(request);
    expect(res.status).toBe(201);
    expect(prismaMock.opportunity.create).toHaveBeenCalled();
    expect(prismaMock.applicationStageLog.create).toHaveBeenCalled();
  });

  it("accepts X-API-Key without session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const created = {
      id: "new-id",
      jobId: "uuid",
      source: "manual",
      title: "Dev",
      company: "Co",
      score: 8,
      status: "applied",
      stage: "Applied",
    };
    prismaMock.opportunity.create.mockResolvedValue(created);
    prismaMock.applicationStageLog.create.mockResolvedValue({});

    const { POST } = await import("@/app/api/applications/route");
    const request = new Request("http://localhost/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "test-key",
      },
      body: JSON.stringify({
        title: "Dev",
        company: "Co",
        url: "https://example.com/j",
        score: 8,
      }),
    });
    const res = await POST(request);
    expect(res.status).toBe(201);
  });
});

describe("PATCH /api/applications/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("updates fields for an existing opportunity", async () => {
    const existing = {
      id: "o1",
      jobId: "j1",
      source: "manual",
      title: "T",
      company: "C",
      score: 7,
      status: "applied",
      stage: "Applied",
      url: "https://x.com",
      verdict: null,
      matchReasons: null,
      redFlags: null,
      description: null,
      location: null,
      workingModel: null,
      listingType: null,
      salaryMin: null,
      salaryMax: null,
      appliedAt: new Date(),
      postedAt: null,
      createdAt: new Date(),
      appliedVia: null,
      recruiterContact: null,
      fullJobSpecification: null,
    };
    const updated = { ...existing, title: "New title" };
    prismaMock.opportunity.findUnique.mockResolvedValue(existing);
    prismaMock.opportunity.update.mockResolvedValue(updated);

    const { PATCH } = await import("@/app/api/applications/[id]/route");
    const request = new Request("http://localhost/api/applications/o1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New title" }),
    });
    const res = await PATCH(request, { params: Promise.resolve({ id: "o1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe("New title");
  });
});
