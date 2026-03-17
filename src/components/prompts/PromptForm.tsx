"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PromptFormProps {
  activePrompt?: {
    systemPrompt: string;
    userPromptTemplate: string;
  } | null;
}

export function PromptForm({ activePrompt }: PromptFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(activePrompt?.systemPrompt || "");
  const [userPromptTemplate, setUserPromptTemplate] = useState(activePrompt?.userPromptTemplate || "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, systemPrompt, userPromptTemplate, notes: notes || null }),
    });
    setSaving(false);
    setOpen(false);
    setName("");
    setNotes("");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        New prompt version
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-base font-semibold text-card-foreground">Create New Prompt Version</h3>
      <div>
        <label htmlFor="prompt-name" className="block text-sm font-medium text-foreground mb-1">Name</label>
        <input
          id="prompt-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          required
        />
      </div>
      <div>
        <label htmlFor="prompt-system" className="block text-sm font-medium text-foreground mb-1">System Prompt</label>
        <textarea
          id="prompt-system"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground font-mono"
          required
        />
      </div>
      <div>
        <label htmlFor="prompt-user-template" className="block text-sm font-medium text-foreground mb-1">User Prompt Template</label>
        <textarea
          id="prompt-user-template"
          value={userPromptTemplate}
          onChange={(e) => setUserPromptTemplate(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground font-mono"
          required
        />
      </div>
      <div>
        <label htmlFor="prompt-notes" className="block text-sm font-medium text-foreground mb-1">Notes</label>
        <input
          id="prompt-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          placeholder="Why this version was created"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Create"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-border px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
