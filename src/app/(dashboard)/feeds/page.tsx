import { prisma } from "@/lib/prisma";
import { FeedHealthTable } from "@/components/feeds/FeedHealthTable";
import { FeedManager } from "@/components/feeds/FeedManager";

export const dynamic = "force-dynamic";

export default async function FeedsPage() {
  const [feeds, heartbeats] = await Promise.all([
    prisma.feed.findMany({ orderBy: { name: "asc" } }),
    prisma.feedHeartbeat.findMany({
      orderBy: { ranAt: "desc" },
      take: 100,
    }),
  ]);

  const serializedFeeds = feeds.map((f) => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
  }));

  const serializedHeartbeats = heartbeats.map((hb) => ({
    ...hb,
    ranAt: hb.ranAt.toISOString(),
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
        <FeedHealthTable heartbeats={serializedHeartbeats} />
      </section>
    </div>
  );
}
