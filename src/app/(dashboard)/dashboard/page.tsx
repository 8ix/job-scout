import { prisma } from "@/lib/prisma";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { HeartbeatPanel } from "@/components/dashboard/HeartbeatPanel";
import { ScoreChart } from "@/components/dashboard/ScoreChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export const dynamic = "force-dynamic";

async function getStats() {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [totalOpportunities, applied, totalRejections, bySourceRaw, recentRaw] =
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
    ]);

  const conversionRate = totalOpportunities > 0 ? applied / totalOpportunities : 0;

  const scoreBands = [
    { band: "0-3", min: 0, max: 3 },
    { band: "4-6", min: 4, max: 6 },
    { band: "7-10", min: 7, max: 10 },
  ];

  const byScore = await Promise.all(
    scoreBands.map(async ({ band, min, max }) => ({
      band,
      count: await prisma.opportunity.count({
        where: { score: { gte: min, lte: max } },
      }),
    }))
  );

  return {
    totalOpportunities,
    totalRejections,
    applied,
    conversionRate,
    byScore,
    recentActivity: recentRaw.map((r) => ({
      date: r.createdAt.toISOString().split("T")[0],
      count: r._count.id,
    })),
  };
}

async function getLatestHeartbeats() {
  const sources = ["Adzuna", "Reed", "JSearch", "ATS", "RSS"];
  const heartbeats = await Promise.all(
    sources.map(async (source) => {
      const latest = await prisma.feedHeartbeat.findFirst({
        where: { source },
        orderBy: { ranAt: "desc" },
      });
      return latest
        ? {
            source: latest.source,
            ranAt: latest.ranAt.toISOString(),
            jobsReceived: latest.jobsReceived,
            jobsNew: latest.jobsNew,
            jobsScored: latest.jobsScored,
            jobsOpportunity: latest.jobsOpportunity,
          }
        : null;
    })
  );
  return heartbeats.filter(Boolean) as {
    source: string;
    ranAt: string;
    jobsReceived: number;
    jobsNew: number;
    jobsScored: number;
    jobsOpportunity: number;
  }[];
}

export default async function DashboardPage() {
  const [stats, heartbeats] = await Promise.all([
    getStats(),
    getLatestHeartbeats(),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
      <StatsBar stats={stats} />
      <div className="grid gap-6 lg:grid-cols-2">
        <HeartbeatPanel heartbeats={heartbeats} />
        <ScoreChart byScore={stats.byScore} />
      </div>
      <RecentActivity activity={stats.recentActivity} />
    </div>
  );
}
