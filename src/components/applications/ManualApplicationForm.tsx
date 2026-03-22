"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "create" | "edit";

export interface ManualApplicationFormValues {
  title: string;
  company: string;
  url: string;
  score: number;
  location: string;
  workingModel: string;
  listingType: string;
  salaryMin: string;
  salaryMax: string;
  description: string;
  appliedVia: string;
  recruiterContact: string;
  fullJobSpecification: string;
}

const empty: ManualApplicationFormValues = {
  title: "",
  company: "",
  url: "",
  score: 7,
  location: "",
  workingModel: "",
  listingType: "",
  salaryMin: "",
  salaryMax: "",
  description: "",
  appliedVia: "",
  recruiterContact: "",
  fullJobSpecification: "",
};

interface ManualApplicationFormProps {
  mode: Mode;
  opportunityId?: string;
  initialValues?: Partial<ManualApplicationFormValues>;
}

export function ManualApplicationForm({
  mode,
  opportunityId,
  initialValues,
}: ManualApplicationFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ManualApplicationFormValues>({
    ...empty,
    ...initialValues,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ManualApplicationFormValues>(
    key: K,
    v: ManualApplicationFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const av = values.appliedVia.trim();
      const urlTrim = values.url.trim();
      const base: Record<string, unknown> = {
        title: values.title.trim(),
        company: values.company.trim(),
        url: urlTrim === "" ? null : urlTrim,
        score: values.score,
        description: values.description.trim() || null,
        recruiterContact: values.recruiterContact.trim() || null,
        fullJobSpecification: values.fullJobSpecification.trim() || null,
        location: values.location.trim() || null,
        workingModel:
          values.workingModel && values.workingModel !== ""
            ? values.workingModel
            : null,
        listingType:
          values.listingType && values.listingType !== ""
            ? values.listingType
            : null,
        salaryMin: values.salaryMin.trim()
          ? parseInt(values.salaryMin, 10)
          : null,
        salaryMax: values.salaryMax.trim()
          ? parseInt(values.salaryMax, 10)
          : null,
      };

      const createBody: Record<string, unknown> = { ...base };
      if (av) createBody.appliedVia = av;

      const patchBody: Record<string, unknown> = {
        ...base,
        appliedVia: av || null,
      };

      const url =
        mode === "create"
          ? "/api/applications"
          : `/api/applications/${opportunityId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "create" ? createBody : patchBody),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? `Request failed (${res.status})`);
        return;
      }
      router.push("/applications");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm font-medium">Title *</span>
          <input
            required
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Company *</span>
          <input
            required
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.company}
            onChange={(e) => update("company", e.target.value)}
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm font-medium">Listing URL</span>
          <input
            type="url"
            placeholder="https://… (optional)"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.url}
            onChange={(e) => update("url", e.target.value)}
          />
          <span className="text-xs text-muted-foreground">
            Optional for manual entries and CSV imports—add later if you don&apos;t have the posting link.
          </span>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Score (0–10) *</span>
          <input
            required
            type="number"
            min={0}
            max={10}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.score}
            onChange={(e) => update("score", parseInt(e.target.value, 10) || 0)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Applied via</span>
          <input
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            placeholder={mode === "create" ? "Defaults to External" : ""}
            value={values.appliedVia}
            onChange={(e) => update("appliedVia", e.target.value)}
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm font-medium">Recruiter contact</span>
          <input
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.recruiterContact}
            onChange={(e) => update("recruiterContact", e.target.value)}
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm font-medium">Full job specification</span>
          <textarea
            rows={12}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-mono"
            placeholder="Paste the full job description…"
            value={values.fullJobSpecification}
            onChange={(e) => update("fullJobSpecification", e.target.value)}
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm font-medium">Short description / excerpt</span>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Location</span>
          <input
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.location}
            onChange={(e) => update("location", e.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Working model</span>
          <select
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.workingModel}
            onChange={(e) => update("workingModel", e.target.value)}
          >
            <option value="">—</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
            <option value="Unknown">Unknown</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Listing type</span>
          <select
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.listingType}
            onChange={(e) => update("listingType", e.target.value)}
          >
            <option value="">—</option>
            <option value="Direct">Direct</option>
            <option value="Recruiter">Recruiter</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Salary min (£)</span>
          <input
            type="number"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.salaryMin}
            onChange={(e) => update("salaryMin", e.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Salary max (£)</span>
          <input
            type="number"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.salaryMax}
            onChange={(e) => update("salaryMax", e.target.value)}
          />
        </label>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "Saving…" : mode === "create" ? "Add application" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
