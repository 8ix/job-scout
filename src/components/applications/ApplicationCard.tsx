"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PipelineApplication } from "./application-types";
import type { PipelineBandKey } from "@/lib/applications/pipeline";
import { STALE_APPLICATION_IDLE_DAYS } from "@/lib/constants/applications-ui";
import { StageDropdown } from "./StageDropdown";

function getDaysSinceApplied(appliedAt: string | null): number | null {
  if (!appliedAt) return null;
  const applied = new Date(appliedAt);
  const now = new Date();
  return Math.floor((now.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
}

function nextFutureEvent(
  events: PipelineApplication["scheduledEvents"],
  now: Date
): PipelineApplication["scheduledEvents"][0] | null {
  const future = events
    .filter((e) => new Date(e.scheduledAt).getTime() >= now.getTime())
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  return future[0] ?? null;
}

const bandBorder: Record<PipelineBandKey, string> = {
  Offer: "border-l-emerald-500",
  "Final Round": "border-l-teal-500",
  Interview: "border-l-sky-500",
  Screening: "border-l-violet-500",
  Applied: "border-l-slate-400 dark:border-l-slate-500",
  quiet: "border-l-amber-500/80",
  stale: "border-l-rose-500/90 dark:border-l-rose-400/90",
};

function scoreBadgeColor(score: number): string {
  if (score >= 7) return "bg-success text-white";
  if (score >= 4) return "bg-warning text-white";
  return "bg-danger text-white";
}

interface ApplicationCardProps {
  app: PipelineApplication;
  band: PipelineBandKey;
  onOpenDetails: () => void;
}

export function ApplicationCard({ app, band, onOpenDetails }: ApplicationCardProps) {
  const router = useRouter();
  const now = new Date();
  const daysSinceApplied = getDaysSinceApplied(app.appliedAt);
  const isStale = daysSinceApplied !== null && daysSinceApplied >= STALE_APPLICATION_IDLE_DAYS;
  const next = nextFutureEvent(app.scheduledEvents, now);

  return (
    <article
      className={`rounded-xl border border-border bg-card border-l-4 pl-4 pr-4 py-4 shadow-sm ${bandBorder[band]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-card-foreground truncate">{app.company}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{app.title}</p>
          {app.appliedVia && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              via {app.appliedVia}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${scoreBadgeColor(app.score)}`}
        >
          {app.score}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <StageDropdown
          opportunityId={app.id}
          value={app.stage ?? "Applied"}
          onUpdated={() => router.refresh()}
        />
        {daysSinceApplied !== null && (
          <span
            className={
              isStale ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"
            }
          >
            {daysSinceApplied === 1 ? "1 day" : `${daysSinceApplied} days`} since applied
            {isStale && " · Stale"}
          </span>
        )}
      </div>

      {next && (
        <p className="mt-2 text-xs text-primary">
          Next: <span className="capitalize">{next.kind}</span>{" "}
          {new Date(next.scheduledAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      )}

      {band === "stale" && (
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          Nothing scheduled in a long time — if this role is closed, set the stage to{" "}
          <strong className="text-foreground/80">Archived</strong>.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={onOpenDetails}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Details
        </button>
        <Link
          href={`/applications/${app.id}/edit`}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          Edit
        </Link>
        {app.url ? (
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            Listing
          </a>
        ) : (
          <span className="rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground">
            No listing URL
          </span>
        )}
      </div>
    </article>
  );
}
