import { prisma } from "@/lib/prisma";
import { MANUAL_SOURCE } from "@/lib/constants/manual-source";
import { getFeedIngestSummary } from "@/lib/feeds/feed-ingest-summary";
import { FeedHealthTable } from "@/components/feeds/FeedHealthTable";
import { FeedManager } from "@/components/feeds/FeedManager";
import { FeedsApiOverview } from "@/components/feeds/FeedsApiOverview";

export const dynamic = "force-dynamic";

export default async function FeedsPage() {
  const [feeds, ingestRows] = await Promise.all([
    prisma.feed.findMany({
      where: { name: { not: MANUAL_SOURCE } },
      orderBy: { name: "asc" },
    }),
    getFeedIngestSummary(prisma),
  ]);

  const serializedFeeds = feeds.map((f) => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
  }));

  const healthRows = ingestRows.map((r) => ({
    source: r.source,
    lastIngestAt: r.lastIngestAt?.toISOString() ?? null,
    opportunities24h: r.opportunities24h,
    disqualified24h: r.disqualified24h,
    stale: r.stale,
  }));

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Feeds</h2>
        <p className="text-sm text-muted-foreground">
          Manage your data sources. Each feed represents a workflow (e.g. n8n) that pushes job data
          into Job Scout. Use the API overview below for setup, then expand{" "}
          <strong className="text-foreground/80">API Reference</strong> on a feed for copy-paste
          examples with that feed&apos;s <code className="text-xs">source</code> name.
        </p>
        <FeedsApiOverview />
        <FeedManager feeds={serializedFeeds} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Feed Health</h2>
        <FeedHealthTable rows={healthRows} />
      </section>
    </div>
  );
}
