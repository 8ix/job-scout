"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEFAULT_OPPORTUNITY_SCORE_MIN } from "@/lib/constants/opportunities";
import type {
  ApplicationGoalsDashboardDTO,
  CadenceProgressDTO,
} from "@/lib/goals/application-goal-progress";

const WEEKDAY_LABELS: { value: number; label: string }[] = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const COMMON_TIMEZONES = [
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Australia/Sydney",
  "Asia/Tokyo",
];

function CadenceBlock({
  title,
  cadence,
  target,
  testId,
}: {
  title: string;
  cadence: CadenceProgressDTO | null;
  target: number;
  testId: string;
}) {
  if (target <= 0 || !cadence) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">No goal set (0 = off)</p>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((cadence.currentCount / cadence.target) * 100));

  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-card-foreground">{title}</p>
        <span className="text-xs text-muted-foreground tabular-nums">
          {cadence.currentLabel}
        </span>
      </div>
      <p className="mt-2 text-lg font-semibold tabular-nums text-card-foreground">
        {cadence.currentCount} / {cadence.target}
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          meaningful applications
        </span>
      </p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${pct}%` }}
          data-testid={testId}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Last period ({cadence.previousLabel}): {cadence.previousCount}/{cadence.target} —{" "}
        {cadence.previousHit ? (
          <span className="font-medium text-emerald-600 dark:text-emerald-400">hit goal</span>
        ) : (
          <span className="font-medium text-amber-700 dark:text-amber-400">below goal</span>
        )}
      </p>
      {cadence.currentHit && (
        <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          This period: goal reached
        </p>
      )}
    </div>
  );
}

export interface ApplicationGoalsCardProps {
  initial: ApplicationGoalsDashboardDTO;
}

export function ApplicationGoalsCard({ initial }: ApplicationGoalsCardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const s = initial.settings;
  const [weeklyTarget, setWeeklyTarget] = useState(String(s.weeklyTargetCount));
  const [monthlyTarget, setMonthlyTarget] = useState(String(s.monthlyTargetCount));
  const [weekStartsOn, setWeekStartsOn] = useState(String(s.weekStartsOn));
  const [timezone, setTimezone] = useState(s.timezone);

  useEffect(() => {
    if (!editing) {
      setWeeklyTarget(String(initial.settings.weeklyTargetCount));
      setMonthlyTarget(String(initial.settings.monthlyTargetCount));
      setWeekStartsOn(String(initial.settings.weekStartsOn));
      setTimezone(initial.settings.timezone);
    }
  }, [initial, editing]);

  function resetForm() {
    setWeeklyTarget(String(initial.settings.weeklyTargetCount));
    setMonthlyTarget(String(initial.settings.monthlyTargetCount));
    setWeekStartsOn(String(initial.settings.weekStartsOn));
    setTimezone(initial.settings.timezone);
    setError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const wt = Number.parseInt(weeklyTarget, 10);
    const mt = Number.parseInt(monthlyTarget, 10);
    const ws = Number.parseInt(weekStartsOn, 10);
    if (Number.isNaN(wt) || Number.isNaN(mt) || Number.isNaN(ws)) {
      setError("Targets and week start must be numbers.");
      setSaving(false);
      return;
    }
    const res = await fetch("/api/preferences/application-goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weeklyTargetCount: wt,
        monthlyTargetCount: mt,
        weekStartsOn: ws,
        timezone: timezone.trim(),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(typeof j.error === "string" ? j.error : "Save failed");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  return (
    <section
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
      data-testid="application-goals-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">Application goals</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Meaningful = applied with score ≥ {DEFAULT_OPPORTUNITY_SCORE_MIN}, counted by apply date (
            {initial.settings.timezone}).
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setEditing(true);
            }}
            className="shrink-0 rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-muted"
          >
            Edit goals
          </button>
        )}
      </div>

      {!editing ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <CadenceBlock
            title="This week"
            cadence={initial.weekly}
            target={s.weeklyTargetCount}
            testId="weekly-progress-bar"
          />
          <CadenceBlock
            title="This month"
            cadence={initial.monthly}
            target={s.monthlyTargetCount}
            testId="monthly-progress-bar"
          />
        </div>
      ) : (
        <form onSubmit={handleSave} className="mt-4 space-y-3" data-testid="application-goals-form">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-muted-foreground">
              Weekly target (0 = off)
              <input
                type="number"
                min={0}
                max={100}
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(e.target.value)}
                className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              Monthly target (0 = off)
              <input
                type="number"
                min={0}
                max={500}
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(e.target.value)}
                className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
              />
            </label>
          </div>
          <label className="block text-xs font-medium text-muted-foreground">
            Week starts on
            <select
              value={weekStartsOn}
              onChange={(e) => setWeekStartsOn(e.target.value)}
              className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
            >
              {WEEKDAY_LABELS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-muted-foreground">
            Time zone (IANA)
            <input
              type="text"
              list="goal-timezones"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 font-mono text-xs"
            />
            <datalist id="goal-timezones">
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz} />
              ))}
            </datalist>
          </label>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                resetForm();
              }}
              className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
