import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";
import { buildOpportunity, buildOpportunityInput } from "../helpers/factories";

vi.stubEnv("API_KEY", "test-key");
vi.stubEnv("NEXTAUTH_SECRET", "test-secret");

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

describe("POST /api/opportunities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new opportunity with valid input and API key", async () => {
    const input = buildOpportunityInput();
    const created = buildOpportunity({ ...input, id: "uuid-1" });
    prismaMock.opportunity.findUnique.mockResolvedValue(null);
    prismaMock.opportunity.create.mockResolvedValue(created);

    const { POST } = await import("@/app/api/opportunities/route");
    const request = new Request("http://localhost/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
      body: JSON.stringify(input),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.id).toBe("uuid-1");
    expect(prismaMock.opportunity.create).toHaveBeenCalledOnce();
  });

  it("returns 200 for duplicate (source, jobId) instead of creating", async () => {
    const input = buildOpportunityInput({ jobId: "dup-123", source: "Adzuna" });
    const existing = buildOpportunity({ ...input, id: "existing-id" });
    prismaMock.opportunity.findUnique.mockResolvedValue(existing);

    const { POST } = await import("@/app/api/opportunities/route");
    const request = new Request("http://localhost/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
      body: JSON.stringify(input),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe("existing-id");
    expect(prismaMock.opportunity.create).not.toHaveBeenCalled();
  });

  it("returns 401 without API key", async () => {
    const { POST } = await import("@/app/api/opportunities/route");
    const request = new Request("http://localhost/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildOpportunityInput()),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid input", async () => {
    const { POST } = await import("@/app/api/opportunities/route");
    const request = new Request("http://localhost/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
      body: JSON.stringify({ title: "Missing required fields" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for score outside range", async () => {
    const { POST } = await import("@/app/api/opportunities/route");
    const input = buildOpportunityInput({ score: 15 });
    const request = new Request("http://localhost/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
      body: JSON.stringify(input),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

describe("GET /api/opportunities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("returns paginated opportunities", async () => {
    const opps = [buildOpportunity(), buildOpportunity()];
    prismaMock.opportunity.findMany.mockResolvedValue(opps);
    prismaMock.opportunity.count.mockResolvedValue(2);

    const { GET } = await import("@/app/api/opportunities/route");
    const request = new Request("http://localhost/api/opportunities?page=1&limit=20");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.total).toBe(2);
    expect(body.page).toBe(1);
  });

  it("applies status filter", async () => {
    prismaMock.opportunity.findMany.mockResolvedValue([]);
    prismaMock.opportunity.count.mockResolvedValue(0);

    const { GET } = await import("@/app/api/opportunities/route");
    const request = new Request("http://localhost/api/opportunities?status=applied");

    await GET(request);

    const findManyCall = prismaMock.opportunity.findMany.mock.calls[0][0];
    expect(findManyCall.where.status).toBe("applied");
  });

  it("applies source filter", async () => {
    prismaMock.opportunity.findMany.mockResolvedValue([]);
    prismaMock.opportunity.count.mockResolvedValue(0);

    const { GET } = await import("@/app/api/opportunities/route");
    const request = new Request("http://localhost/api/opportunities?source=Adzuna");

    await GET(request);

    const findManyCall = prismaMock.opportunity.findMany.mock.calls[0][0];
    expect(findManyCall.where.source).toBe("Adzuna");
  });

  it("applies score_min filter", async () => {
    prismaMock.opportunity.findMany.mockResolvedValue([]);
    prismaMock.opportunity.count.mockResolvedValue(0);

    const { GET } = await import("@/app/api/opportunities/route");
    const request = new Request("http://localhost/api/opportunities?score_min=7");

    await GET(request);

    const findManyCall = prismaMock.opportunity.findMany.mock.calls[0][0];
    expect(findManyCall.where.score.gte).toBe(7);
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { GET } = await import("@/app/api/opportunities/route");
    const request = new Request("http://localhost/api/opportunities");

    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});

describe("GET /api/opportunities/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("returns a single opportunity", async () => {
    const opp = buildOpportunity({ id: "test-id" });
    prismaMock.opportunity.findUnique.mockResolvedValue(opp);

    const { GET } = await import("@/app/api/opportunities/[id]/route");
    const request = new Request("http://localhost/api/opportunities/test-id");

    const response = await GET(request, { params: Promise.resolve({ id: "test-id" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe("test-id");
  });

  it("returns 404 when not found", async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue(null);

    const { GET } = await import("@/app/api/opportunities/[id]/route");
    const request = new Request("http://localhost/api/opportunities/missing");

    const response = await GET(request, { params: Promise.resolve({ id: "missing" }) });
    expect(response.status).toBe(404);
  });
});

describe("PATCH /api/opportunities/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("updates status to applied and sets appliedAt", async () => {
    const updated = buildOpportunity({ id: "test-id", status: "applied", appliedAt: new Date() });
    prismaMock.opportunity.update.mockResolvedValue(updated);

    const { PATCH } = await import("@/app/api/opportunities/[id]/route");
    const request = new Request("http://localhost/api/opportunities/test-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "applied" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "test-id" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("applied");

    const updateCall = prismaMock.opportunity.update.mock.calls[0][0];
    expect(updateCall.data.appliedAt).toBeDefined();
  });

  it("updates status to rejected without setting appliedAt", async () => {
    const updated = buildOpportunity({ id: "test-id", status: "rejected" });
    prismaMock.opportunity.update.mockResolvedValue(updated);

    const { PATCH } = await import("@/app/api/opportunities/[id]/route");
    const request = new Request("http://localhost/api/opportunities/test-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });

    await PATCH(request, { params: Promise.resolve({ id: "test-id" }) });

    const updateCall = prismaMock.opportunity.update.mock.calls[0][0];
    expect(updateCall.data.appliedAt).toBeUndefined();
  });

  it("returns 404 when opportunity does not exist", async () => {
    const prismaError = new Error("Record not found");
    Object.assign(prismaError, { code: "P2025" });
    prismaMock.opportunity.update.mockRejectedValue(prismaError);

    const { PATCH } = await import("@/app/api/opportunities/[id]/route");
    const request = new Request("http://localhost/api/opportunities/non-existent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "applied" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "non-existent" }) });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Not found");
  });

  it("returns 400 for invalid status", async () => {
    const { PATCH } = await import("@/app/api/opportunities/[id]/route");
    const request = new Request("http://localhost/api/opportunities/test-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "invalid-status" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "test-id" }) });
    expect(response.status).toBe(400);
  });
});
