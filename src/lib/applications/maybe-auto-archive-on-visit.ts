import { prisma } from "@/lib/prisma";
import { AUTO_ARCHIVE_PAGE_LOAD_MIN_INTERVAL_MS } from "@/lib/constants/applications-ui";
import { ensureApplicationWorkflowSettings } from "@/lib/applications/workflowSettings";
import { runAutoArchiveStaleApplications } from "@/lib/applications/auto-archive-stale";

const DEFAULT_ID = "default";

/**
 * Runs stale auto-archive when the user opens Dashboard or Applications,
 * at most once per {@link AUTO_ARCHIVE_PAGE_LOAD_MIN_INTERVAL_MS}.
 * No env or external cron required for typical use.
 */
export async function maybeAutoArchiveOnVisit(now: Date = new Date()): Promise<{
  archived: number;
  ran: boolean;
}> {
  const row = await ensureApplicationWorkflowSettings();
  const cutoff = now.getTime() - AUTO_ARCHIVE_PAGE_LOAD_MIN_INTERVAL_MS;
  if (row.lastAutoArchiveAt && row.lastAutoArchiveAt.getTime() > cutoff) {
    return { archived: 0, ran: false };
  }

  const { archived } = await runAutoArchiveStaleApplications(prisma, row.staleIdleDays, now);
  await prisma.applicationWorkflowSettings.update({
    where: { id: DEFAULT_ID },
    data: { lastAutoArchiveAt: now },
  });

  return { archived, ran: true };
}
