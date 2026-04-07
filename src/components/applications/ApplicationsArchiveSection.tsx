"use client";

import { useState } from "react";
import Link from "next/link";
import { closedReasonLabel } from "@/lib/applications/application-closed-reason";

export type ArchivedApplicationRow = {
  id: string;
  title: string;
  company: string;
  appliedAt: string | null;
  stage: string | null;
  applicationClosedReason: string | null;
};

export function ApplicationsArchiveSection({ archived }: { archived: ArchivedApplicationRow[] }) {
  const [open, setOpen] = useState(false);

  if (archived.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No archived applications yet. When you reject or archive an application, it appears here (and
        may still appear on Disqualified if a listing row was created).
      </p>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-card-foreground">
          Archived applications ({archived.length})
        </span>
        <span className="text-xs text-muted-foreground">{open ? "Hide" : "Expand"}</span>
      </button>
      {open ? (
        <div className="border-t border-border overflow-x-auto">
          <table className="w-full min-w-[540px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Company</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Applied</th>
                <th className="px-3 py-2 font-medium">Stage</th>
                <th className="px-3 py-2 font-medium">Outcome</th>
                <th className="px-3 py-2 font-medium w-24"> </th>
              </tr>
            </thead>
            <tbody>
              {archived.map((row) => (
                <tr key={row.id} className="border-b border-border/80 hover:bg-muted/20">
                  <td className="px-3 py-2 text-card-foreground max-w-[10rem] truncate">
                    {row.company}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground max-w-[14rem] truncate">{row.title}</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {row.appliedAt
                      ? new Date(row.appliedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {row.stage ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">
                    {closedReasonLabel(row.applicationClosedReason)}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/applications/${row.id}/edit`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
