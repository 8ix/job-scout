import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ManualApplicationForm } from "@/components/applications/ManualApplicationForm";
import { closedReasonLabel } from "@/lib/applications/application-closed-reason";
import { RestoreApplicationButton } from "@/components/applications/RestoreApplicationButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditApplicationPage({ params }: PageProps) {
  const { id } = await params;
  const opp = await prisma.opportunity.findUnique({ where: { id } });
  if (!opp || !opp.appliedAt) {
    notFound();
  }

  const isArchivedApplication =
    opp.status === "rejected" &&
    (opp.stage === "Archived" || opp.stage === "Rejected" || opp.stage === null);

  if (isArchivedApplication) {
    return (
      <div className="space-y-6 max-w-xl">
        <div className="flex items-center gap-4">
          <Link
            href="/applications"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Applications
          </Link>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Closed application</h2>
        <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
          <p className="font-semibold text-card-foreground">{opp.company}</p>
          <p className="text-muted-foreground">{opp.title}</p>
          <p className="text-muted-foreground">
            Applied: {opp.appliedAt.toLocaleDateString()} · Stage: {opp.stage ?? "—"}
          </p>
          <p className="text-muted-foreground">
            Outcome: {closedReasonLabel(opp.applicationClosedReason)}
          </p>
          {opp.url ? (
            <a
              href={opp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm font-medium hover:underline inline-block pt-2"
            >
              Original listing
            </a>
          ) : null}
        </div>
        <RestoreApplicationButton opportunityId={opp.id} />
      </div>
    );
  }

  if (opp.status !== "applied") {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/applications"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Applications
        </Link>
      </div>
      <h2 className="text-2xl font-bold text-foreground">Edit application</h2>
      <ManualApplicationForm
        mode="edit"
        opportunityId={opp.id}
        initialValues={{
          title: opp.title,
          company: opp.company,
          url: opp.url ?? "",
          score: opp.score,
          location: opp.location ?? "",
          workingModel: opp.workingModel ?? "",
          listingType: opp.listingType ?? "",
          salaryMin: opp.salaryMin != null ? String(opp.salaryMin) : "",
          salaryMax: opp.salaryMax != null ? String(opp.salaryMax) : "",
          description: opp.description ?? "",
          appliedVia: opp.appliedVia ?? "",
          recruiterContact: opp.recruiterContact ?? "",
          fullJobSpecification: opp.fullJobSpecification ?? "",
        }}
      />
    </div>
  );
}
