"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface OpportunityEditFormProps {
  opportunityId: string;
  initial: {
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
  };
}

export function OpportunityEditForm({ opportunityId, initial }: OpportunityEditFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title.trim(),
          company: values.company.trim(),
          url: values.url.trim(),
          score: values.score,
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
          description: values.description.trim() || null,
          appliedVia: values.appliedVia.trim() || null,
          recruiterContact: values.recruiterContact.trim() || null,
          fullJobSpecification: values.fullJobSpecification.trim() || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? `Failed (${res.status})`);
        return;
      }
      router.push("/opportunities");
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
          <span className="text-sm font-medium">Title</span>
          <input
            required
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Company</span>
          <input
            required
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.company}
            onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">URL</span>
          <input
            required
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.url}
            onChange={(e) => setValues((v) => ({ ...v, url: e.target.value }))}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Score (0–10)</span>
          <input
            type="number"
            min={0}
            max={10}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.score}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                score: parseInt(e.target.value, 10) || 0,
              }))
            }
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Applied via</span>
          <input
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            placeholder="e.g. Job Scout"
            value={values.appliedVia}
            onChange={(e) =>
              setValues((v) => ({ ...v, appliedVia: e.target.value }))
            }
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm font-medium">Recruiter contact</span>
          <input
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.recruiterContact}
            onChange={(e) =>
              setValues((v) => ({ ...v, recruiterContact: e.target.value }))
            }
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm font-medium">Full job specification</span>
          <textarea
            rows={12}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-mono"
            value={values.fullJobSpecification}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                fullJobSpecification: e.target.value,
              }))
            }
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm font-medium">Short description</span>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.description}
            onChange={(e) =>
              setValues((v) => ({ ...v, description: e.target.value }))
            }
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Location</span>
          <input
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.location}
            onChange={(e) => setValues((v) => ({ ...v, location: e.target.value }))}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Working model</span>
          <select
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.workingModel}
            onChange={(e) =>
              setValues((v) => ({ ...v, workingModel: e.target.value }))
            }
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
            onChange={(e) =>
              setValues((v) => ({ ...v, listingType: e.target.value }))
            }
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
            onChange={(e) =>
              setValues((v) => ({ ...v, salaryMin: e.target.value }))
            }
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Salary max (£)</span>
          <input
            type="number"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={values.salaryMax}
            onChange={(e) =>
              setValues((v) => ({ ...v, salaryMax: e.target.value }))
            }
          />
        </label>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save"}
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
