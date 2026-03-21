import { prisma } from "@/lib/prisma";
import { DEFAULT_OPPORTUNITY_SCORE_MIN } from "@/lib/constants/opportunities";
import { MobileOpportunityList } from "@/components/mobile/MobileOpportunityList";

export const dynamic = "force-dynamic";

/** Same defaults as desktop Opportunities list (default filters). */
const SCORE_MIN = DEFAULT_OPPORTUNITY_SCORE_MIN;

export default async function MobileOpportunitiesPage() {
  const opportunities = await prisma.opportunity.findMany({
    where: {
      status: "new",
      score: { gte: SCORE_MIN },
    },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  const serialized = opportunities.map((o) => ({
    id: o.id,
    title: o.title,
    company: o.company,
    location: o.location,
    score: o.score,
    verdict: o.verdict,
    url: o.url,
    source: o.source,
    status: o.status,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">New opportunities</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Score {SCORE_MIN}+ · Open a listing, then mark applied or disqualify.
        </p>
      </div>
      <MobileOpportunityList opportunities={serialized} />
    </div>
  );
}
