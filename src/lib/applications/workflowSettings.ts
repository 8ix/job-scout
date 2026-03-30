import { prisma } from "@/lib/prisma";
import { DEFAULT_STALE_IDLE_DAYS } from "@/lib/constants/applications-ui";

const DEFAULT_ID = "default";

export async function ensureApplicationWorkflowSettings() {
  const existing = await prisma.applicationWorkflowSettings.findUnique({
    where: { id: DEFAULT_ID },
  });
  if (existing) return existing;
  return prisma.applicationWorkflowSettings.create({
    data: { id: DEFAULT_ID, staleIdleDays: DEFAULT_STALE_IDLE_DAYS },
  });
}

export async function getStaleIdleDays(): Promise<number> {
  const row = await ensureApplicationWorkflowSettings();
  return row.staleIdleDays;
}
