import type { PrismaClient } from "@/generated/prisma/client";

export async function getApplicationLifecycleMetrics(prisma: PrismaClient): Promise<{
  totalEverApplied: number;
  totalClosedApplications: number;
}> {
  const [totalEverApplied, totalClosedApplications] = await Promise.all([
    prisma.opportunity.count({ where: { appliedAt: { not: null } } }),
    prisma.opportunity.count({
      where: {
        status: "rejected",
        appliedAt: { not: null },
        OR: [{ stage: { in: ["Archived", "Rejected"] } }, { stage: null }],
      },
    }),
  ]);

  return { totalEverApplied, totalClosedApplications };
}
