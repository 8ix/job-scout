import { prisma } from "@/lib/prisma";
import { MANUAL_SOURCE } from "@/lib/constants/manual-source";
import { DEFAULT_OPPORTUNITY_SCORE_MIN } from "@/lib/constants/opportunities";
import {
  getApplyToFirstCallStats,
  getReviewQueueBreakdown,
  getRollingConversionBySource,
  getStuckNewCount,
} from "@/lib/stats/dashboard-review-metrics";
import { getIncomingScoreDistribution } from "@/lib/stats/incoming-score-distribution";
import { getSourceQuality } from "@/lib/stats/source-quality";
import { getOutcomeFunnel } from "@/lib/stats/outcome-funnel";
import { getPipelineSnapshot } from "@/lib/stats/pipeline-snapshot";
import { getFeedIngestSummary } from "@/lib/feeds/feed-ingest-summary";
import {
  CONVERSION_COHORT_WINDOW_DAYS,
  FIRST_CALL_MEDIAN_WINDOW_DAYS,
  INGEST_BLOCKLIST_PATTERN_WINDOW_DAYS,
  OUTCOME_FUNNEL_WINDOWS_DAYS,
  SOURCE_QUALITY_WINDOW_DAYS,
  STUCK_NEW_DAYS,
} from "@/lib/constants/dashboard";
import { getIngestBlocklistPatternBreakdown } from "@/lib/rejections/blocklist-metrics";
import { SourceQualityTable } from "@/components/dashboard/SourceQualityTable";
import { OutcomeFunnel } from "@/components/dashboard/OutcomeFunnel";
import { PipelineSnapshot } from "@/components/dashboard/PipelineSnapshot";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { DailyFeedJobs } from "@/components/dashboard/DailyFeedJobs";
import { FeedStaleAlert } from "@/components/dashboard/FeedStaleAlert";
import { ScoreChart } from "@/components/dashboard/ScoreChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { IngestBlocklistVolumeCard } from "@/components/dashboard/IngestBlocklistVolumeCard";
import { ReviewFlash } from "@/components/dashboard/ReviewFlash";
import { UpcomingInterviews } from "@/components/dashboard/UpcomingInterviews";
import { NextActionsStrip } from "@/components/dashboard/NextActionsStrip";
import { ReviewQueueBreakdown } from "@/components/dashboard/ReviewQueueBreakdown";
import { ConversionBySourceCard } from "@/components/dashboard/ConversionBySourceCard";
import { ApplyToFirstCallCard } from "@/components/dashboard/ApplyToFirstCallCard";
import { ApplicationGoalsCard } from "@/components/dashboard/ApplicationGoalsCard";
import { getApplicationGoalsDashboardData } from "@/lib/goals/application-goal-progress";
import { getApplicationLifecycleMetrics } from "@/lib/stats/application-lifecycle";
import { ApplicationLifecycleCard } from "@/components/dashboard/ApplicationLifecycleCard";

export const dynamic = "force-dynamic";

type DateCountRow = { date: string; count: string };

function toIsoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function fillDateRange(
  start: Date,
  end: Date,
  opportunitiesByDate: Map<string, number>,
  workflowRejectedByDate: Map<string, number>,
  blockedByDate: Map<string, number>
): {
  date: string;
  opportunities: number;
  workflowRejected: number;
  blocked: number;
  jobsProcessed: number;
}[] {
  const result: {
    date: string;
    opportunities: number;
    workflowRejected: number;
    blocked: number;
    jobsProcessed: number;
  }[] = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);
  while (cur <= endDate) {
    const d = toIsoDate(cur);
    const opps = opportunitiesByDate.get(d) ?? 0;
    const wf = workflowRejectedByDate.get(d) ?? 0;
    const bl = blockedByDate.get(d) ?? 0;
    result.push({
      date: d,
      opportunities: opps,
      workflowRejected: wf,
      blocked: bl,
      jobsProcessed: opps + wf + bl,
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
    workflowRejectionsCount,
    blockedRejectionsCount,
    newOpportunitiesCount,
    workflowRejectedByDate,
    blockedRejectedByDate,
    opportunitiesCreatedByDate,
  ] = await Promise.all([
    prisma.opportunity.count({
      where: { source: { not: MANUAL_SOURCE } },
    }),
    // Cumulative: ever applied (appliedAt set), regardless of later rejection — exclude manual ingest
    prisma.opportunity.count({
      where: {
        appliedAt: { not: null },
        source: { not: MANUAL_SOURCE },
      },
    }),
    prisma.rejection.count({
      where: { ingestBlocklistPattern: null },
    }),
    prisma.rejection.count({
      where: { ingestBlocklistPattern: { not: null } },
    }),
    prisma.opportunity.count({
      where: {
        status: "new",
        score: { gte: DEFAULT_OPPORTUNITY_SCORE_MIN },
      },
    }),
    prisma.$queryRaw<DateCountRow[]>`
      SELECT DATE("createdAt")::text as date, COUNT(*)::text as count
      FROM rejections
      WHERE "createdAt" >= ${fourteenDaysAgo}
        AND "ingest_blocklist_pattern" IS NULL
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    prisma.$queryRaw<DateCountRow[]>`
      SELECT DATE("createdAt")::text as date, COUNT(*)::text as count
      FROM rejections
      WHERE "createdAt" >= ${fourteenDaysAgo}
        AND "ingest_blocklist_pattern" IS NOT NULL
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    prisma.$queryRaw<DateCountRow[]>`
      SELECT DATE("createdAt")::text as date, COUNT(*)::text as count
      FROM opportunities
      WHERE "createdAt" >= ${fourteenDaysAgo}
        AND "source" <> ${MANUAL_SOURCE}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
  ]);

  const conversionRate = totalOpportunities > 0 ? appliedCount / totalOpportunities : 0;

  const byScore = await getIncomingScoreDistribution(prisma);

  const opportunitiesMap = new Map(
    opportunitiesCreatedByDate.map((r) => [r.date, parseInt(r.count, 10)])
  );
  const workflowRejectedMap = new Map(
    workflowRejectedByDate.map((r) => [r.date, parseInt(r.count, 10)])
  );
  const blockedRejectedMap = new Map(
    blockedRejectedByDate.map((r) => [r.date, parseInt(r.count, 10)])
  );

  const recentActivity = fillDateRange(
    fourteenDaysAgo,
    today,
    opportunitiesMap,
    workflowRejectedMap,
    blockedRejectedMap
  );

  return {
    totalOpportunities,
    workflowRejections: workflowRejectionsCount,
    blockedRejections: blockedRejectionsCount,
    applied: appliedCount,
    newOpportunitiesCount,
    conversionRate,
    byScore,
    recentActivity,
  };
}

async function getDailyFeedJobsData() {
  const rows = await getFeedIngestSummary(prisma);
  const mapped = rows.map((r) => ({
    source: r.source,
    opportunities: r.opportunities24h,
    rejected: r.disqualified24h,
    blocked: r.blocked24h,
    lastReceivedAt: r.lastIngestAt,
    stale: r.stale,
  }));
  return mapped;
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
  const [
    stats,
    dailyFeedJobs,
    upcoming,
    sourceQuality,
    funnel7,
    funnel30,
    pipeline,
    stuckNew,
    reviewBreakdown,
    conversionBySource,
    applyToFirstCall,
    ingestBlocklistPatternBreakdown,
    applicationGoals,
    applicationLifecycle,
  ] = await Promise.all([
    getStats(),
    getDailyFeedJobsData(),
    getUpcomingScheduledEvents(),
    getSourceQuality(prisma),
    getOutcomeFunnel(prisma, OUTCOME_FUNNEL_WINDOWS_DAYS[0]),
    getOutcomeFunnel(prisma, OUTCOME_FUNNEL_WINDOWS_DAYS[1]),
    getPipelineSnapshot(prisma),
    getStuckNewCount(prisma, {
      stuckDays: STUCK_NEW_DAYS,
      scoreMin: DEFAULT_OPPORTUNITY_SCORE_MIN,
    }),
    getReviewQueueBreakdown(prisma, { scoreMin: DEFAULT_OPPORTUNITY_SCORE_MIN }),
    getRollingConversionBySource(prisma, {
      windowDays: CONVERSION_COHORT_WINDOW_DAYS,
    }),
    getApplyToFirstCallStats(prisma, { windowDays: FIRST_CALL_MEDIAN_WINDOW_DAYS }),
    getIngestBlocklistPatternBreakdown(prisma, {
      windowDays: INGEST_BLOCKLIST_PATTERN_WINDOW_DAYS,
    }),
    getApplicationGoalsDashboardData(prisma),
    getApplicationLifecycleMetrics(prisma),
  ]);

  const staleFeedSources = dailyFeedJobs.filter((f) => f.stale).map((f) => f.source);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
      <FeedStaleAlert staleSources={staleFeedSources} />
      <ReviewFlash count={stats.newOpportunitiesCount} />
      <NextActionsStrip
        toReview={stats.newOpportunitiesCount}
        stuckNew={stuckNew}
        staleFeedCount={staleFeedSources.length}
        upcomingInterviewCount={upcoming.length}
        activeApplications={pipeline.totalActive}
      />
      <ApplicationGoalsCard initial={applicationGoals} />
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(280px,360px)] lg:items-start">
        <StatsBar stats={stats} />
        <UpcomingInterviews events={upcoming} />
      </div>
      <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
        <ReviewQueueBreakdown
          byVerdict={reviewBreakdown.byVerdict}
          byScore={reviewBreakdown.byScore}
        />
        <ConversionBySourceCard
          rows={conversionBySource}
          windowDays={CONVERSION_COHORT_WINDOW_DAYS}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4">
        <PipelineSnapshot totalActive={pipeline.totalActive} stages={pipeline.stages} />
        <ApplicationLifecycleCard
          totalEverApplied={applicationLifecycle.totalEverApplied}
          totalClosedApplications={applicationLifecycle.totalClosedApplications}
        />
        <OutcomeFunnel seven={funnel7} thirty={funnel30} />
        <ApplyToFirstCallCard stats={applyToFirstCall} />
      </div>
      <SourceQualityTable rows={sourceQuality} windowDays={SOURCE_QUALITY_WINDOW_DAYS} />
      <div className="grid gap-6 lg:grid-cols-2">
        <DailyFeedJobs feeds={dailyFeedJobs} />
        <ScoreChart byScore={stats.byScore} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity activity={stats.recentActivity} />
        <IngestBlocklistVolumeCard
          rows={ingestBlocklistPatternBreakdown}
          windowDays={INGEST_BLOCKLIST_PATTERN_WINDOW_DAYS}
          totalBlockedInWindow={funnel30.blockedListings}
        />
      </div>
    </div>
  );
}
