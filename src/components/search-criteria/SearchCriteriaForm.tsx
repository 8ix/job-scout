"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildSystemPrompt } from "@/lib/search-criteria/build-system-prompt";
import type { CriterionPair, SearchCriteria } from "@/lib/search-criteria/schema";
import {
  CRITERION_SECTION_KEYS,
  type CriterionSectionKey,
  emptySearchCriteria,
} from "@/lib/search-criteria/schema";

const SECTION_TITLES: Record<CriterionSectionKey, string> = {
  whereWork: "Where you want to work",
  compensation: "Compensation expectations",
  companyCulture: "Company, culture, and environment",
  role: "Role you're looking for",
  skillsMatch: "Skills match",
};

function BulletEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  function updateAt(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function add() {
    onChange([...items, ""]);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-card-foreground hover:bg-muted transition-colors"
        >
          Add bullet
        </button>
      </div>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="text-xs text-muted-foreground italic">No bullets yet — add one to describe a signal.</li>
        ) : null}
        {items.map((value, index) => (
          <li key={index} className="flex gap-2">
            <input
              value={value}
              onChange={(e) => updateAt(index, e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="e.g. Remote-first, or hybrid max 2 days in office"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="shrink-0 rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
              aria-label={`Remove ${label} bullet`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionEditor({
  title,
  pair,
  onChange,
}: {
  title: string;
  pair: CriterionPair;
  onChange: (next: CriterionPair) => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-base font-semibold text-card-foreground">{title}</h3>
      <BulletEditor
        label="Positive signals"
        items={pair.positive}
        onChange={(positive) => onChange({ ...pair, positive })}
      />
      <BulletEditor
        label="Negative signals"
        items={pair.negative}
        onChange={(negative) => onChange({ ...pair, negative })}
      />
    </section>
  );
}

export interface SearchCriteriaFormProps {
  initialCriteria: SearchCriteria;
  initialUpdatedAt: string;
}

export function SearchCriteriaForm({ initialCriteria, initialUpdatedAt }: SearchCriteriaFormProps) {
  const router = useRouter();
  const [criteria, setCriteria] = useState<SearchCriteria>(() => ({
    ...emptySearchCriteria(),
    ...initialCriteria,
  }));
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const livePrompt = useMemo(() => buildSystemPrompt(criteria), [criteria]);

  function setSection(key: CriterionSectionKey, pair: CriterionPair) {
    setCriteria((c) => ({ ...c, [key]: pair }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/search-criteria", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(criteria),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(typeof body.error === "string" ? body.error : "Save failed");
      return;
    }
    const body = (await res.json()) as { criteria: SearchCriteria; updatedAt: string };
    setCriteria(body.criteria);
    setUpdatedAt(body.updatedAt);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Build a neutral system prompt from your criteria and optional text. Nothing person-specific is stored in the
        app codebase — only what you save here. Your automation reads it from{" "}
        <code className="text-xs text-card-foreground">GET /api/prompts/active</code>.
      </p>
      <p className="text-xs text-muted-foreground">
        Last saved: {new Date(updatedAt).toLocaleString()}
      </p>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-base font-semibold text-card-foreground">Context (optional)</h3>
        <p className="text-xs text-muted-foreground">
          Who the assistant is helping, seniority, or any fixed background you want in the prompt. Leave blank for a
          minimal generic prompt plus your criteria only.
        </p>
        <textarea
          value={criteria.introContext}
          onChange={(e) => setCriteria((c) => ({ ...c, introContext: e.target.value }))}
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          placeholder="e.g. You are helping a senior backend engineer based in …"
        />
      </section>

      <div className="space-y-6">
        {CRITERION_SECTION_KEYS.map((key) => (
          <SectionEditor
            key={key}
            title={SECTION_TITLES[key]}
            pair={criteria[key]}
            onChange={(p) => setSection(key, p)}
          />
        ))}
      </div>

      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-base font-semibold text-card-foreground">Additional instructions (optional)</h3>
        <p className="text-xs text-muted-foreground">
          Extra rules, tone, or how you want the model to justify scores. Inserted near the end of the system prompt,
          after the standard JSON shape and field rules.
        </p>
        <textarea
          value={criteria.additionalInstructions}
          onChange={(e) => setCriteria((c) => ({ ...c, additionalInstructions: e.target.value }))}
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          placeholder="e.g. Always mention visa sponsorship if the listing is ambiguous…"
        />
      </section>

      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
        <button
          type="button"
          onClick={() => setPreviewOpen((o) => !o)}
          className="text-sm font-medium text-card-foreground hover:underline"
        >
          {previewOpen ? "Hide" : "Show"} generated system prompt preview
        </button>
        {previewOpen ? (
          <pre className="max-h-[min(28rem,50vh)] overflow-auto rounded-lg bg-muted p-3 text-xs text-card-foreground whitespace-pre-wrap font-mono border border-border">
            {livePrompt}
          </pre>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving…" : "Save search criteria"}
      </button>
    </form>
  );
}
