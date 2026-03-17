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

  async function handleActivate(id: string) {
    await fetch(`/api/prompts/${id}/activate`, { method: "PATCH" });
    router.refresh();
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
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
