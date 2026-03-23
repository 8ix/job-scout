import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/prisma";

vi.stubEnv("NEXTAUTH_SECRET", "test-secret");

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

describe("/api/opportunities/[id]/correspondence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { name: "admin" } });
  });

  it("GET returns 401 without session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const { GET } = await import("@/app/api/opportunities/[id]/correspondence/route");
    const res = await GET(new Request("http://localhost/api/opportunities/x/correspondence"), {
      params: Promise.resolve({ id: "x" }),
    });
    expect(res.status).toBe(401);
  });

  it("GET returns 404 when opportunity missing", async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue(null);
    const { GET } = await import("@/app/api/opportunities/[id]/correspondence/route");
    const res = await GET(new Request("http://localhost/api/opportunities/x/correspondence"), {
      params: Promise.resolve({ id: "x" }),
    });
    expect(res.status).toBe(404);
  });

  it("GET returns correspondence ordered by receivedAt", async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue({ id: "opp1" });
    prismaMock.applicationCorrespondence.findMany.mockResolvedValue([
      {
        id: "c1",
        opportunityId: "opp1",
        receivedAt: new Date("2026-01-02T12:00:00Z"),
        subject: "Thanks",
        body: "Hello",
        createdAt: new Date("2026-01-02T13:00:00Z"),
      },
    ]);

    const { GET } = await import("@/app/api/opportunities/[id]/correspondence/route");
    const res = await GET(new Request("http://localhost/api/opportunities/opp1/correspondence"), {
      params: Promise.resolve({ id: "opp1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].body).toBe("Hello");
    expect(prismaMock.applicationCorrespondence.findMany).toHaveBeenCalledWith({
      where: { opportunityId: "opp1" },
      orderBy: { receivedAt: "asc" },
    });
  });

  it("POST returns 400 for empty body", async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue({ id: "opp1" });
    const { POST } = await import("@/app/api/opportunities/[id]/correspondence/route");
    const res = await POST(
      new Request("http://localhost/api/opportunities/opp1/correspondence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receivedAt: "2026-03-01T10:00:00.000Z",
          body: "   ",
        }),
      }),
      { params: Promise.resolve({ id: "opp1" }) }
    );
    expect(res.status).toBe(400);
  });

  it("POST creates correspondence", async () => {
    prismaMock.opportunity.findUnique.mockResolvedValue({ id: "opp1" });
    const created = {
      id: "new-c",
      opportunityId: "opp1",
      receivedAt: new Date("2026-03-01T10:00:00.000Z"),
      subject: "Re: Application",
      body: "Thanks for applying",
      createdAt: new Date("2026-03-01T11:00:00.000Z"),
    };
    prismaMock.applicationCorrespondence.create.mockResolvedValue(created);

    const { POST } = await import("@/app/api/opportunities/[id]/correspondence/route");
    const res = await POST(
      new Request("http://localhost/api/opportunities/opp1/correspondence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receivedAt: "2026-03-01T10:00:00.000Z",
          subject: "Re: Application",
          body: "Thanks for applying",
        }),
      }),
      { params: Promise.resolve({ id: "opp1" }) }
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBe("new-c");
    expect(prismaMock.applicationCorrespondence.create).toHaveBeenCalledWith({
      data: {
        opportunityId: "opp1",
        receivedAt: new Date("2026-03-01T10:00:00.000Z"),
        body: "Thanks for applying",
        subject: "Re: Application",
      },
    });
  });

  it("DELETE returns 404 when row belongs to another opportunity", async () => {
    prismaMock.applicationCorrespondence.findFirst.mockResolvedValue(null);

    const { DELETE } = await import("@/app/api/opportunities/[id]/correspondence/route");
    const res = await DELETE(
      new Request("http://localhost/api/opportunities/opp1/correspondence?id=c1"),
      { params: Promise.resolve({ id: "opp1" }) }
    );
    expect(res.status).toBe(404);
    expect(prismaMock.applicationCorrespondence.delete).not.toHaveBeenCalled();
  });

  it("DELETE removes row when found", async () => {
    prismaMock.applicationCorrespondence.findFirst.mockResolvedValue({
      id: "c1",
      opportunityId: "opp1",
      receivedAt: new Date(),
      subject: null,
      body: "x",
      createdAt: new Date(),
    });

    const { DELETE } = await import("@/app/api/opportunities/[id]/correspondence/route");
    const res = await DELETE(
      new Request("http://localhost/api/opportunities/opp1/correspondence?id=c1"),
      { params: Promise.resolve({ id: "opp1" }) }
    );
    expect(res.status).toBe(204);
    expect(prismaMock.applicationCorrespondence.delete).toHaveBeenCalledWith({
      where: { id: "c1" },
    });
  });
});
