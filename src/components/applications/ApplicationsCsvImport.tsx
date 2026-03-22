"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_CSV_IMPORT_ROWS } from "@/lib/constants/applications-import";

type ImportResult = {
  created: number;
  skipped: number;
  truncated: boolean;
  errors: { row: number; message: string }[];
};

export function ApplicationsCsvImport() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) {
      setError("Choose a CSV file first.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/applications/import", {
        method: "POST",
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof body.error === "string" ? body.error : `Import failed (${res.status})`);
        return;
      }
      setResult(body as ImportResult);
      setFile(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="rounded-xl border border-border bg-card overflow-hidden"
      data-testid="applications-csv-import"
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
        data-testid="applications-csv-import-toggle"
      >
        <span>Import from CSV</span>
        <span className="text-muted-foreground tabular-nums" aria-hidden>
          {expanded ? "▾" : "▸"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border p-6 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Upload a spreadsheet to create <strong className="text-foreground/80">manual</strong>{" "}
            applications on this server. Every imported row is created in the{" "}
            <strong className="text-foreground/80">Applied</strong> stage—update stages and details in
            the UI afterward. Columns such as <strong className="text-foreground/80">Status</strong>,{" "}
            <strong className="text-foreground/80">Interview Date</strong>, and{" "}
            <strong className="text-foreground/80">Last Updated</strong> from your file are{" "}
            <strong className="text-foreground/80">ignored</strong>. Required:{" "}
            <code className="text-[11px]">application_date</code> (YYYY-MM-DD),{" "}
            <code className="text-[11px]">company</code>, <code className="text-[11px]">role</code>.
            Optional: <code className="text-[11px]">job_url</code> (listing link),{" "}
            <code className="text-[11px]">drive_doc_link</code>, salary, notes, etc. Max{" "}
            {MAX_CSV_IMPORT_ROWS} rows per file.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/applications-import-template.csv"
              download
              className="text-sm font-medium text-primary hover:underline"
            >
              Download CSV template
            </a>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">CSV file</span>
              <input
                type="file"
                accept=".csv,text/csv"
                aria-label="CSV file"
                className="block w-full max-w-xs text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <button
              type="submit"
              disabled={loading || !file}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Importing…" : "Import"}
            </button>
          </form>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {result && (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm space-y-2">
              <p className="text-card-foreground">
                Created <strong>{result.created}</strong>, skipped (duplicate ID){" "}
                <strong>{result.skipped}</strong>
                {result.truncated && (
                  <span className="text-amber-600 dark:text-amber-500">
                    {" "}
                    — file truncated to {MAX_CSV_IMPORT_ROWS} rows
                  </span>
                )}
                .
              </p>
              {result.errors.length > 0 && (
                <ul className="list-disc list-inside text-xs text-muted-foreground max-h-40 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <li key={`${err.row}-${i}`}>
                      Row {err.row}: {err.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
