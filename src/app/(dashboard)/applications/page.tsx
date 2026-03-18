import { prisma } from "@/lib/prisma";
import { ApplicationsTable } from "@/components/applications/ApplicationsTable";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const opportunities = await prisma.opportunity.findMany({
    where: { status: "applied" },
    orderBy: { appliedAt: "desc" },
  });

  if (opportunities.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Applications</h2>
        <ApplicationsTable applications={[]} />
      </div>
    );
  }

  const ids = opportunities.map((o) => o.id);
  const contacts = await prisma.applicationContact.findMany({
    where: { opportunityId: { in: ids } },
    orderBy: { createdAt: "asc" },
  });

  const contactsByOpp = contacts.reduce<Record<string, typeof contacts>>((acc, c) => {
    if (!acc[c.opportunityId]) acc[c.opportunityId] = [];
    acc[c.opportunityId].push(c);
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
    contacts: (contactsByOpp[o.id] ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      email: c.email,
      phone: c.phone,
      notes: c.notes,
      createdAt: c.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Applications</h2>
      <ApplicationsTable applications={applications} />
    </div>
  );
}
