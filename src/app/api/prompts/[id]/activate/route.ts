import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const { id } = await params;

  try {
    const prompt = await prisma.$transaction(async (tx) => {
      await tx.systemPrompt.updateMany({
        data: { isActive: false },
      });
      return tx.systemPrompt.update({
        where: { id },
        data: { isActive: true },
      });
    });
    return NextResponse.json(prompt);
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
