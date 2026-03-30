import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { ensureApplicationWorkflowSettings } from "@/lib/applications/workflowSettings";
import { patchApplicationWorkflowSchema } from "@/lib/validators/application-workflow";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const row = await ensureApplicationWorkflowSettings();
  return NextResponse.json({
    staleIdleDays: row.staleIdleDays,
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const body = await request.json();
  const parsed = patchApplicationWorkflowSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const row = await prisma.applicationWorkflowSettings.upsert({
    where: { id: "default" },
    create: { id: "default", staleIdleDays: parsed.data.staleIdleDays },
    update: { staleIdleDays: parsed.data.staleIdleDays },
  });

  return NextResponse.json({ staleIdleDays: row.staleIdleDays });
}
