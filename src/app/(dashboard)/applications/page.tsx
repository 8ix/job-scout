import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ApplicationsPipeline } from "@/components/applications/ApplicationsPipeline";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const opportunities = await prisma.opportunity.findMany({
    where: { status: "applied" },
    orderBy: { appliedAt: "desc" },
  });

  const ids = opportunities.map((o) => o.id);
  const [contacts, scheduledEvents, stageLogs] =
    ids.length === 0
      ? [[], [], []]
      : await Promise.all([
          prisma.applicationContact.findMany({
            where: { opportunityId: { in: ids } },
            orderBy: { createdAt: "asc" },
          }),
          prisma.applicationScheduledEvent.findMany({
            where: { opportunityId: { in: ids } },
            orderBy: { scheduledAt: "asc" },
          }),
          prisma.applicationStageLog.findMany({
            where: { opportunityId: { in: ids } },
            orderBy: { createdAt: "asc" },
          }),
        ]);

  const contactsByOpp = contacts.reduce<Record<string, typeof contacts>>((acc, c) => {
    if (!acc[c.opportunityId]) acc[c.opportunityId] = [];
    acc[c.opportunityId].push(c);
    return acc;
  }, {});

  const eventsByOpp = scheduledEvents.reduce<
    Record<
      string,
      {
        id: string;
        kind: string;
        scheduledAt: string;
        notes: string | null;
      }[]
    >
  >((acc, e) => {
    if (!acc[e.opportunityId]) acc[e.opportunityId] = [];
    acc[e.opportunityId].push({
      id: e.id,
      kind: e.kind,
      scheduledAt: e.scheduledAt.toISOString(),
      notes: e.notes,
    });
    return acc;
  }, {});

  const logsByOpp = stageLogs.reduce<
    Record<string, { id: string; stage: string; createdAt: string }[]>
  >((acc, log) => {
    if (!acc[log.opportunityId]) acc[log.opportunityId] = [];
    acc[log.opportunityId].push({
      id: log.id,
      stage: log.stage,
      createdAt: log.createdAt.toISOString(),
    });
    return acc;
  }, {});

  const applications = opportunities.map((o) => ({
    id: o.id,
    title: o.title,
    company: o.company,
    url: o.url,
    source: o.source,
    score: o.score,
    appliedAt: o.appliedAt?.toISOString() ?? null,
    stage: o.stage,
    appliedVia: o.appliedVia,
    contacts: (contactsByOpp[o.id] ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      email: c.email,
      phone: c.phone,
      notes: c.notes,
      createdAt: c.createdAt.toISOString(),
    })),
    scheduledEvents: eventsByOpp[o.id] ?? [],
    stageLogs: logsByOpp[o.id] ?? [],
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Applications</h2>
        <Link
          href="/applications/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add application
        </Link>
      </div>
      {applications.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
          <p className="text-muted-foreground">
            No active applications. Mark opportunities as applied from Opportunities, or add an
            external application.
          </p>
          <Link
            href="/applications/new"
            className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add application
          </Link>
        </div>
      ) : (
        <ApplicationsPipeline applications={applications} />
      )}
    </div>
  );
}
