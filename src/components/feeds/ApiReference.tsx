"use client";

interface ApiReferenceProps {
  feedName: string;
}

export function ApiReference({ feedName }: ApiReferenceProps) {
  const endpoints = [
    {
      method: "POST",
      path: "/api/opportunities",
      auth: "X-API-Key",
      body: `{ "source": "${feedName}", "jobId": "...", "title": "...", "company": "...", "score": 8, "verdict": "Strong fit", "url": "https://..." }`,
    },
    {
      method: "POST",
      path: "/api/rejections",
      auth: "X-API-Key",
      body: `{ "source": "${feedName}", "jobId": "...", "title": "...", "url": "https://...", "score": 2 }`,
    },
    {
      method: "POST",
      path: "/api/heartbeats",
      auth: "X-API-Key",
      body: `{ "source": "${feedName}", "jobsReceived": 50, "jobsNew": 10, "jobsScored": 10, "jobsOpportunity": 3, "ranAt": "2026-01-01T00:00:00.000Z" }`,
    },
    {
      method: "POST",
      path: "/api/seen-ids",
      auth: "X-API-Key",
      body: `{ "source": "${feedName}", "ids": ["id1", "id2", "id3"] }`,
    },
    {
      method: "GET",
      path: "/api/prompts/active",
      auth: "None",
      body: null,
    },
  ];

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-border bg-muted/50 p-4 text-xs">
      <p className="text-sm font-medium text-card-foreground">
        n8n Workflow Endpoints for &ldquo;{feedName}&rdquo;
      </p>
      {endpoints.map((ep) => (
        <div key={ep.path} className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono font-semibold text-primary">
              {ep.method}
            </span>
            <code className="text-card-foreground">{ep.path}</code>
          </div>
          <div className="text-muted-foreground">Auth: {ep.auth}</div>
          {ep.body && (
            <pre className="overflow-x-auto rounded bg-card p-2 text-muted-foreground">
              {ep.body}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
