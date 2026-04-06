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
    prismaMock.feed.findUnique.mockResolvedValue({ id: "f1", name: "Adzuna", createdAt: new Date() });
    prismaMock.ingestBlockRule.findMany.mockResolvedValue([]);
    prismaMock.opportunity.findMany.mockResolvedValue([]);
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

  it("returns 422 when ingest blocklist matches company", async () => {
    prismaMock.ingestBlockRule.findMany.mockResolvedValue([
      { id: "rule-1", pattern: "Blocked Recruiter", scope: "company" },
    ]);
    const input = buildOpportunityInput({ company: "Blocked Recruiter LLC" });
    prismaMock.opportunity.findUnique.mockResolvedValue(null);
    prismaMock.rejection.findFirst.mockResolvedValue(null);
    prismaMock.rejection.create.mockResolvedValue({
      id: "rej-block-1",
      jobId: input.jobId,
      source: input.source,
      title: input.title,
      company: input.company,
      url: input.url,
      score: input.score,
      redFlags: "Blocked by ingest blocklist",
      ingestBlocklistRuleId: "rule-1",
      ingestBlocklistPattern: "Blocked Recruiter",
      ingestBlocklistScope: "company",
      createdAt: new Date(),
    });

    const { POST } = await import("@/app/api/opportunities/route");
    const response = await POST(
      new Request("http://localhost/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
        body: JSON.stringify(input),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.blocked).toBe(true);
    expect(body.matchedRuleId).toBe("rule-1");
    expect(body.pattern).toBe("Blocked Recruiter");
    expect(body.scope).toBe("company");
    expect(body.rejectionId).toBe("rej-block-1");
    expect(prismaMock.opportunity.create).not.toHaveBeenCalled();
    expect(prismaMock.rejection.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        jobId: input.jobId,
        source: input.source,
        ingestBlocklistRuleId: "rule-1",
        ingestBlocklistPattern: "Blocked Recruiter",
        ingestBlocklistScope: "company",
      }),
    });
  });

  it("updates existing rejection when same job is blocked again", async () => {
    prismaMock.ingestBlockRule.findMany.mockResolvedValue([
      { id: "rule-1", pattern: "Acme", scope: "company" },
    ]);
    const input = buildOpportunityInput({ jobId: "job-same", company: "Acme Staffing" });
    prismaMock.opportunity.findUnique.mockResolvedValue(null);
    prismaMock.rejection.findFirst.mockResolvedValue({ id: "rej-existing" });
    prismaMock.rejection.update.mockResolvedValue({
      id: "rej-existing",
      jobId: input.jobId,
      source: input.source,
      title: input.title,
      company: input.company,
      url: input.url,
      score: input.score,
      redFlags: "x",
      ingestBlocklistRuleId: "rule-1",
      ingestBlocklistPattern: "Acme",
      ingestBlocklistScope: "company",
      createdAt: new Date(),
    });

    const { POST } = await import("@/app/api/opportunities/route");
    const response = await POST(
      new Request("http://localhost/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
        body: JSON.stringify(input),
      })
    );

    expect(response.status).toBe(422);
    expect(prismaMock.rejection.create).not.toHaveBeenCalled();
    expect(prismaMock.rejection.update).toHaveBeenCalledWith({
      where: { id: "rej-existing" },
      data: expect.objectContaining({
        ingestBlocklistPattern: "Acme",
        ingestBlocklistRuleId: "rule-1",
      }),
    });
  });

  it("returns 422 when title+company matches a recent active application", async () => {
    const input = buildOpportunityInput({
      title: "Senior TypeScript Developer",
      company: "Acme Corp",
    });
    prismaMock.opportunity.findUnique.mockResolvedValue(null);
    prismaMock.opportunity.findMany.mockResolvedValue([
      buildOpportunity({
        id: "app-existing",
        title: "Senior TypeScript Developer",
        company: "Acme Corp",
        status: "applied",
        appliedAt: new Date(),
      }),
    ]);
    prismaMock.rejection.findFirst.mockResolvedValue(null);
    prismaMock.rejection.create.mockResolvedValue({
      id: "rej-dup-1",
      ...input,
      redFlags: "Duplicate listing",
      createdAt: new Date(),
    });

    const { POST } = await import("@/app/api/opportunities/route");
    const response = await POST(
      new Request("http://localhost/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
        body: JSON.stringify(input),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.blocked).toBe(true);
    expect(body.reason).toBe("recent_application_duplicate");
    expect(body.matchedApplicationId).toBe("app-existing");
    expect(body.rejectionId).toBe("rej-dup-1");
    expect(prismaMock.opportunity.create).not.toHaveBeenCalled();
  });

  it("matches case-insensitively with extra whitespace", async () => {
    const input = buildOpportunityInput({
      title: "senior  typescript  developer",
      company: "  acme corp  ",
    });
    prismaMock.opportunity.findUnique.mockResolvedValue(null);
    prismaMock.opportunity.findMany.mockResolvedValue([
      buildOpportunity({
        id: "app-fuzzy",
        title: "Senior TypeScript Developer",
        company: "Acme Corp",
        status: "applied",
        appliedAt: new Date(),
      }),
    ]);
    prismaMock.rejection.findFirst.mockResolvedValue(null);
    prismaMock.rejection.create.mockResolvedValue({
      id: "rej-fuzzy",
      ...input,
      redFlags: "Duplicate listing",
      createdAt: new Date(),
    });

    const { POST } = await import("@/app/api/opportunities/route");
    const response = await POST(
      new Request("http://localhost/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
        body: JSON.stringify(input),
      })
    );

    expect(response.status).toBe(422);
    expect((await response.json()).reason).toBe("recent_application_duplicate");
  });

  it("allows opportunity when matched application has status rejected", async () => {
    const input = buildOpportunityInput({
      title: "Senior TypeScript Developer",
      company: "Acme Corp",
    });
    prismaMock.opportunity.findUnique.mockResolvedValue(null);
    prismaMock.opportunity.findMany.mockResolvedValue([]);
    const created = buildOpportunity({ ...input, id: "new-opp" });
    prismaMock.opportunity.create.mockResolvedValue(created);

    const { POST } = await import("@/app/api/opportunities/route");
    const response = await POST(
      new Request("http://localhost/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
        body: JSON.stringify(input),
      })
    );

    expect(response.status).toBe(201);
    expect(prismaMock.opportunity.create).toHaveBeenCalledOnce();
  });

  it("allows opportunity when no active application shares the same title+company", async () => {
    const input = buildOpportunityInput({
      title: "Senior TypeScript Developer",
      company: "Acme Corp",
    });
    prismaMock.opportunity.findUnique.mockResolvedValue(null);
    prismaMock.opportunity.findMany.mockResolvedValue([
      buildOpportunity({
        title: "Backend Engineer",
        company: "Other Inc",
        status: "applied",
        appliedAt: new Date(),
      }),
    ]);
    const created = buildOpportunity({ ...input, id: "new-opp-2" });
    prismaMock.opportunity.create.mockResolvedValue(created);

    const { POST } = await import("@/app/api/opportunities/route");
    const response = await POST(
      new Request("http://localhost/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": "test-key" },
        body: JSON.stringify(input),
      })
    );

    expect(response.status).toBe(201);
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

  it("returns a single opportunity with stage timeline", async () => {
    const opp = buildOpportunity({ id: "test-id" });
    const stageLogs = [
      { id: "log-1", opportunityId: "test-id", stage: "Applied", createdAt: new Date("2026-03-01T10:00:00Z") },
      { id: "log-2", opportunityId: "test-id", stage: "Screening", createdAt: new Date("2026-03-05T14:00:00Z") },
    ];
    prismaMock.opportunity.findUnique.mockResolvedValue({
      ...opp,
      stageLogs,
      scheduledEvents: [],
    });

    const { GET } = await import("@/app/api/opportunities/[id]/route");
    const request = new Request("http://localhost/api/opportunities/test-id");

    const response = await GET(request, { params: Promise.resolve({ id: "test-id" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe("test-id");
    expect(body.stageLogs).toHaveLength(2);
    expect(body.stageLogs[0].stage).toBe("Applied");
    expect(body.stageLogs[1].stage).toBe("Screening");
    expect(body.stageLogs[0].createdAt).toBe("2026-03-01T10:00:00.000Z");
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
    const existing = buildOpportunity({ id: "test-id", status: "new" });
    const updated = buildOpportunity({ id: "test-id", status: "applied", appliedAt: new Date() });
    prismaMock.opportunity.findUnique.mockResolvedValue(existing);
    prismaMock.opportunity.update.mockResolvedValue(updated);
    prismaMock.applicationStageLog.create.mockResolvedValue({
      id: "log-1",
      opportunityId: "test-id",
      stage: "Applied",
      createdAt: new Date(),
    });

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
    expect(prismaMock.applicationStageLog.create).toHaveBeenCalledWith({
      data: { opportunityId: "test-id", stage: "Applied" },
    });
  });

  it("updates status to rejected without setting appliedAt", async () => {
    const existing = buildOpportunity({ id: "test-id", status: "new" });
    const updated = buildOpportunity({ id: "test-id", status: "rejected" });
    prismaMock.opportunity.findUnique.mockResolvedValue(existing);
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
    prismaMock.opportunity.findUnique.mockResolvedValue(null);

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
    prismaMock.opportunity.findUnique.mockResolvedValue(buildOpportunity({ id: "test-id" }));

    const { PATCH } = await import("@/app/api/opportunities/[id]/route");
    const request = new Request("http://localhost/api/opportunities/test-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "invalid-status" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "test-id" }) });
    expect(response.status).toBe(400);
  });

  it("sets stage to Rejected, creates Rejection, and sets status to rejected", async () => {
    const existing = buildOpportunity({
      id: "test-id",
      status: "applied",
      jobId: "job-123",
      source: "Adzuna",
      title: "Developer",
      company: "Acme",
      url: "https://example.com/job",
      score: 8,
    });
    const updated = buildOpportunity({
      ...existing,
      status: "rejected",
      stage: "Rejected",
    });
    prismaMock.opportunity.findUnique.mockResolvedValue(existing);
    prismaMock.opportunity.update.mockResolvedValue(updated);
    prismaMock.applicationStageLog.create.mockResolvedValue({ id: "log-1", opportunityId: "test-id", stage: "Rejected", createdAt: new Date() });
    prismaMock.rejection.create.mockResolvedValue({
      id: "rej-1",
      jobId: "job-123",
      source: "Adzuna",
      title: "Developer",
      company: "Acme",
      url: "https://example.com/job",
      score: 8,
      redFlags: "Organization rejected our application",
      createdAt: new Date(),
    });

    const { PATCH } = await import("@/app/api/opportunities/[id]/route");
    const request = new Request("http://localhost/api/opportunities/test-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "Rejected" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "test-id" }) });
    expect(response.status).toBe(200);

    const updateCall = prismaMock.opportunity.update.mock.calls[0][0];
    expect(updateCall.data.status).toBe("rejected");
    expect(updateCall.data.stage).toBe("Rejected");
    expect(updateCall.data.applicationClosedReason).toBe("employer_rejected");

    expect(prismaMock.rejection.create).toHaveBeenCalledWith({
      data: {
        jobId: "job-123",
        source: "Adzuna",
        title: "Developer",
        company: "Acme",
        url: "https://example.com/job",
        score: 8,
        redFlags: "Organization rejected our application",
      },
    });
    expect(prismaMock.applicationStageLog.create).toHaveBeenCalledWith({
      data: { opportunityId: "test-id", stage: "Rejected" },
    });
  });

  it("creates stage log when changing from Applied to Screening", async () => {
    const existing = buildOpportunity({
      id: "test-id",
      status: "applied",
      stage: "Applied",
    });
    const updated = buildOpportunity({ ...existing, stage: "Screening" });
    prismaMock.opportunity.findUnique.mockResolvedValue(existing);
    prismaMock.opportunity.update.mockResolvedValue(updated);
    prismaMock.applicationStageLog.create.mockResolvedValue({
      id: "log-1",
      opportunityId: "test-id",
      stage: "Screening",
      createdAt: new Date(),
    });

    const { PATCH } = await import("@/app/api/opportunities/[id]/route");
    const request = new Request("http://localhost/api/opportunities/test-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "Screening" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "test-id" }) });
    expect(response.status).toBe(200);
    expect(prismaMock.applicationStageLog.create).toHaveBeenCalledWith({
      data: { opportunityId: "test-id", stage: "Screening" },
    });
  });

  it("does not create duplicate Rejection when already Rejected", async () => {
    const existing = buildOpportunity({
      id: "test-id",
      status: "applied",
      stage: "Rejected",
    });
    const updated = buildOpportunity({ ...existing, status: "rejected", stage: "Rejected" });
    prismaMock.opportunity.findUnique.mockResolvedValue(existing);
    prismaMock.opportunity.update.mockResolvedValue(updated);

    const { PATCH } = await import("@/app/api/opportunities/[id]/route");
    const request = new Request("http://localhost/api/opportunities/test-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "Rejected" }),
    });

    await PATCH(request, { params: Promise.resolve({ id: "test-id" }) });

    expect(prismaMock.rejection.create).not.toHaveBeenCalled();
  });

  it("sets stage to Archived, creates Rejection with user-archived reason, and sets status to rejected", async () => {
    const existing = buildOpportunity({
      id: "test-id",
      status: "applied",
      jobId: "job-456",
      source: "Reed",
      title: "Engineer",
      company: "Beta Inc",
      url: "https://example.com/job2",
      score: 7,
    });
    const updated = buildOpportunity({
      ...existing,
      status: "rejected",
      stage: "Archived",
    });
    prismaMock.opportunity.findUnique.mockResolvedValue(existing);
    prismaMock.opportunity.update.mockResolvedValue(updated);
    prismaMock.applicationStageLog.create.mockResolvedValue({ id: "log-2", opportunityId: "test-id", stage: "Archived", createdAt: new Date() });
    prismaMock.rejection.create.mockResolvedValue({
      id: "rej-2",
      jobId: "job-456",
      source: "Reed",
      title: "Engineer",
      company: "Beta Inc",
      url: "https://example.com/job2",
      score: 7,
      redFlags: "Archived by user",
      createdAt: new Date(),
    });

    const { PATCH } = await import("@/app/api/opportunities/[id]/route");
    const request = new Request("http://localhost/api/opportunities/test-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "Archived" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "test-id" }) });
    expect(response.status).toBe(200);

    const updateCall = prismaMock.opportunity.update.mock.calls[0][0];
    expect(updateCall.data.status).toBe("rejected");
    expect(updateCall.data.stage).toBe("Archived");
    expect(updateCall.data.applicationClosedReason).toBe("user_archived");

    expect(prismaMock.rejection.create).toHaveBeenCalledWith({
      data: {
        jobId: "job-456",
        source: "Reed",
        title: "Engineer",
        company: "Beta Inc",
        url: "https://example.com/job2",
        score: 7,
        redFlags: "Archived by user",
      },
    });
  });
});
