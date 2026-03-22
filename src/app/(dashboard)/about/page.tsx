import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About this project · Job Scout",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">About this project</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Quick orientation if you&apos;ve just deployed or cloned Job Scout.
        </p>
      </div>

      <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <h3 className="text-base font-semibold text-foreground">Purpose</h3>
        <p>
          Job Scout is a self-hosted <strong className="text-foreground/80">API and dashboard</strong>{" "}
          for a serious job search: it stores and organises the leads <em>you</em> qualify. It is
          deliberately <strong className="text-foreground/80">not</strong> a full job-hunting
          product—there are no built-in scrapers, board-specific rules, or scoring models inside the
          app.
        </p>
      </section>

      <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <h3 className="text-base font-semibold text-foreground">Philosophy</h3>
        <p>
          Job Scout is <strong className="text-foreground/80">intentionally logic-agnostic</strong>.
          It has no opinion about how jobs should be scored or filtered—that is entirely up to you.
        </p>
        <p>
          Screening and enrichment logic live in <strong className="text-foreground/80">your</strong>{" "}
          workflows (n8n or any orchestration tool you prefer). Job Scout&apos;s role is to{" "}
          <strong className="text-foreground/80">receive, store, and present</strong> the results.
          That keeps the codebase small and composable: different feeds can use different strategies
          without pushing that complexity into the application.
        </p>
        <p>
          Think of it as a <strong className="text-foreground/80">headless, composable</strong>{" "}
          pattern—Job Scout is the data and presentation layer; you bring the intelligence.
        </p>
      </section>

      <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <h3 className="text-base font-semibold text-foreground">Connecting automation</h3>
        <p>
          Configure feeds here, then call the HTTP API with your{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">API_KEY</code>. Start on the{" "}
          <Link href="/feeds" className="font-medium text-primary hover:underline">
            Feeds
          </Link>{" "}
          page for setup steps, authentication, and per-feed request examples.
        </p>
      </section>

      <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <h3 className="text-base font-semibold text-foreground">More detail</h3>
        <p>
          The repository <code className="text-xs">README.md</code> covers Docker, environment
          variables, and the full API surface (applications, events, dashboard routes).
        </p>
      </section>
    </div>
  );
}
