import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { verifyDashboardPassword } from "@/lib/auth/verify-dashboard-password";
import { resetApplicationDataSchema } from "@/lib/validators/application-workflow";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const body = await request.json();
  const parsed = resetApplicationDataSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const ok = await verifyDashboardPassword(parsed.data.password);
  if (!ok) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const d = parsed.data;

  await prisma.$transaction(async (tx) => {
    if (d.deleteAllOpportunities) {
      await tx.opportunity.deleteMany();
    } else if (d.deleteApplicationHistory) {
      await tx.opportunity.deleteMany({
        where: { appliedAt: { not: null } },
      });
    }

    if (d.deleteAllRejections) {
      await tx.rejection.deleteMany();
    }
  });

  return NextResponse.json({
    ok: true,
    message: "Reset completed",
  });
}
