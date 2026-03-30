import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ApplicationsPipeline } from "@/components/applications/ApplicationsPipeline";
import { ApplicationsCsvImport } from "@/components/applications/ApplicationsCsvImport";
import { ApplicationsArchiveSection } from "@/components/applications/ApplicationsArchiveSection";
import { ApplicationsArchiveStats } from "@/components/applications/ApplicationsArchiveStats";
import { getStaleIdleDays } from "@/lib/applications/workflowSettings";
import { summarizeArchivedApplications } from "@/lib/applications/archived-stats";
import { maybeAutoArchiveOnVisit } from "@/lib/applications/maybe-auto-archive-on-visit";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  await maybeAutoArchiveOnVisit();
  const [staleIdleDays, opportunities, archivedOpportunities] = await Promise.all([
    getStaleIdleDays(),
    prisma.opportunity.findMany({
      where: { status: "applied" },
      orderBy: { appliedAt: "desc" },
    }),
    prisma.opportunity.findMany({
      where: {
        status: "rejected",
        appliedAt: { not: null },
        OR: [{ stage: { in: ["Archived", "Rejected"] } }, { stage: null }],
      },
      orderBy: { appliedAt: "desc" },
      include: {
        stageLogs: { orderBy: { createdAt: "asc" } },
      },
    }),
  ]);

  const archivedSummary = summarizeArchivedApplications(
    archivedOpportunities.map((o) => ({
      applicationClosedReason: o.applicationClosedReason,
      stageLogs: o.stageLogs.map((l) => ({ stage: l.stage })),
    }))
  );

  const archivedRows = archivedOpportunities.map((o) => ({
    id: o.id,
    title: o.title,
    company: o.company,
    appliedAt: o.appliedAt?.toISOString() ?? null,
    stage: o.stage,
    applicationClosedReason: o.applicationClosedReason,
  }));

  const ids = opportunities.map((o) => o.id);
  const [contacts, scheduledEvents, stageLogs, correspondenceRows] =
    ids.length === 0
      ? [[], [], [], []]
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
          prisma.applicationCorrespondence.findMany({
            where: { opportunityId: { in: ids } },
            orderBy: { receivedAt: "asc" },
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

  const correspondenceByOpp = correspondenceRows.reduce<
    Record<
      string,
      {
        id: string;
        receivedAt: string;
        subject: string | null;
        body: string;
        createdAt: string;
      }[]
    >
  >((acc, row) => {
    if (!acc[row.opportunityId]) acc[row.opportunityId] = [];
    acc[row.opportunityId].push({
      id: row.id,
      receivedAt: row.receivedAt.toISOString(),
      subject: row.subject,
      body: row.body,
      createdAt: row.createdAt.toISOString(),
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
    correspondence: correspondenceByOpp[o.id] ?? [],
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
      <ApplicationsCsvImport />
      {applications.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
          <p className="text-muted-foreground">
            No active applications. Mark opportunities as applied from Opportunities, or add an
            external application. Closed applications appear below in the archive.
          </p>
          <Link
            href="/applications/new"
            className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add application
          </Link>
        </div>
      ) : (
        <ApplicationsPipeline applications={applications} staleIdleDays={staleIdleDays} />
      )}

      <ApplicationsArchiveSection archived={archivedRows} />
      <ApplicationsArchiveStats summary={archivedSummary} />
    </div>
  );
}
