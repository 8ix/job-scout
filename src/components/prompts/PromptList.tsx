"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Prompt {
  id: string;
  name: string;
  systemPrompt: string;
  userPromptTemplate: string;
  isActive: boolean;
  createdAt: string | Date;
  notes: string | null;
}

interface PromptListProps {
  prompts: Prompt[];
}

export function PromptList({ prompts }: PromptListProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    systemPrompt: string;
    userPromptTemplate: string;
    notes: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleActivate(id: string) {
    await fetch(`/api/prompts/${id}/activate`, { method: "PATCH" });
    router.refresh();
  }

  function startEdit(prompt: Prompt) {
    setEditingId(prompt.id);
    setEditForm({
      name: prompt.name,
      systemPrompt: prompt.systemPrompt,
      userPromptTemplate: prompt.userPromptTemplate,
      notes: prompt.notes ?? "",
    });
    setExpandedId(prompt.id);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  async function saveEdit(id: string) {
    if (!editForm) return;
    setSaving(true);
    const res = await fetch(`/api/prompts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        systemPrompt: editForm.systemPrompt,
        userPromptTemplate: editForm.userPromptTemplate,
        notes: editForm.notes || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setEditingId(null);
      setEditForm(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {prompts.map((prompt) => (
        <div key={prompt.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-card-foreground">{prompt.name}</h3>
              {prompt.isActive && (
                <span className="rounded-full bg-success px-2.5 py-0.5 text-xs font-medium text-white">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!prompt.isActive && (
                <button
                  onClick={() => handleActivate(prompt.id)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Activate
                </button>
              )}
              <button
                onClick={() => startEdit(prompt)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-card-foreground hover:bg-muted transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setExpandedId(expandedId === prompt.id ? null : prompt.id)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-card-foreground hover:bg-muted transition-colors"
              >
                View prompt
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Created: {new Date(prompt.createdAt).toLocaleDateString()}
            {prompt.notes && ` — ${prompt.notes}`}
          </p>

          {expandedId === prompt.id && (
            <div className="space-y-2 pt-2 border-t border-border">
              {editingId === prompt.id && editForm ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">System Prompt</label>
                    <textarea
                      value={editForm.systemPrompt}
                      onChange={(e) => setEditForm({ ...editForm, systemPrompt: e.target.value })}
                      rows={6}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">User Prompt Template</label>
                    <textarea
                      value={editForm.userPromptTemplate}
                      onChange={(e) => setEditForm({ ...editForm, userPromptTemplate: e.target.value })}
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
                    <input
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                      placeholder="Optional notes"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(prompt.id)}
                      disabled={saving}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded-lg border border-border px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">System Prompt</p>
                    <pre className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap text-card-foreground">
                      {prompt.systemPrompt}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">User Prompt Template</p>
                    <pre className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap text-card-foreground">
                      {prompt.userPromptTemplate}
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
