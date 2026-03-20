import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { isSessionOrApiKeyAuthorized } from "@/lib/auth/session-or-api-key";
import { updateOpportunitySchema } from "@/lib/validators/opportunity";
import { applyOpportunityPatch } from "@/lib/applications/apply-opportunity-patch";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isSessionOrApiKeyAuthorized(request.headers))) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { createdAt: "asc" } },
      stageLogs: { orderBy: { createdAt: "asc" } },
      scheduledEvents: { orderBy: { scheduledAt: "asc" } },
    },
  });

  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...opportunity,
    createdAt: opportunity.createdAt.toISOString(),
    appliedAt: opportunity.appliedAt?.toISOString() ?? null,
    postedAt: opportunity.postedAt?.toISOString() ?? null,
    contacts: opportunity.contacts.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
    stageLogs: opportunity.stageLogs.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    })),
    scheduledEvents: opportunity.scheduledEvents.map((e) => ({
      ...e,
      scheduledAt: e.scheduledAt.toISOString(),
      createdAt: e.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isSessionOrApiKeyAuthorized(request.headers))) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateOpportunitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.opportunity.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const result = await applyOpportunityPatch(prisma, id, existing, parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.opportunity);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw error;
  }
}
