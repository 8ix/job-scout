"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface ScheduledEventRow {
  id: string;
  kind: string;
  scheduledAt: string;
  notes: string | null;
}

interface ScheduledEventsPanelProps {
  opportunityId: string;
  events: ScheduledEventRow[];
}

export function ScheduledEventsPanel({
  opportunityId,
  events: initialEvents,
}: ScheduledEventsPanelProps) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [kind, setKind] = useState<"screening" | "interview" | "other">(
    "interview"
  );
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!scheduledAt) return;
    const iso = new Date(scheduledAt).toISOString();
    const res = await fetch(`/api/applications/${opportunityId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, scheduledAt: iso, notes: notes.trim() || null }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to add");
      return;
    }
    const row = await res.json();
    setEvents((prev) =>
      [...prev, row].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )
    );
    setNotes("");
    router.refresh();
  }

  async function removeEvent(id: string) {
    if (!confirm("Remove this scheduled event?")) return;
    const res = await fetch(
      `/api/applications/${opportunityId}/events/${id}`,
      { method: "DELETE" }
    );
    if (!res.ok) return;
    setEvents((prev) => prev.filter((x) => x.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground">
        Screening & interviews
      </h4>
      {events.length > 0 && (
        <ul className="space-y-2 text-sm">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-card px-3 py-2"
            >
              <span className="capitalize text-muted-foreground">{ev.kind}</span>
              <span>
                {new Date(ev.scheduledAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
              {ev.notes && (
                <span className="w-full text-muted-foreground">{ev.notes}</span>
              )}
              <button
                type="button"
                onClick={() => removeEvent(ev.id)}
                className="text-xs text-destructive hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={addEvent} className="flex flex-wrap items-end gap-2">
        {error && (
          <p className="w-full text-xs text-destructive">{error}</p>
        )}
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Type</span>
          <select
            className="rounded border border-border bg-card px-2 py-1.5 text-sm"
            value={kind}
            onChange={(e) =>
              setKind(e.target.value as "screening" | "interview" | "other")
            }
          >
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">When</span>
          <input
            type="datetime-local"
            className="rounded border border-border bg-card px-2 py-1.5 text-sm"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </label>
        <label className="min-w-[120px] flex-1 space-y-1">
          <span className="text-xs text-muted-foreground">Notes</span>
          <input
            className="w-full rounded border border-border bg-card px-2 py-1.5 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          Add
        </button>
      </form>
    </div>
  );
}
