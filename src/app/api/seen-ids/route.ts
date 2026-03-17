import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth/api-key";
import { sourceEnum } from "@/lib/validators/source";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!validateApiKey(request.headers)) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const sourceParam = searchParams.get("source");
  const parsed = sourceEnum.safeParse(sourceParam);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid or missing source. Must be one of: Adzuna, Reed, JSearch, ATS, RSS" },
      { status: 400 }
    );
  }

  const source = parsed.data;

  const [opps, rejs] = await Promise.all([
    prisma.opportunity.findMany({ where: { source }, select: { jobId: true } }),
    prisma.rejection.findMany({ where: { source }, select: { jobId: true } }),
  ]);

  const ids = [...new Set([
    ...opps.map((o) => o.jobId),
    ...rejs.map((r) => r.jobId),
  ])];

  return NextResponse.json({ source, ids });
}
