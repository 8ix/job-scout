import { ingestBlocklistScopeLabel } from "@/lib/rejections/ingest-blocklist-display";

interface Rejection {
  id: string;
  title: string;
  company: string | null;
  source: string;
  score: number;
  redFlags: string | null;
  url: string;
  createdAt: string | Date;
  ingestBlocklistRuleId?: string | null;
  ingestBlocklistPattern?: string | null;
  ingestBlocklistScope?: string | null;
}

interface RejectionCardProps {
  rejection: Rejection;
}

function isIngestBlocklistRejection(r: Rejection): boolean {
  return Boolean(r.ingestBlocklistPattern?.trim() || r.ingestBlocklistRuleId);
}

export function RejectionCard({ rejection }: RejectionCardProps) {
  const blocklist = isIngestBlocklistRejection(rejection);

  return (
    <div
      className={`rounded-xl border p-5 space-y-3 ${
        blocklist
          ? "border-amber-500/70 bg-amber-50/80 dark:border-amber-600/60 dark:bg-amber-950/25"
          : "border-border bg-card"
      }`}
      data-testid={blocklist ? "rejection-card-blocklist" : "rejection-card-workflow"}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-card-foreground truncate">
              {rejection.title}
            </h3>
            {blocklist && (
              <span className="shrink-0 rounded-full bg-amber-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white dark:bg-amber-500/90">
                Ingest blocklist
              </span>
            )}
          </div>
          {rejection.company && (
            <p className="text-sm text-muted-foreground">{rejection.company}</p>
          )}
        </div>
        <span
          className={`shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold text-white ${
            blocklist ? "bg-amber-600 dark:bg-amber-500" : "bg-danger"
          }`}
        >
          {rejection.score}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span
          className={`rounded-full px-2.5 py-0.5 ${
            blocklist
              ? "bg-amber-200/80 text-amber-950 dark:bg-amber-900/50 dark:text-amber-100"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {rejection.source}
        </span>
      </div>

      {blocklist && rejection.ingestBlocklistPattern && (
        <div
          className="rounded-lg border border-amber-400/50 bg-amber-100/60 px-3 py-2 text-sm dark:border-amber-700/50 dark:bg-amber-950/40"
          data-testid="rejection-blocklist-match"
        >
          <p className="font-medium text-amber-950 dark:text-amber-100">Why it was blocked</p>
          <p className="mt-1 text-amber-900 dark:text-amber-50">
            <span className="text-muted-foreground dark:text-amber-200/90">Matched pattern: </span>
            <code className="rounded bg-amber-200/80 px-1.5 py-0.5 text-xs font-mono text-amber-950 dark:bg-amber-900/80 dark:text-amber-50">
              {rejection.ingestBlocklistPattern}
            </code>
          </p>
          {rejection.ingestBlocklistScope && (
            <p className="mt-1 text-xs text-amber-900/90 dark:text-amber-200/90">
              Scope: {ingestBlocklistScopeLabel(rejection.ingestBlocklistScope)}
            </p>
          )}
          {rejection.ingestBlocklistRuleId && (
            <p className="mt-1 text-[11px] text-amber-800/80 dark:text-amber-300/70">
              Rule ID: <span className="font-mono">{rejection.ingestBlocklistRuleId}</span>
            </p>
          )}
        </div>
      )}

      {rejection.redFlags && (
        <div className="text-sm">
          <span className={`font-medium ${blocklist ? "text-amber-800 dark:text-amber-200" : "text-danger"}`}>
            {blocklist ? "Note: " : "Flags: "}
          </span>
          <span className="text-card-foreground">{rejection.redFlags}</span>
        </div>
      )}

      <div className="pt-2 border-t border-border/80">
        <a
          href={rejection.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary hover:underline"
        >
          View listing
        </a>
      </div>
    </div>
  );
}
