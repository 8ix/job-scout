import { prisma } from "@/lib/prisma";
import { FeedHealthTable } from "@/components/feeds/FeedHealthTable";

export const dynamic = "force-dynamic";

export default async function FeedHealthPage() {
  const heartbeats = await prisma.feedHeartbeat.findMany({
    orderBy: { ranAt: "desc" },
    take: 100,
  });

  const serialized = heartbeats.map((hb) => ({
    ...hb,
    ranAt: hb.ranAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Feed Health</h2>
      <FeedHealthTable heartbeats={serialized} />
    </div>
  );
}
