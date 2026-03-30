import Link from "next/link";

interface ApplicationLifecycleCardProps {
  totalEverApplied: number;
  totalClosedApplications: number;
}

export function ApplicationLifecycleCard({
  totalEverApplied,
  totalClosedApplications,
}: ApplicationLifecycleCardProps) {
  const activePipelineApprox = Math.max(0, totalEverApplied - totalClosedApplications);

  return (
    <div
      className="rounded-xl border border-border bg-card p-5 space-y-2"
      data-testid="application-lifecycle-card"
    >
      <h3 className="text-sm font-semibold text-foreground">Applications (lifetime)</h3>
      <p className="text-xs text-muted-foreground">
        Total rows you ever marked as applied (active + closed). Closed counts archived / rejected
        applications only.
      </p>
      <dl className="grid grid-cols-2 gap-3 text-sm pt-1">
        <div>
          <dt className="text-muted-foreground text-xs">Ever applied</dt>
          <dd className="font-semibold tabular-nums">{totalEverApplied}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Closed (archive)</dt>
          <dd className="font-semibold tabular-nums">{totalClosedApplications}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground text-xs">Approx. active pipeline</dt>
          <dd className="font-semibold tabular-nums">{activePipelineApprox}</dd>
        </div>
      </dl>
      <Link
        href="/applications"
        className="inline-block text-xs font-medium text-primary hover:underline pt-1"
      >
        View applications
      </Link>
    </div>
  );
}
