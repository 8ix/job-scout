"use client";

import { useState } from "react";
import type { ApplicationCorrespondenceItem } from "./application-types";
import { APPLICATION_CORRESPONDENCE_BODY_MAX } from "@/lib/constants/application-correspondence";

interface CorrespondencePaneProps {
  opportunityId: string;
  correspondence: ApplicationCorrespondenceItem[];
  onUpdated: () => void;
}

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CorrespondencePane({
  opportunityId,
  correspondence,
  onUpdated,
}: CorrespondencePaneProps) {
  const [showForm, setShowForm] = useState(false);
  const [receivedAtLocal, setReceivedAtLocal] = useState(() => toDatetimeLocalValue(new Date()));
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    const receivedAt = new Date(receivedAtLocal);
    if (Number.isNaN(receivedAt.getTime())) return;

    const res = await fetch(`/api/opportunities/${opportunityId}/correspondence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receivedAt: receivedAt.toISOString(),
        subject: subject.trim() || null,
        body: body.trim(),
      }),
    });
    if (!res.ok) return;
    setSubject("");
    setBody("");
    setReceivedAtLocal(toDatetimeLocalValue(new Date()));
    setShowForm(false);
    onUpdated();
  }

  async function handleDelete(correspondenceId: string) {
    if (!confirm("Remove this correspondence entry?")) return;
    const res = await fetch(
      `/api/opportunities/${opportunityId}/correspondence?id=${encodeURIComponent(correspondenceId)}`,
      { method: "DELETE" }
    );
    if (!res.ok) return;
    onUpdated();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-sm font-medium text-card-foreground">Correspondence</span>
          <p className="text-xs text-muted-foreground mt-0.5">
            Paste emails or notes; set when you received them (backfill supported).
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="shrink-0 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add entry
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-2 rounded-lg border border-border bg-muted/30 p-3"
          data-testid="correspondence-form"
        >
          <label className="block text-xs font-medium text-muted-foreground">
            Received at
            <input
              type="datetime-local"
              value={receivedAtLocal}
              onChange={(e) => setReceivedAtLocal(e.target.value)}
              className="mt-1 w-full rounded border border-border bg-card px-2 py-1.5 text-sm text-foreground"
              data-testid="correspondence-received-at"
            />
          </label>
          <input
            type="text"
            placeholder="Subject or short label (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded border border-border bg-card px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
            data-testid="correspondence-subject"
          />
          <textarea
            placeholder="Paste message text…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            maxLength={APPLICATION_CORRESPONDENCE_BODY_MAX}
            className="w-full rounded border border-border bg-card px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground font-mono text-xs leading-relaxed"
            data-testid="correspondence-body"
          />
          <p className="text-[10px] text-muted-foreground">
            {body.length.toLocaleString()} / {APPLICATION_CORRESPONDENCE_BODY_MAX.toLocaleString()}{" "}
            characters
          </p>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!body.trim()}
              className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setBody("");
                setSubject("");
              }}
              className="rounded border border-border px-3 py-1.5 text-xs hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {correspondence.length === 0 && !showForm ? (
        <p className="text-xs text-muted-foreground">No correspondence saved yet.</p>
      ) : (
        <ol className="space-y-4 border-l-2 border-border pl-3">
          {correspondence.map((c) => (
            <li key={c.id} className="relative" data-testid={`correspondence-entry-${c.id}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="text-sm font-medium text-card-foreground">
                    {new Date(c.receivedAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  {c.subject && (
                    <span className="block text-xs text-muted-foreground mt-0.5">{c.subject}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  Remove
                </button>
              </div>
              <pre className="mt-2 max-h-48 overflow-auto rounded-md border border-border bg-muted/40 p-2 text-xs whitespace-pre-wrap break-words font-mono text-card-foreground">
                {c.body}
              </pre>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Logged {new Date(c.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
