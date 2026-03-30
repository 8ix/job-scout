import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaleIdleDays } from "@/lib/applications/workflowSettings";
import { runAutoArchiveStaleApplications } from "@/lib/applications/auto-archive-stale";

const WORKFLOW_SETTINGS_ID = "default";

export const dynamic = "force-dynamic";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  return Boolean(secret && auth === `Bearer ${secret}`);
}

async function runArchive() {
  const staleIdleDays = await getStaleIdleDays();
  const { archived } = await runAutoArchiveStaleApplications(prisma, staleIdleDays);
  await prisma.applicationWorkflowSettings.update({
    where: { id: WORKFLOW_SETTINGS_ID },
    data: { lastAutoArchiveAt: new Date() },
  });
  return {
    archived,
    staleIdleDays,
    message:
      archived === 0 ? "No stale applications to archive" : `Archived ${archived} application(s)`,
  };
}

export async function POST(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runArchive());
}

/** Some schedulers only issue GET; same Bearer auth applies. */
export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runArchive());
}

