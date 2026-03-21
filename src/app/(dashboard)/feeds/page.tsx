import { prisma } from "@/lib/prisma";
import { getFeedIngestSummary } from "@/lib/feeds/feed-ingest-summary";
import { FeedHealthTable } from "@/components/feeds/FeedHealthTable";
import { FeedManager } from "@/components/feeds/FeedManager";

export const dynamic = "force-dynamic";

export default async function FeedsPage() {
  const [feeds, ingestRows] = await Promise.all([
    prisma.feed.findMany({ orderBy: { name: "asc" } }),
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
          Manage your data sources. Each feed represents an n8n workflow that pushes
          job data into Job Scout. Click &ldquo;API Reference&rdquo; to see the endpoints
          for your workflow.
        </p>
        <FeedManager feeds={serializedFeeds} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Feed Health</h2>
        <FeedHealthTable rows={healthRows} />
      </section>
    </div>
  );
}
