/**
 * Static API overview for the Feeds page — complements per-feed “API Reference” expanders.
 */
export function FeedsApiOverview() {
  return (
    <section
      className="rounded-xl border border-border bg-card p-6 space-y-4"
      data-testid="feeds-api-overview"
    >
      <div>
        <h3 className="text-sm font-semibold text-foreground">API setup for workflows</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Automation (e.g. n8n) talks to Job Scout over HTTP with your secret key. Set{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">API_KEY</code> in{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code> and send it on every
          mutating request.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2 text-sm">
        <p className="font-medium text-card-foreground">Authentication</p>
        <p className="text-muted-foreground">
          Header: <code className="text-xs text-card-foreground">X-API-Key: &lt;your API_KEY&gt;</code>
        </p>
        <p className="text-xs text-muted-foreground">
          Use the same host as the dashboard (e.g. <code className="text-card-foreground">http://localhost:3000</code>{" "}
          in development).
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-card-foreground mb-2">Typical feed workflow</p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>
            Create a feed name under <strong className="text-foreground/80">Feeds</strong> (or reuse
            an existing one). Use that exact string as <code className="text-xs">source</code> in API
            bodies.
          </li>
          <li>
            Optionally call <code className="text-xs">POST /api/seen-ids</code> with{" "}
            <code className="text-xs">source</code> + <code className="text-xs">ids</code> to skip
            duplicates before scoring.
          </li>
          <li>
            <code className="text-xs">POST /api/opportunities</code> for roles you want in the
            pipeline, or <code className="text-xs">POST /api/rejections</code> for disqualified
            listings.
          </li>
          <li>
            Optional: <code className="text-xs">GET /api/prompts/active</code> to fetch the active
            scoring prompt (no API key).
          </li>
        </ol>
      </div>

      <div>
        <p className="text-sm font-medium text-card-foreground mb-2">Per-feed request examples</p>
        <p className="text-sm text-muted-foreground">
          Expand <strong className="text-foreground/80">API Reference</strong> on any feed row for
          copy-paste JSON with the correct <code className="text-xs">source</code> value.
        </p>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          Applications, scheduled interviews, and dashboard-only routes are documented in the
          project <code className="text-xs">README.md</code> under{" "}
          <strong className="text-foreground/80">API endpoints</strong>.
        </p>
      </div>
    </section>
  );
}
