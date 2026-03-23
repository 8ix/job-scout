import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { patchApplicationGoalsSchema } from "@/lib/validators/application-goals";
import {
  ensureApplicationGoalSettings,
  getApplicationGoalsDashboardData,
} from "@/lib/goals/application-goal-progress";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const data = await getApplicationGoalsDashboardData(prisma);
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchApplicationGoalsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await ensureApplicationGoalSettings(prisma);

  const data = parsed.data;
  await prisma.applicationGoalSettings.update({
    where: { id: "default" },
    data: {
      ...(data.timezone !== undefined && { timezone: data.timezone }),
      ...(data.weekStartsOn !== undefined && { weekStartsOn: data.weekStartsOn }),
      ...(data.weeklyTargetCount !== undefined && { weeklyTargetCount: data.weeklyTargetCount }),
      ...(data.monthlyTargetCount !== undefined && { monthlyTargetCount: data.monthlyTargetCount }),
    },
  });

  const payload = await getApplicationGoalsDashboardData(prisma);
  return NextResponse.json(payload);
}
