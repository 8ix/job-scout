import type { Opportunity, PrismaClient } from "@/generated/prisma/client";

const TERMINAL_STAGES = new Set(["Archived", "Rejected"]);

type Result =
  | { ok: true; opportunity: Opportunity }
  | { ok: false; status: number; error: string };

export async function unarchiveApplication(
  prisma: PrismaClient,
  id: string,
  existing: Opportunity
): Promise<Result> {
  if (existing.status !== "rejected") {
    return {
      ok: false,
      status: 400,
      error: "Only archived/rejected applications can be restored",
    };
  }

  const opportunity = await (prisma.$transaction as Function)(
    async (tx: PrismaClient) => {
      const logs = await tx.applicationStageLog.findMany({
        where: { opportunityId: id },
        orderBy: { createdAt: "desc" },
      });

      const lastActiveLog = logs.find(
        (l: { stage: string }) => !TERMINAL_STAGES.has(l.stage)
      );
      const restoredStage = lastActiveLog?.stage ?? "Applied";

      const updated = await tx.opportunity.update({
        where: { id },
        data: {
          status: "applied",
          stage: restoredStage,
          applicationClosedReason: null,
        },
      });

      await tx.applicationStageLog.create({
        data: { opportunityId: id, stage: restoredStage },
      });

      await tx.rejection.deleteMany({
        where: { jobId: existing.jobId, source: existing.source },
      });

      return updated;
    }
  );

  return { ok: true, opportunity };
}
