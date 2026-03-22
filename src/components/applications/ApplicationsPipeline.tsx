"use client";

import { useState, useMemo } from "react";
import {
  groupApplicationsByPipelineBandWithStale,
  BAND_DESCRIPTIONS,
  countDistinctStages,
  type PipelineBandKey,
} from "@/lib/applications/pipeline";
import { STALE_APPLICATION_IDLE_DAYS } from "@/lib/constants/applications-ui";
import type { PipelineApplication } from "./application-types";
import { ApplicationCard } from "./ApplicationCard";
import { ApplicationDetailsDialog } from "./ApplicationDetailsDialog";

interface ApplicationsPipelineProps {
  applications: PipelineApplication[];
}

const BAND_TITLES: Record<PipelineBandKey, string> = {
  Offer: "Offer",
  "Final Round": "Final round",
  Interview: "Interview",
  Screening: "Screening",
  Applied: "Applied — with upcoming activity",
  quiet: "Waiting — no upcoming calls",
  stale: "Stale — consider archiving",
};

export function ApplicationsPipeline({ applications }: ApplicationsPipelineProps) {
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const groups = useMemo(
    () => groupApplicationsByPipelineBandWithStale(applications, new Date()),
    [applications]
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
        {stageCount === 1 ? "" : "s"} on this page. Top sections are closest to an offer. The{" "}
        <strong>Stale</strong> section at the bottom lists idle applications (no upcoming calls,{" "}
        applied {STALE_APPLICATION_IDLE_DAYS}+ days ago) — archive there if the role is dead.
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
                {BAND_DESCRIPTIONS[band]}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {apps.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  band={band}
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
