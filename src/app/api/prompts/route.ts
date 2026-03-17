import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { createPromptSchema } from "@/lib/validators/prompt";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const prompts = await prisma.systemPrompt.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(prompts);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const body = await request.json();
  const parsed = createPromptSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const prompt = await prisma.systemPrompt.create({
    data: {
      ...parsed.data,
      isActive: false,
    },
  });

  return NextResponse.json(prompt, { status: 201 });
}
