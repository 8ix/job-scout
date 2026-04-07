"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiReference } from "./ApiReference";

interface Feed {
  id: string;
  name: string;
  createdAt: string;
}

interface FeedManagerProps {
  feeds: Feed[];
}

export function FeedManager({ feeds }: FeedManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        setName("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this feed?")) return;
    const res = await fetch(`/api/feeds/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const body = await res.json();
      alert(body.error || "Failed to delete feed");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Feed name"
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Add Feed
        </button>
      </form>

      {feeds.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No feeds configured yet. Add one above to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {feeds.map((feed) => (
            <div key={feed.id} className="rounded-xl border border-border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0">
                  <span className="font-medium text-card-foreground truncate block">{feed.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Added {new Date(feed.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === feed.id ? null : feed.id)}
                    className="rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground hover:text-card-foreground"
                  >
                    API Reference
                  </button>
                  <button
                    onClick={() => handleDelete(feed.id)}
                    className="rounded-lg border border-red-300 px-3 py-1 text-xs text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {expandedId === feed.id && (
                <div className="border-t border-border px-4 pb-4">
                  <ApiReference feedName={feed.name} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
