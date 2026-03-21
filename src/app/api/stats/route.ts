import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { getIncomingScoreDistribution } from "@/lib/stats/incoming-score-distribution";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [totalOpportunities, applied, totalRejections, bySource, recentActivity, byScore] =
    await Promise.all([
      prisma.opportunity.count(),
      // Cumulative: ever applied (appliedAt set), regardless of later rejection
      prisma.opportunity.count({ where: { appliedAt: { not: null } } }),
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
      getIncomingScoreDistribution(prisma),
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
    byScore,
    recentActivity: recentActivity.map((r) => ({
      date: r.createdAt,
      count: r._count.id,
    })),
  });
}
