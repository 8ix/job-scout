import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { authOptions } from "@/lib/auth/session";
import { patchIngestBlockRuleSchema } from "@/lib/validators/ingest-blocklist";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const { id } = await params;

  const existing = await prisma.ingestBlockRule.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchIngestBlockRuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const rule = await prisma.ingestBlockRule.update({
    where: { id },
    data: {
      ...(data.pattern !== undefined ? { pattern: data.pattern } : {}),
      ...(data.scope !== undefined ? { scope: data.scope } : {}),
      ...(data.note !== undefined ? { note: data.note } : {}),
      ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
    },
  });

  return NextResponse.json(rule);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const { id } = await params;

  const existing = await prisma.ingestBlockRule.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.ingestBlockRule.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
