import { SearchCriteriaForm } from "@/components/search-criteria/SearchCriteriaForm";
import { ensureSearchCriteriaSettings } from "@/lib/search-criteria/db";
import { parseSearchCriteriaJson } from "@/lib/search-criteria/schema";

export default async function SearchCriteriaPage() {
  const row = await ensureSearchCriteriaSettings();
  const criteria = parseSearchCriteriaJson(row.criteria);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Search criteria</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These signals are merged into the scoring system prompt for your job feeds.
        </p>
      </div>
      <SearchCriteriaForm
        initialCriteria={criteria}
        initialUpdatedAt={row.updatedAt.toISOString()}
      />
    </div>
  );
}
