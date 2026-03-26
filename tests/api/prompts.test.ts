import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";
import { buildSearchCriteriaSettingsRow } from "../helpers/factories";
import { buildSystemPrompt, emptySearchCriteria } from "@/lib/search-criteria";

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

  it("returns generated system prompt without auth", async () => {
    const criteria = emptySearchCriteria();
    criteria.whereWork.positive.push("Remote-first");
    const row = buildSearchCriteriaSettingsRow({ criteria });
    prismaMock.searchCriteriaSettings.findUnique.mockResolvedValue(row);

    const { GET } = await import("@/app/api/prompts/active/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.systemPrompt).toBe(buildSystemPrompt(criteria));
    expect(body.updatedAt).toBeDefined();
    expect(body.userPromptTemplate).toBeUndefined();
  });

  it("creates default row when missing then returns prompt", async () => {
    const created = buildSearchCriteriaSettingsRow({
      systemPrompt: buildSystemPrompt(emptySearchCriteria()),
    });
    prismaMock.searchCriteriaSettings.findUnique.mockResolvedValue(null);
    prismaMock.searchCriteriaSettings.create.mockResolvedValue(created);

    const { GET } = await import("@/app/api/prompts/active/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.systemPrompt).toBe(buildSystemPrompt(emptySearchCriteria()));
    expect(prismaMock.searchCriteriaSettings.create).toHaveBeenCalled();
  });
});

describe("GET /api/search-criteria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("returns criteria and system prompt", async () => {
    const criteria = structuredClone(emptySearchCriteria());
    criteria.compensation.positive.push("£80k+");
    const row = buildSearchCriteriaSettingsRow({
      criteria,
      systemPrompt: buildSystemPrompt(criteria),
    });
    prismaMock.searchCriteriaSettings.findUnique.mockResolvedValue(row);

    const { GET } = await import("@/app/api/search-criteria/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.criteria.compensation.positive).toContain("£80k+");
    expect(body.systemPrompt).toContain("£80k+");
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { GET } = await import("@/app/api/search-criteria/route");
    const response = await GET();

    expect(response.status).toBe(401);
  });
});

describe("PATCH /api/search-criteria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("upserts criteria and returns saved row", async () => {
    const criteria = emptySearchCriteria();
    criteria.role.positive.push("Engineering Manager");
    const updated = buildSearchCriteriaSettingsRow({
      criteria,
      systemPrompt: buildSystemPrompt(criteria),
    });
    prismaMock.searchCriteriaSettings.upsert.mockResolvedValue(updated);

    const { PATCH } = await import("@/app/api/search-criteria/route");
    const request = new Request("http://localhost/api/search-criteria", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(criteria),
    });

    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.criteria.role.positive).toContain("Engineering Manager");
    expect(prismaMock.searchCriteriaSettings.upsert).toHaveBeenCalled();
  });

  it("returns 400 for invalid body", async () => {
    const { PATCH } = await import("@/app/api/search-criteria/route");
    const request = new Request("http://localhost/api/search-criteria", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whereWork: "oops" }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(400);
  });

  it("returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { PATCH } = await import("@/app/api/search-criteria/route");
    const request = new Request("http://localhost/api/search-criteria", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emptySearchCriteria()),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(401);
  });
});
