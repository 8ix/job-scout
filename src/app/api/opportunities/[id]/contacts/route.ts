import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { createContactSchema } from "@/lib/validators/contact";

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
    select: { id: true },
  });
  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contacts = await prisma.applicationContact.findMany({
    where: { opportunityId: id },
    orderBy: { createdAt: "asc" },
  });

  const serialized = contacts.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return NextResponse.json(serialized);
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

  const body = await request.json();
  const parsed = createContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const contact = await prisma.applicationContact.create({
    data: {
      opportunityId: id,
      ...parsed.data,
    },
  });

  return NextResponse.json(
    { ...contact, createdAt: contact.createdAt.toISOString() },
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
  const contactId = searchParams.get("id");

  if (!contactId) {
    return NextResponse.json(
      { error: "Contact id query parameter required" },
      { status: 400 }
    );
  }

  const contact = await prisma.applicationContact.findFirst({
    where: { id: contactId, opportunityId: id },
  });
  if (!contact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.applicationContact.delete({
    where: { id: contactId },
  });

  return new Response(null, { status: 204 });
}
