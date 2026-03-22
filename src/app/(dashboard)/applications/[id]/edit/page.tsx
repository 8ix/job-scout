import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ManualApplicationForm } from "@/components/applications/ManualApplicationForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditApplicationPage({ params }: PageProps) {
  const { id } = await params;
  const opp = await prisma.opportunity.findUnique({ where: { id } });
  if (!opp || opp.status !== "applied") {
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
