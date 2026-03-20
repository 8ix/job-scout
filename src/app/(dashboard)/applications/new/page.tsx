import Link from "next/link";
import { ManualApplicationForm } from "@/components/applications/ManualApplicationForm";

export default function NewApplicationPage() {
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
      <h2 className="text-2xl font-bold text-foreground">Add application</h2>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Add an application you found outside Job Scout. Score and details are yours to set; AI verdict
        and match fields are not used for manual entries.
      </p>
      <ManualApplicationForm mode="create" />
    </div>
  );
}
