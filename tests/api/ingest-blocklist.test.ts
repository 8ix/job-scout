import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { prismaMock } from "../helpers/prisma";

vi.stubEnv("API_KEY", "test-key");
vi.stubEnv("NEXTAUTH_SECRET", "test-secret");

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

describe("GET /api/ingest-blocklist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv("API_KEY", "test-key");
    vi.stubEnv("NEXTAUTH_SECRET", "test-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("API_KEY", "test-key");
    vi.stubEnv("NEXTAUTH_SECRET", "test-secret");
  });

  it("returns 401 without API key when BLOCKLIST_PUBLIC_READ is not set", async () => {
    prismaMock.ingestBlockRule.findMany.mockResolvedValue([]);

    const { GET } = await import("@/app/api/ingest-blocklist/route");
    const response = await GET(new Request("http://localhost/api/ingest-blocklist"));
    expect(response.status).toBe(401);
  });

  it("returns enabled rules with X-API-Key", async () => {
    const createdAt = new Date("2026-03-01T12:00:00.000Z");
    prismaMock.ingestBlockRule.findMany.mockResolvedValue([
      {
        id: "r1",
        pattern: "Acme",
        scope: "company",
        enabled: true,
        createdAt,
      },
    ]);

    const { GET } = await import("@/app/api/ingest-blocklist/route");
    const response = await GET(
      new Request("http://localhost/api/ingest-blocklist", {
        headers: { "X-API-Key": "test-key" },
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.version).toBe(1);
    expect(body.rules).toHaveLength(1);
    expect(body.rules[0]).toMatchObject({
      id: "r1",
      pattern: "Acme",
      scope: "company",
      enabled: true,
    });
    expect(response.headers.get("Cache-Control")).toContain("max-age=60");
    expect(prismaMock.ingestBlockRule.findMany).toHaveBeenCalledWith({
      where: { enabled: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        pattern: true,
        scope: true,
        enabled: true,
        createdAt: true,
      },
    });
  });

  it("allows unauthenticated GET when BLOCKLIST_PUBLIC_READ=true", async () => {
    vi.stubEnv("BLOCKLIST_PUBLIC_READ", "true");
    prismaMock.ingestBlockRule.findMany.mockResolvedValue([]);

    const { GET } = await import("@/app/api/ingest-blocklist/route");
    const response = await GET(new Request("http://localhost/api/ingest-blocklist"));
    expect(response.status).toBe(200);
  });
});

describe("POST /api/ingest-blocklist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("creates a rule with valid body", async () => {
    const created = {
      id: "new-id",
      pattern: "SpamCo",
      scope: "company" as const,
      note: "daily reposts",
      enabled: true,
      createdAt: new Date(),
    };
    prismaMock.ingestBlockRule.create.mockResolvedValue(created);

    const { POST } = await import("@/app/api/ingest-blocklist/route");
    const response = await POST(
      new Request("http://localhost/api/ingest-blocklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pattern: "SpamCo",
          scope: "company",
          note: "daily reposts",
        }),
      })
    );

    expect(response.status).toBe(201);
    expect(prismaMock.ingestBlockRule.create).toHaveBeenCalledWith({
      data: {
        pattern: "SpamCo",
        scope: "company",
        note: "daily reposts",
        enabled: true,
      },
    });
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { POST } = await import("@/app/api/ingest-blocklist/route");
    const response = await POST(
      new Request("http://localhost/api/ingest-blocklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern: "x", scope: "any" }),
      })
    );
    expect(response.status).toBe(401);
  });
});

describe("PATCH /api/ingest-blocklist/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("updates enabled flag", async () => {
    prismaMock.ingestBlockRule.findUnique.mockResolvedValue({
      id: "r1",
      pattern: "A",
      scope: "company",
      note: null,
      enabled: true,
      createdAt: new Date(),
    });
    prismaMock.ingestBlockRule.update.mockResolvedValue({
      id: "r1",
      pattern: "A",
      scope: "company",
      note: null,
      enabled: false,
      createdAt: new Date(),
    });

    const { PATCH } = await import("@/app/api/ingest-blocklist/[id]/route");
    const response = await PATCH(
      new Request("http://localhost/api/ingest-blocklist/r1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: false }),
      }),
      { params: Promise.resolve({ id: "r1" }) }
    );

    expect(response.status).toBe(200);
    expect(prismaMock.ingestBlockRule.update).toHaveBeenCalledWith({
      where: { id: "r1" },
      data: { enabled: false },
    });
  });

  it("returns 404 when rule missing", async () => {
    prismaMock.ingestBlockRule.findUnique.mockResolvedValue(null);

    const { PATCH } = await import("@/app/api/ingest-blocklist/[id]/route");
    const response = await PATCH(
      new Request("http://localhost/api/ingest-blocklist/missing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: false }),
      }),
      { params: Promise.resolve({ id: "missing" }) }
    );
    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/ingest-blocklist/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("deletes an existing rule", async () => {
    prismaMock.ingestBlockRule.findUnique.mockResolvedValue({
      id: "r1",
      pattern: "A",
      scope: "company",
      note: null,
      enabled: true,
      createdAt: new Date(),
    });
    prismaMock.ingestBlockRule.delete.mockResolvedValue({} as never);

    const { DELETE } = await import("@/app/api/ingest-blocklist/[id]/route");
    const response = await DELETE(new Request("http://localhost/api/ingest-blocklist/r1", {
      method: "DELETE",
    }), { params: Promise.resolve({ id: "r1" }) });

    expect(response.status).toBe(204);
    expect(prismaMock.ingestBlockRule.delete).toHaveBeenCalledWith({ where: { id: "r1" } });
  });
});
