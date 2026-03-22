import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OpportunityEditForm } from "@/components/opportunities/OpportunityEditForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOpportunityPage({ params }: PageProps) {
  const { id } = await params;
  const opp = await prisma.opportunity.findUnique({ where: { id } });
  if (!opp) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/opportunities"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Opportunities
        </Link>
      </div>
      <h2 className="text-2xl font-bold text-foreground">Edit opportunity</h2>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Add or update the full job specification, recruiter contact, and applied via. Other fields
        can be adjusted as needed.
      </p>
      <OpportunityEditForm
        opportunityId={opp.id}
        initial={{
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
