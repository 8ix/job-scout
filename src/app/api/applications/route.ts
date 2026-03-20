import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { isSessionOrApiKeyAuthorized } from "@/lib/auth/session-or-api-key";
import { createManualApplicationSchema } from "@/lib/validators/application-manual";
import { MANUAL_SOURCE } from "@/lib/constants/manual-source";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isSessionOrApiKeyAuthorized(request.headers))) {
    return unauthorizedResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createManualApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const appliedVia = d.appliedVia ?? "External";
  const postedAt = d.postedAt ? new Date(d.postedAt) : null;

  const opportunity = await prisma.opportunity.create({
    data: {
      jobId: randomUUID(),
      source: MANUAL_SOURCE,
      title: d.title,
      company: d.company,
      location: d.location ?? null,
      workingModel: d.workingModel ?? null,
      listingType: d.listingType ?? null,
      salaryMin: d.salaryMin ?? null,
      salaryMax: d.salaryMax ?? null,
      score: d.score,
      verdict: null,
      matchReasons: null,
      redFlags: null,
      url: d.url,
      description: d.description ?? null,
      status: "applied",
      appliedAt: new Date(),
      stage: "Applied",
      postedAt,
      appliedVia,
      recruiterContact: d.recruiterContact ?? null,
      fullJobSpecification: d.fullJobSpecification ?? null,
    },
  });

  await prisma.applicationStageLog.create({
    data: {
      opportunityId: opportunity.id,
      stage: "Applied",
    },
  });

  return NextResponse.json(opportunity, { status: 201 });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage");

  const where: Record<string, unknown> = { status: "applied" };
  if (stage) where.stage = stage;

  const opportunities = await prisma.opportunity.findMany({
    where,
    orderBy: { appliedAt: "desc" },
  });

  if (opportunities.length === 0) {
    return NextResponse.json([]);
  }

  const ids = opportunities.map((o) => o.id);
  const [contacts, stageLogs, scheduledEvents] = await Promise.all([
    prisma.applicationContact.findMany({
      where: { opportunityId: { in: ids } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.applicationStageLog.findMany({
      where: { opportunityId: { in: ids } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.applicationScheduledEvent.findMany({
      where: { opportunityId: { in: ids } },
      orderBy: { scheduledAt: "asc" },
    }),
  ]);

  const contactsByOpp = contacts.reduce<Record<string, typeof contacts>>((acc, c) => {
    if (!acc[c.opportunityId]) acc[c.opportunityId] = [];
    acc[c.opportunityId].push(c);
    return acc;
  }, {});

  const serialized = opportunities.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    appliedAt: o.appliedAt?.toISOString() ?? null,
    postedAt: o.postedAt?.toISOString() ?? null,
    contacts: (contactsByOpp[o.id] ?? []).map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
    stageLogs: stageLogs
      .filter((s) => s.opportunityId === o.id)
      .map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
    scheduledEvents: scheduledEvents
      .filter((e) => e.opportunityId === o.id)
      .map((e) => ({
        ...e,
        scheduledAt: e.scheduledAt.toISOString(),
        createdAt: e.createdAt.toISOString(),
      })),
  }));

  return NextResponse.json(serialized);
}
