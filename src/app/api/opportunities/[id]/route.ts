import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { updateOpportunitySchema } from "@/lib/validators/opportunity";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      stageLogs: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...opportunity,
    stageLogs: opportunity.stageLogs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();
  const parsed = updateOpportunitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.opportunity.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) {
    data.status = parsed.data.status;
    if (parsed.data.status === "applied") {
      data.appliedAt = new Date();
      if (!existing.stage) {
        data.stage = "Applied";
      }
    }
  }
  if (parsed.data.stage !== undefined) {
    if (existing.status !== "applied") {
      return NextResponse.json(
        { error: "Stage can only be updated for applied opportunities" },
        { status: 400 }
      );
    }
    data.stage = parsed.data.stage;
    // Rejected or Archived: create Rejection record and set status so it leaves the applications list
    if (parsed.data.stage === "Rejected" || parsed.data.stage === "Archived") {
      data.status = "rejected";
      // Will create Rejection after update (need opportunity data)
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  try {
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data,
    });

    const newStage =
      parsed.data.stage ??
      (parsed.data.status === "applied" && !existing.stage ? "Applied" : null);
    if (newStage && newStage !== existing.stage) {
      await prisma.applicationStageLog.create({
        data: {
          opportunityId: id,
          stage: newStage,
        },
      });
    }

    if (
      (parsed.data.stage === "Rejected" || parsed.data.stage === "Archived") &&
      existing.stage !== "Rejected" &&
      existing.stage !== "Archived"
    ) {
      const redFlags =
        parsed.data.stage === "Rejected"
          ? "Organization rejected our application"
          : "Application went stale - archived";
      await prisma.rejection.create({
        data: {
          jobId: existing.jobId,
          source: existing.source,
          title: existing.title,
          company: existing.company,
          url: existing.url,
          score: existing.score,
          redFlags,
        },
      });
    }

    return NextResponse.json(opportunity);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw error;
  }
}
