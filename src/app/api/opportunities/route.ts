import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth/api-key";
import { authOptions } from "@/lib/auth/session";
import { createOpportunitySchema } from "@/lib/validators/opportunity";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!validateApiKey(request.headers)) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const parsed = createOpportunitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { postedAt, ...rest } = parsed.data;

  const existing = await prisma.opportunity.findUnique({
    where: {
      source_jobId: { source: rest.source, jobId: rest.jobId },
    },
  });

  if (existing) {
    return NextResponse.json(existing, { status: 200 });
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      ...rest,
      postedAt: postedAt ? new Date(postedAt) : null,
    },
  });

  return NextResponse.json(opportunity, { status: 201 });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const status = searchParams.get("status");
  const source = searchParams.get("source");
  const scoreMin = searchParams.get("score_min");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (source) where.source = source;
  if (scoreMin) where.score = { gte: parseInt(scoreMin) };

  const [data, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.opportunity.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}
