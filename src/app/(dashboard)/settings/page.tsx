import { SettingsPageClient } from "@/components/settings/SettingsPageClient";
import { ensureApplicationWorkflowSettings } from "@/lib/applications/workflowSettings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const row = await ensureApplicationWorkflowSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Workflow defaults and destructive actions. More options may be added here over time.
        </p>
      </div>
      <SettingsPageClient initialStaleIdleDays={row.staleIdleDays} />
    </div>
  );
}
