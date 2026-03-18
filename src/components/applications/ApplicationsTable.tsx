"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { StageDropdown } from "./StageDropdown";
import { ContactsPane } from "./ContactsPane";

export interface ApplicationContact {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
}

const STALE_DAYS = 30;

function getDaysSinceApplied(appliedAt: string | null): number | null {
  if (!appliedAt) return null;
  const applied = new Date(appliedAt);
  const now = new Date();
  return Math.floor((now.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
}

function formatAge(days: number): string {
  return days === 1 ? "1 day" : `${days} days`;
}

export interface Application {
  id: string;
  title: string;
  company: string;
  url: string;
  source: string;
  score: number;
  appliedAt: string | null;
  stage: string | null;
  contacts: ApplicationContact[];
}

interface ApplicationsTableProps {
  applications: Application[];
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No applied jobs yet. Mark opportunities as applied from the Opportunities page.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Company</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Applied</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Age</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stage</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contacts</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const daysSinceApplied = getDaysSinceApplied(app.appliedAt);
            const isStale = daysSinceApplied !== null && daysSinceApplied >= STALE_DAYS;
            return (
            <Fragment key={app.id}>
              <tr className={`border-b border-border last:border-0 hover:bg-muted/30 ${isStale ? "bg-amber-950/20" : ""}`}>
                <td className="px-4 py-3 font-medium text-card-foreground">{app.company}</td>
                <td className="px-4 py-3 text-card-foreground">{app.title}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {app.appliedAt
                    ? new Date(app.appliedAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {daysSinceApplied !== null ? (
                    <span className={isStale ? "text-amber-600 font-medium" : ""}>
                      {formatAge(daysSinceApplied)}
                      {isStale && (
                        <span className="ml-2 rounded bg-amber-500/30 px-1.5 py-0.5 text-xs text-amber-800 dark:text-amber-200">
                          Stale
                        </span>
                      )}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  <StageDropdown
                    opportunityId={app.id}
                    value={app.stage ?? "Applied"}
                    onUpdated={() => router.refresh()}
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expandedId === app.id ? null : app.id)
                    }
                    className="text-primary hover:underline text-left"
                  >
                    {app.contacts.length} contact{app.contacts.length !== 1 ? "s" : ""}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View listing
                  </a>
                </td>
              </tr>
              {expandedId === app.id && (
                <tr className="border-b border-border bg-muted/20">
                  <td colSpan={7} className="px-4 py-4">
                    <ContactsPane
                      opportunityId={app.id}
                      contacts={app.contacts}
                      onUpdated={() => router.refresh()}
                    />
                  </td>
                </tr>
              )}
            </Fragment>
          );
          })}
        </tbody>
      </table>
    </div>
  );
}
