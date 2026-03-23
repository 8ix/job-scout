import { prisma } from "@/lib/prisma";
import { IngestBlocklistManager } from "@/components/ingest-blocklist/IngestBlocklistManager";

export const dynamic = "force-dynamic";

export default async function IngestBlocklistPage() {
  const rules = await prisma.ingestBlockRule.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = rules.map((r) => ({
    id: r.id,
    pattern: r.pattern,
    scope: r.scope,
    note: r.note,
    enabled: r.enabled,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Ingest blocklist</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground leading-relaxed">
          Block noisy recruiters or repeated listings before they consume screening credits. Rules apply
          globally (all feeds). The API still accepts{" "}
          <code className="text-xs text-card-foreground">POST /api/opportunities</code>, but matching
          payloads receive <code className="text-xs text-card-foreground">422</code> and are not stored.
          Use <code className="text-xs text-card-foreground">GET /api/ingest-blocklist</code> in n8n to
          filter earlier in your workflow if you prefer.
        </p>
      </div>
      <IngestBlocklistManager rules={serialized} />
    </div>
  );
}
