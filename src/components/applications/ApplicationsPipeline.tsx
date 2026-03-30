"use client";

import { useState, useMemo } from "react";
import {
  groupApplicationsByPipelineBandWithStale,
  buildBandDescriptions,
  countDistinctStages,
  type PipelineBandKey,
} from "@/lib/applications/pipeline";
import type { PipelineApplication } from "./application-types";
import { ApplicationCard } from "./ApplicationCard";
import { ApplicationDetailsDialog } from "./ApplicationDetailsDialog";

interface ApplicationsPipelineProps {
  applications: PipelineApplication[];
  staleIdleDays: number;
}

const BAND_TITLES: Record<PipelineBandKey, string> = {
  Offer: "Offer",
  "Final Round": "Final round",
  Interview: "Interview",
  Screening: "Screening — upcoming call",
  screeningWaiting: "Screening — no upcoming call",
  Applied: "Applied — upcoming call",
  appliedWaiting: "Applied — no upcoming call",
  stale: "Stale — consider archiving",
};

export function ApplicationsPipeline({ applications, staleIdleDays }: ApplicationsPipelineProps) {
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const bandDescriptions = useMemo(() => buildBandDescriptions(staleIdleDays), [staleIdleDays]);

  const groups = useMemo(
    () => groupApplicationsByPipelineBandWithStale(applications, new Date(), staleIdleDays),
    [applications, staleIdleDays]
  );

  const stageCount = useMemo(
    () => countDistinctStages(applications),
    [applications]
  );

  const detailsApp =
    detailsId === null
      ? null
      : (applications.find((a) => a.id === detailsId) ?? null);

  if (applications.length === 0) {
    return null;
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Pipeline uses <strong>{stageCount}</strong> distinct stage
        {stageCount === 1 ? "" : "s"} on this page. Top sections are closest to an offer.{" "}
        <strong>Interview</strong> is its own column. <strong>Screening</strong> vs{" "}
        <strong>Applied</strong> waiting lists are separate (no future event on the calendar). The{" "}
        <strong>Stale</strong> section lists idle applications (no upcoming calls, applied{" "}
        {staleIdleDays}+ days ago).
      </p>

      <div className="space-y-10">
        {groups.map(({ band, applications: apps }) => (
          <section key={band} aria-labelledby={`band-${band}`}>
            <div className="mb-4">
              <h3
                id={`band-${band}`}
                className="text-base font-semibold text-foreground"
              >
                {BAND_TITLES[band]}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-3xl">
                {bandDescriptions[band]}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {apps.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  band={band}
                  staleIdleDays={staleIdleDays}
                  onOpenDetails={() => setDetailsId(app.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <ApplicationDetailsDialog
        open={detailsId !== null && detailsApp !== null}
        onClose={() => setDetailsId(null)}
        app={detailsApp}
      />
    </>
  );
}
