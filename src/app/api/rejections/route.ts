import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth/api-key";
import { authOptions } from "@/lib/auth/session";
import { createRejectionSchema } from "@/lib/validators/rejection";
import { isValidSource, getValidSources } from "@/lib/validators/source";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!validateApiKey(request.headers)) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const parsed = createRejectionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!(await isValidSource(parsed.data.source))) {
    const valid = await getValidSources();
    return NextResponse.json(
      { error: `Invalid source. Must be one of: ${valid.join(", ")}` },
      { status: 400 }
    );
  }

  const rejection = await prisma.rejection.create({ data: parsed.data });
  return NextResponse.json(rejection, { status: 201 });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const source = searchParams.get("source");

  const where: Record<string, unknown> = {};
  if (source) where.source = source;

  const [data, total] = await Promise.all([
    prisma.rejection.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.rejection.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}
