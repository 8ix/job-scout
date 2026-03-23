"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type IngestBlocklistRuleRow = {
  id: string;
  pattern: string;
  scope: "company" | "title" | "any";
  note: string | null;
  enabled: boolean;
  createdAt: string;
};

interface IngestBlocklistManagerProps {
  rules: IngestBlocklistRuleRow[];
}

const scopeOptions: { value: IngestBlocklistRuleRow["scope"]; label: string }[] = [
  { value: "company", label: "Company only" },
  { value: "title", label: "Job title only" },
  { value: "any", label: "Any field (company, title, description)" },
];

export function IngestBlocklistManager({ rules: initialRules }: IngestBlocklistManagerProps) {
  const router = useRouter();
  const [pattern, setPattern] = useState("");
  const [scope, setScope] = useState<IngestBlocklistRuleRow["scope"]>("company");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!pattern.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ingest-blocklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pattern: pattern.trim(),
          scope,
          note: note.trim() || undefined,
        }),
      });
      if (res.ok) {
        setPattern("");
        setNote("");
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        alert(body.error || "Failed to add rule");
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleEnabled(id: string, enabled: boolean) {
    const res = await fetch(`/api/ingest-blocklist/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });
    if (res.ok) {
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this block rule?")) return;
    const res = await fetch(`/api/ingest-blocklist/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      alert(body.error || "Failed to delete");
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end"
        data-testid="ingest-blocklist-form"
      >
        <div className="flex min-w-[200px] flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Pattern</label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="e.g. Acme Staffing"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            data-testid="ingest-blocklist-pattern-input"
          />
        </div>
        <div className="flex min-w-[180px] flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Match scope</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as IngestBlocklistRuleRow["scope"])}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            data-testid="ingest-blocklist-scope-select"
          >
            {scopeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-[200px] flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reminder why this is blocked"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !pattern.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          data-testid="ingest-blocklist-submit"
        >
          Add rule
        </button>
      </form>

      {initialRules.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            No block rules yet. Add a company name or keyword above. Automation can fetch the list via{" "}
            <code className="text-xs text-card-foreground">GET /api/ingest-blocklist</code> with your
            API key.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-sm" data-testid="ingest-blocklist-table">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-3 py-2 font-medium text-muted-foreground">On</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Pattern</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Scope</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Note</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Added</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialRules.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleEnabled(r.id, r.enabled)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.enabled
                          ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                          : "bg-muted text-muted-foreground"
                      }`}
                      data-testid={`ingest-blocklist-toggle-${r.id}`}
                    >
                      {r.enabled ? "Yes" : "No"}
                    </button>
                  </td>
                  <td className="px-3 py-2 font-medium text-card-foreground">{r.pattern}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.scope}</td>
                  <td className="max-w-[200px] truncate px-3 py-2 text-muted-foreground">
                    {r.note ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="rounded-lg border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                      data-testid={`ingest-blocklist-delete-${r.id}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
