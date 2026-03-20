import { prisma } from "@/lib/prisma";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { DailyFeedJobs } from "@/components/dashboard/DailyFeedJobs";
import { ScoreChart } from "@/components/dashboard/ScoreChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ReviewFlash } from "@/components/dashboard/ReviewFlash";
import { UpcomingInterviews } from "@/components/dashboard/UpcomingInterviews";

export const dynamic = "force-dynamic";

type DateCountRow = { date: string; count: string };

function toIsoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function fillDateRange(
  start: Date,
  end: Date,
  opportunitiesByDate: Map<string, number>,
  rejectedByDate: Map<string, number>
): { date: string; opportunities: number; rejected: number; jobsProcessed: number }[] {
  const result: { date: string; opportunities: number; rejected: number; jobsProcessed: number }[] = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);
  while (cur <= endDate) {
    const d = toIsoDate(cur);
    const opps = opportunitiesByDate.get(d) ?? 0;
    const rej = rejectedByDate.get(d) ?? 0;
    result.push({
      date: d,
      opportunities: opps,
      rejected: rej,
      jobsProcessed: opps + rej,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

async function getStats() {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  fourteenDaysAgo.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOpportunities,
    appliedCount,
    totalRejections,
    newOpportunitiesCount,
    rejectedByDate,
    opportunitiesCreatedByDate,
  ] = await Promise.all([
    prisma.opportunity.count(),
    // Cumulative: ever applied (appliedAt set), regardless of later rejection
    prisma.opportunity.count({ where: { appliedAt: { not: null } } }),
    prisma.rejection.count(),
    prisma.opportunity.count({ where: { status: "new" } }),
    prisma.$queryRaw<DateCountRow[]>`
      SELECT DATE("createdAt")::text as date, COUNT(*)::text as count
      FROM rejections
      WHERE "createdAt" >= ${fourteenDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    prisma.$queryRaw<DateCountRow[]>`
      SELECT DATE("createdAt")::text as date, COUNT(*)::text as count
      FROM opportunities
      WHERE "createdAt" >= ${fourteenDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
  ]);

  const conversionRate = totalOpportunities > 0 ? appliedCount / totalOpportunities : 0;

  const scoreBands = [
    { band: "Disqualified", min: 0, max: 5 },
    { band: "6", min: 6, max: 6 },
    { band: "7", min: 7, max: 7 },
    { band: "8", min: 8, max: 8 },
    { band: "9", min: 9, max: 9 },
    { band: "10", min: 10, max: 10 },
  ];

  const byScore = await Promise.all(
    scoreBands.map(async ({ band, min, max }) => ({
      band,
      count: await prisma.opportunity.count({
        where: { score: { gte: min, lte: max } },
      }),
    }))
  );

  const opportunitiesMap = new Map(
    opportunitiesCreatedByDate.map((r) => [r.date, parseInt(r.count, 10)])
  );
  const rejectedMap = new Map(rejectedByDate.map((r) => [r.date, parseInt(r.count, 10)]));

  const recentActivity = fillDateRange(
    fourteenDaysAgo,
    today,
    opportunitiesMap,
    rejectedMap
  );

  return {
    totalOpportunities,
    totalRejections,
    applied: appliedCount,
    newOpportunitiesCount,
    conversionRate,
    byScore,
    recentActivity,
  };
}

async function getDailyFeedJobsData() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const feeds = await prisma.feed.findMany({ select: { name: true }, orderBy: { name: "asc" } });
  const sources = feeds.map((f) => f.name);

  const [oppsBySource, rejBySource, lastHeartbeat, lastOppBySource, lastRejBySource] =
    await Promise.all([
      prisma.opportunity.groupBy({
        by: ["source"],
        _count: { id: true },
        where: { createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.rejection.groupBy({
        by: ["source"],
        _count: { id: true },
        where: { createdAt: { gte: twentyFourHoursAgo } },
      }),
      sources.length > 0
        ? prisma.feedHeartbeat.groupBy({
            by: ["source"],
            _max: { ranAt: true },
            where: { source: { in: sources } },
          })
        : Promise.resolve([]),
      sources.length > 0
        ? prisma.opportunity.groupBy({
            by: ["source"],
            _max: { createdAt: true },
            where: { source: { in: sources } },
          })
        : Promise.resolve([]),
      sources.length > 0
        ? prisma.rejection.groupBy({
            by: ["source"],
            _max: { createdAt: true },
            where: { source: { in: sources } },
          })
        : Promise.resolve([]),
    ]);

  const oppsMap = new Map(oppsBySource.map((o) => [o.source, o._count.id]));
  const rejMap = new Map(rejBySource.map((r) => [r.source, r._count.id]));
  const heartbeatMap = new Map(lastHeartbeat.map((r) => [r.source, r._max.ranAt]));
  const lastOppMap = new Map(lastOppBySource.map((r) => [r.source, r._max.createdAt]));
  const lastRejMap = new Map(lastRejBySource.map((r) => [r.source, r._max.createdAt]));

  return sources.map((source) => {
    const heartbeatAt = heartbeatMap.get(source);
    const lastOppAt = lastOppMap.get(source);
    const lastRejAt = lastRejMap.get(source);
    const fromData = [lastOppAt, lastRejAt].filter((d): d is Date => d != null);
    const latestFromData =
      fromData.length > 0 ? new Date(Math.max(...fromData.map((d) => d.getTime()))) : null;
    const lastReceivedAt = heartbeatAt ?? latestFromData ?? null;

    return {
      source,
      opportunities: oppsMap.get(source) ?? 0,
      rejected: rejMap.get(source) ?? 0,
      lastReceivedAt,
    };
  });
}

async function getUpcomingScheduledEvents() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 14);

  const events = await prisma.applicationScheduledEvent.findMany({
    where: {
      scheduledAt: { gte: start, lte: end },
    },
    orderBy: { scheduledAt: "asc" },
    include: {
      opportunity: { select: { title: true, company: true } },
    },
  });

  return events.map((e) => ({
    id: e.id,
    kind: e.kind,
    scheduledAt: e.scheduledAt.toISOString(),
    notes: e.notes,
    company: e.opportunity.company,
    title: e.opportunity.title,
    opportunityId: e.opportunityId,
  }));
}

export default async function DashboardPage() {
  const [stats, dailyFeedJobs, upcoming] = await Promise.all([
    getStats(),
    getDailyFeedJobsData(),
    getUpcomingScheduledEvents(),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
      <ReviewFlash count={stats.newOpportunitiesCount} />
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(280px,360px)] lg:items-start">
        <StatsBar stats={stats} />
        <UpcomingInterviews events={upcoming} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <DailyFeedJobs feeds={dailyFeedJobs} />
        <ScoreChart byScore={stats.byScore} />
      </div>
      <RecentActivity activity={stats.recentActivity} />
    </div>
  );
}
