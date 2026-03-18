import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth/api-key";
import { isValidSource, getValidSources } from "@/lib/validators/source";
import { checkSeenIdsSchema } from "@/lib/validators/seen-ids";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!validateApiKey(request.headers)) {
    return unauthorizedResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = checkSeenIdsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { source, ids } = parsed.data;

  if (!(await isValidSource(source))) {
    const valid = await getValidSources();
    return NextResponse.json(
      { error: `Invalid source. Must be one of: ${valid.join(", ")}` },
      { status: 400 }
    );
  }

  if (ids.length === 0) {
    return NextResponse.json({ source, ids: [] });
  }

  const [opps, rejs] = await Promise.all([
    prisma.opportunity.findMany({
      where: { source, jobId: { in: ids } },
      select: { jobId: true },
    }),
    prisma.rejection.findMany({
      where: { source, jobId: { in: ids } },
      select: { jobId: true },
    }),
  ]);

  const seenIds = [...new Set([
    ...opps.map((o) => o.jobId),
    ...rejs.map((r) => r.jobId),
  ])];

  return NextResponse.json({ source, ids: seenIds });
}
