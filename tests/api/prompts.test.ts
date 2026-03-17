import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";
import { buildSystemPrompt } from "../helpers/factories";

vi.stubEnv("API_KEY", "test-key");
vi.stubEnv("NEXTAUTH_SECRET", "test-secret");

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

describe("GET /api/prompts/active", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the active prompt without auth", async () => {
    const active = buildSystemPrompt({ isActive: true, id: "active-id" });
    prismaMock.systemPrompt.findFirst.mockResolvedValue(active);

    const { GET } = await import("@/app/api/prompts/active/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe("active-id");
    expect(body.isActive).toBe(true);
  });

  it("returns 404 when no active prompt exists", async () => {
    prismaMock.systemPrompt.findFirst.mockResolvedValue(null);

    const { GET } = await import("@/app/api/prompts/active/route");
    const response = await GET();

    expect(response.status).toBe(404);
  });
});

describe("GET /api/prompts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("returns all prompt versions", async () => {
    const prompts = [
      buildSystemPrompt({ isActive: true }),
      buildSystemPrompt({ isActive: false }),
    ];
    prismaMock.systemPrompt.findMany.mockResolvedValue(prompts);

    const { GET } = await import("@/app/api/prompts/route");
    const request = new Request("http://localhost/api/prompts");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { GET } = await import("@/app/api/prompts/route");
    const request = new Request("http://localhost/api/prompts");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});

describe("POST /api/prompts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("creates a new prompt version without activating it", async () => {
    const input = {
      name: "Scoring v2",
      systemPrompt: "You are a scoring assistant",
      userPromptTemplate: "Score: {{title}}",
      notes: "Updated scoring criteria",
    };
    const created = buildSystemPrompt({ ...input, id: "new-id", isActive: false });
    prismaMock.systemPrompt.create.mockResolvedValue(created);

    const { POST } = await import("@/app/api/prompts/route");
    const request = new Request("http://localhost/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.isActive).toBe(false);
    expect(body.name).toBe("Scoring v2");
  });

  it("returns 400 for missing required fields", async () => {
    const { POST } = await import("@/app/api/prompts/route");
    const request = new Request("http://localhost/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Incomplete" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

describe("PATCH /api/prompts/:id/activate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("activates a prompt and deactivates all others", async () => {
    const activated = buildSystemPrompt({ id: "target-id", isActive: true });
    prismaMock.systemPrompt.updateMany.mockResolvedValue({ count: 5 });
    prismaMock.systemPrompt.update.mockResolvedValue(activated);

    const { PATCH } = await import("@/app/api/prompts/[id]/activate/route");
    const request = new Request("http://localhost/api/prompts/target-id/activate", {
      method: "PATCH",
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "target-id" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.isActive).toBe(true);
    expect(prismaMock.systemPrompt.updateMany).toHaveBeenCalledWith({
      data: { isActive: false },
    });
    expect(prismaMock.systemPrompt.update).toHaveBeenCalledWith({
      where: { id: "target-id" },
      data: { isActive: true },
    });
  });

  it("returns 404 when prompt does not exist", async () => {
    const prismaError = new Error("Record not found");
    Object.assign(prismaError, { code: "P2025" });
    prismaMock.systemPrompt.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.systemPrompt.update.mockRejectedValue(prismaError);

    const { PATCH } = await import("@/app/api/prompts/[id]/activate/route");
    const request = new Request("http://localhost/api/prompts/non-existent/activate", {
      method: "PATCH",
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "non-existent" }) });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Not found");
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { PATCH } = await import("@/app/api/prompts/[id]/activate/route");
    const request = new Request("http://localhost/api/prompts/target-id/activate", {
      method: "PATCH",
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "target-id" }) });
    expect(response.status).toBe(401);
  });
});
