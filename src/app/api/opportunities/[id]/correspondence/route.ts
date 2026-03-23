import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { createApplicationCorrespondenceSchema } from "@/lib/validators/application-correspondence";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const { id } = await params;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await prisma.applicationCorrespondence.findMany({
    where: { opportunityId: id },
    orderBy: { receivedAt: "asc" },
  });

  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      receivedAt: r.receivedAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }))
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const { id } = await params;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createApplicationCorrespondenceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const row = await prisma.applicationCorrespondence.create({
    data: {
      opportunityId: id,
      receivedAt: new Date(parsed.data.receivedAt),
      body: parsed.data.body,
      subject: parsed.data.subject ?? null,
    },
  });

  return NextResponse.json(
    {
      ...row,
      receivedAt: row.receivedAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
    },
    { status: 201 }
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const correspondenceId = searchParams.get("id");

  if (!correspondenceId) {
    return NextResponse.json(
      { error: "Correspondence id query parameter required" },
      { status: 400 }
    );
  }

  const row = await prisma.applicationCorrespondence.findFirst({
    where: { id: correspondenceId, opportunityId: id },
  });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.applicationCorrespondence.delete({
    where: { id: correspondenceId },
  });

  return new Response(null, { status: 204 });
}
