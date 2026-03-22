import Link from "next/link";
import { DEFAULT_OPPORTUNITY_SCORE_MIN } from "@/lib/constants/opportunities";
import { STUCK_NEW_DAYS } from "@/lib/constants/dashboard";

export interface NextActionsStripProps {
  toReview: number;
  stuckNew: number;
  staleFeedCount: number;
  upcomingInterviewCount: number;
  activeApplications: number;
}

const oppQueryBase = `status=new&score_min=${DEFAULT_OPPORTUNITY_SCORE_MIN}`;

export function NextActionsStrip({
  toReview,
  stuckNew,
  staleFeedCount,
  upcomingInterviewCount,
  activeApplications,
}: NextActionsStripProps) {
  const stuckHref = `/opportunities?${oppQueryBase}&min_age_days=${STUCK_NEW_DAYS}`;
  const reviewHref = `/opportunities?${oppQueryBase}`;

  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-card px-4 py-3 text-sm"
      data-testid="next-actions-strip"
    >
      <span className="font-medium text-muted-foreground shrink-0">Next actions</span>
      <Link
        href={reviewHref}
        className="rounded-md px-2 py-1 text-card-foreground hover:bg-muted"
      >
        <span className="font-semibold tabular-nums">{toReview}</span> to review
      </Link>
      <span className="text-border hidden sm:inline">|</span>
      <Link href={stuckHref} className="rounded-md px-2 py-1 text-card-foreground hover:bg-muted">
        <span className="font-semibold tabular-nums">{stuckNew}</span> stuck{" "}
        <span className="text-muted-foreground">({STUCK_NEW_DAYS}+ days)</span>
      </Link>
      <span className="text-border hidden sm:inline">|</span>
      <Link href="/feeds" className="rounded-md px-2 py-1 text-card-foreground hover:bg-muted">
        <span className="font-semibold tabular-nums">{staleFeedCount}</span> stale feeds
      </Link>
      <span className="text-border hidden sm:inline">|</span>
      <Link href="/applications" className="rounded-md px-2 py-1 text-card-foreground hover:bg-muted">
        <span className="font-semibold tabular-nums">{upcomingInterviewCount}</span> calls (2 wks)
      </Link>
      <span className="text-border hidden sm:inline">|</span>
      <Link href="/applications" className="rounded-md px-2 py-1 text-card-foreground hover:bg-muted">
        <span className="font-semibold tabular-nums">{activeApplications}</span> active apps
      </Link>
    </div>
  );
}
