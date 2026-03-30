"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RESET_CONFIRM_PHRASE } from "@/lib/validators/application-workflow";

interface SettingsPageClientProps {
  initialStaleIdleDays: number;
}

export function SettingsPageClient({ initialStaleIdleDays }: SettingsPageClientProps) {
  const router = useRouter();
  const [staleIdleDays, setStaleIdleDays] = useState(initialStaleIdleDays);
  const [workflowSaving, setWorkflowSaving] = useState(false);
  const [workflowMessage, setWorkflowMessage] = useState<string | null>(null);

  const [deleteApplicationHistory, setDeleteApplicationHistory] = useState(true);
  const [deleteAllRejections, setDeleteAllRejections] = useState(true);
  const [deleteAllOpportunities, setDeleteAllOpportunities] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  async function saveWorkflow(e: React.FormEvent) {
    e.preventDefault();
    setWorkflowSaving(true);
    setWorkflowMessage(null);
    const res = await fetch("/api/settings/application-workflow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staleIdleDays: Number(staleIdleDays) }),
    });
    setWorkflowSaving(false);
    if (!res.ok) {
      setWorkflowMessage("Could not save settings");
      return;
    }
    setWorkflowMessage("Saved");
    router.refresh();
  }

  async function runReset(e: React.FormEvent) {
    e.preventDefault();
    setResetting(true);
    setResetError(null);
    const res = await fetch("/api/settings/reset-application-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: resetPassword,
        confirmPhrase,
        deleteApplicationHistory,
        deleteAllRejections,
        deleteAllOpportunities,
      }),
    });
    setResetting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setResetError(
        typeof body.error === "string"
          ? body.error
          : "Reset failed — check password and confirmation phrase"
      );
      return;
    }
    setResetPassword("");
    setConfirmPhrase("");
    setResetError(null);
    router.refresh();
    window.location.href = "/dashboard";
  }

  return (
    <div className="space-y-10 max-w-2xl">
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-base font-semibold text-card-foreground">Application workflow</h3>
        <p className="text-sm text-muted-foreground">
          Applications with no future screening or interview scheduled are marked <strong>Stale</strong>{" "}
          after this many days since apply. Stale rows are auto-archived when you open the{" "}
          <strong>Dashboard</strong> or <strong>Applications</strong> page (at most about once per hour). You can
          also call the optional cron endpoint below if you prefer a fixed schedule.
        </p>
        <form onSubmit={saveWorkflow} className="space-y-3">
          <div>
            <label htmlFor="stale-days" className="block text-sm font-medium text-foreground mb-1">
              Stale / auto-archive threshold (days)
            </label>
            <input
              id="stale-days"
              type="number"
              min={7}
              max={365}
              value={staleIdleDays}
              onChange={(e) => setStaleIdleDays(Number(e.target.value))}
              className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          {workflowMessage ? (
            <p className="text-sm text-muted-foreground" role="status">
              {workflowMessage}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={workflowSaving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {workflowSaving ? "Saving…" : "Save"}
          </button>
        </form>
        <p className="text-xs text-muted-foreground">
          Optional scheduled auto-archive:{" "}
          <code className="text-[11px]">/api/cron/auto-archive-stale-applications</code> with{" "}
          <code className="text-[11px]">Authorization: Bearer CRON_SECRET</code> (set{" "}
          <code className="text-[11px]">CRON_SECRET</code> only if you use this).
        </p>
      </section>

      <section className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 space-y-4">
        <h3 className="text-base font-semibold text-destructive">Danger zone — reset job search data</h3>
        <p className="text-sm text-muted-foreground">
          Irreversible. Choose what to delete, enter your dashboard password, and type the confirmation
          phrase exactly.
        </p>
        <form onSubmit={runReset} className="space-y-4">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={deleteApplicationHistory}
              onChange={(e) => setDeleteApplicationHistory(e.target.checked)}
              disabled={deleteAllOpportunities}
              className="mt-1"
            />
            <span>
              Delete all <strong>application history</strong> (every opportunity that has an apply date —
              active and archived).
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={deleteAllRejections}
              onChange={(e) => setDeleteAllRejections(e.target.checked)}
              className="mt-1"
            />
            <span>
              Delete all rows on the <strong>Disqualified</strong> page (workflow + application-sourced
              rejections).
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={deleteAllOpportunities}
              onChange={(e) => {
                setDeleteAllOpportunities(e.target.checked);
                if (e.target.checked) setDeleteApplicationHistory(false);
              }}
              className="mt-1"
            />
            <span>
              Delete <strong>all opportunities</strong> (entire pipeline, including leads you never
              applied to). Overrides “application history” only.
            </span>
          </label>
          <div>
            <label htmlFor="reset-phrase" className="block text-sm font-medium mb-1">
              Type: <code className="text-xs">{RESET_CONFIRM_PHRASE}</code>
            </label>
            <input
              id="reset-phrase"
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="reset-password" className="block text-sm font-medium mb-1">
              Dashboard password
            </label>
            <input
              id="reset-password"
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              autoComplete="current-password"
            />
          </div>
          {resetError ? (
            <p className="text-sm text-destructive" role="alert">
              {resetError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={resetting}
            className="rounded-lg border border-destructive bg-destructive text-destructive-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {resetting ? "Working…" : "Reset selected data"}
          </button>
        </form>
      </section>
    </div>
  );
}
