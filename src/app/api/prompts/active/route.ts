import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const prompt = await prisma.systemPrompt.findFirst({
    where: { isActive: true },
  });

  if (!prompt) {
    return NextResponse.json({ error: "No active prompt found" }, { status: 404 });
  }

  return NextResponse.json(prompt);
}
