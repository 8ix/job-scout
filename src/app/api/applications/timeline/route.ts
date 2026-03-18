import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";

export const dynamic = "force-dynamic";

/**
 * Returns all applications (status=applied or status=rejected with stage history)
 * with their full stage timeline for reporting.
 * Each application includes: id, title, company, source, appliedAt, current stage, and stageLogs (ordered by createdAt).
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const opportunities = await prisma.opportunity.findMany({
    where: {
      OR: [
        { status: "applied" },
        { status: "rejected", stage: { not: null } },
      ],
    },
    orderBy: { appliedAt: "desc" },
    include: {
      stageLogs: { orderBy: { createdAt: "asc" } },
    },
  });

  const timeline = opportunities.map((o) => ({
    id: o.id,
    title: o.title,
    company: o.company,
    source: o.source,
    status: o.status,
    stage: o.stage,
    appliedAt: o.appliedAt?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
    stageTimeline: o.stageLogs.map((log) => ({
      stage: log.stage,
      changedAt: log.createdAt.toISOString(),
    })),
  }));

  return NextResponse.json(timeline);
}
