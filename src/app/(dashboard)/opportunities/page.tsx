import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { OpportunityList } from "@/components/opportunities/OpportunityList";
import { FilterBar } from "@/components/opportunities/FilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { getValidSources } from "@/lib/validators/source";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const [params, sources] = await Promise.all([searchParams, getValidSources()]);
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 20;
  const status = params.status || "new";
  const source = params.source;
  const scoreMin = params.score_min ? parseInt(params.score_min) : 6;
  const workingModel = params.workingModel;
  const listingType = params.listingType;

  const where: Record<string, unknown> = {};
  if (status && status !== "All") where.status = status;
  if (source) where.source = source;
  if (scoreMin != null) where.score = { gte: scoreMin };
  if (workingModel) where.workingModel = workingModel;
  if (listingType) where.listingType = listingType;

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.opportunity.count({ where }),
  ]);

  const serialized = opportunities.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    appliedAt: o.appliedAt?.toISOString() ?? null,
    postedAt: o.postedAt?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Opportunities</h2>
      <Suspense fallback={null}>
        <FilterBar sources={sources} />
      </Suspense>
      <OpportunityList opportunities={serialized} />
      <Suspense fallback={null}>
        <Pagination total={total} page={page} limit={limit} />
      </Suspense>
    </div>
  );
}
