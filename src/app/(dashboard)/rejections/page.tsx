import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { RejectionCard } from "@/components/rejections/RejectionCard";
import { SourceFilter } from "@/components/rejections/SourceFilter";
import { Pagination } from "@/components/ui/Pagination";
import { getValidSources } from "@/lib/validators/source";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function RejectionsPage({ searchParams }: PageProps) {
  const [params, sources] = await Promise.all([searchParams, getValidSources()]);
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 21;
  const source = params.source;

  const where: Record<string, unknown> = {};
  if (source) where.source = source;

  const [rejections, total] = await Promise.all([
    prisma.rejection.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.rejection.count({ where }),
  ]);

  const serialized = rejections.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Disqualified</h2>
      <Suspense fallback={null}>
        <SourceFilter sources={sources} />
      </Suspense>
      {serialized.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No disqualified listings yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {serialized.map((rej) => (
            <RejectionCard key={rej.id} rejection={rej} />
          ))}
        </div>
      )}
      <Suspense fallback={null}>
        <Pagination total={total} page={page} limit={limit} />
      </Suspense>
    </div>
  );
}
