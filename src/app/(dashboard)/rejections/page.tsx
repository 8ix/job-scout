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
      <div>
        <h2 className="text-2xl font-bold text-foreground">Disqualified</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground leading-relaxed">
          <span className="font-medium text-card-foreground">Amber cards</span> are{" "}
          <strong className="text-foreground/80">ingest blocklist</strong> hits (server refused the job
          and shows the matched pattern so you can tune rules). Other cards are listings your workflow
          sent as <code className="text-xs">POST /api/rejections</code>.
        </p>
      </div>
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
