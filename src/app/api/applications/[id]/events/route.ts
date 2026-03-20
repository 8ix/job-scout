import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { isSessionOrApiKeyAuthorized } from "@/lib/auth/session-or-api-key";
import { createScheduledEventSchema } from "@/lib/validators/application-manual";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isSessionOrApiKeyAuthorized(request.headers))) {
    return unauthorizedResponse();
  }

  const { id: opportunityId } = await params;
  const opp = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createScheduledEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const event = await prisma.applicationScheduledEvent.create({
    data: {
      opportunityId,
      kind: parsed.data.kind,
      scheduledAt: new Date(parsed.data.scheduledAt),
      notes: parsed.data.notes ?? null,
    },
  });

  return NextResponse.json(
    {
      ...event,
      scheduledAt: event.scheduledAt.toISOString(),
      createdAt: event.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
