import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const scoreBands = [
    { band: "Disqualified", min: 0, max: 5 },
    { band: "6", min: 6, max: 6 },
    { band: "7", min: 7, max: 7 },
    { band: "8", min: 8, max: 8 },
    { band: "9", min: 9, max: 9 },
    { band: "10", min: 10, max: 10 },
  ];

  const [totalOpportunities, applied, totalRejections, bySource, recentActivity, ...scoreCounts] =
    await Promise.all([
      prisma.opportunity.count(),
      prisma.opportunity.count({ where: { status: "applied" } }),
      prisma.rejection.count(),
      prisma.opportunity.groupBy({
        by: ["source"],
        _count: { id: true },
      }),
      prisma.opportunity.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        where: { createdAt: { gte: fourteenDaysAgo } },
        orderBy: { createdAt: "asc" },
      }),
      ...scoreBands.map(({ min, max }) =>
        prisma.opportunity.count({
          where: { score: { gte: min, lte: max } },
        })
      ),
    ]);

  const conversionRate =
    totalOpportunities > 0 ? applied / totalOpportunities : 0;

  return NextResponse.json({
    totalOpportunities,
    totalRejections,
    applied,
    conversionRate,
    bySource: bySource.map((s) => ({
      source: s.source,
      count: s._count.id,
    })),
    byScore: scoreBands.map((b, i) => ({
      band: b.band,
      count: scoreCounts[i],
    })),
    recentActivity: recentActivity.map((r) => ({
      date: r.createdAt,
      count: r._count.id,
    })),
  });
}
