import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { isSessionOrApiKeyAuthorized } from "@/lib/auth/session-or-api-key";
import { updateScheduledEventSchema } from "@/lib/validators/application-manual";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  {
    params,
  }: { params: Promise<{ id: string; eventId: string }> }
) {
  if (!(await isSessionOrApiKeyAuthorized(request.headers))) {
    return unauthorizedResponse();
  }

  const { id: opportunityId, eventId } = await params;

  const existing = await prisma.applicationScheduledEvent.findFirst({
    where: { id: eventId, opportunityId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateScheduledEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const data: {
    kind?: string;
    scheduledAt?: Date;
    notes?: string | null;
  } = {};
  if (parsed.data.kind !== undefined) data.kind = parsed.data.kind;
  if (parsed.data.scheduledAt !== undefined) {
    data.scheduledAt = new Date(parsed.data.scheduledAt);
  }
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;

  const event = await prisma.applicationScheduledEvent.update({
    where: { id: eventId },
    data,
  });

  return NextResponse.json({
    ...event,
    scheduledAt: event.scheduledAt.toISOString(),
    createdAt: event.createdAt.toISOString(),
  });
}

export async function DELETE(
  request: Request,
  {
    params,
  }: { params: Promise<{ id: string; eventId: string }> }
) {
  if (!(await isSessionOrApiKeyAuthorized(request.headers))) {
    return unauthorizedResponse();
  }

  const { id: opportunityId, eventId } = await params;

  const existing = await prisma.applicationScheduledEvent.findFirst({
    where: { id: eventId, opportunityId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.applicationScheduledEvent.delete({ where: { id: eventId } });
  return NextResponse.json({ ok: true });
}
