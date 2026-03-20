"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ScheduledEventsPanel } from "./ScheduledEventsPanel";
import { ContactsPane } from "./ContactsPane";
import type { PipelineApplication } from "./application-types";

interface ApplicationDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  app: PipelineApplication | null;
}

export function ApplicationDetailsDialog({
  open,
  onClose,
  app,
}: ApplicationDetailsDialogProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !app) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-details-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close details"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-card shadow-lg sm:max-h-[85vh] sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2
              id="application-details-title"
              className="text-lg font-semibold text-card-foreground truncate"
            >
              {app.company}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-2">{app.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Stage timeline</h3>
            {app.stageLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No stage changes recorded yet.</p>
            ) : (
              <ol className="space-y-2 border-l-2 border-border pl-3">
                {app.stageLogs.map((log) => (
                  <li key={log.id} className="text-sm">
                    <span className="font-medium text-card-foreground">{log.stage}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section>
            <ScheduledEventsPanel
              opportunityId={app.id}
              events={app.scheduledEvents}
            />
          </section>

          <section>
            <ContactsPane
              opportunityId={app.id}
              contacts={app.contacts}
              onUpdated={() => router.refresh()}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
