import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { updatePromptSchema } from "@/lib/validators/prompt";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();
  const parsed = updatePromptSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.systemPrompt.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.systemPrompt !== undefined) data.systemPrompt = parsed.data.systemPrompt;
  if (parsed.data.userPromptTemplate !== undefined)
    data.userPromptTemplate = parsed.data.userPromptTemplate;
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const prompt = await prisma.systemPrompt.update({
    where: { id },
    data,
  });

  return NextResponse.json(prompt);
}
