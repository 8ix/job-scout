import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";

export const dynamic = "force-dynamic";

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
  const [contacts, stageLogs] = await Promise.all([
    prisma.applicationContact.findMany({
      where: { opportunityId: { in: ids } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.applicationStageLog.findMany({
      where: { opportunityId: { in: ids } },
      orderBy: { createdAt: "asc" },
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
  }));

  return NextResponse.json(serialized);
}
