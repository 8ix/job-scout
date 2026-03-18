import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth/api-key";
import { authOptions } from "@/lib/auth/session";
import { createHeartbeatSchema } from "@/lib/validators/heartbeat";
import { isValidSource, getValidSources } from "@/lib/validators/source";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!validateApiKey(request.headers)) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const parsed = createHeartbeatSchema.safeParse(body);

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

  const heartbeat = await prisma.feedHeartbeat.create({
    data: {
      ...parsed.data,
      ranAt: new Date(parsed.data.ranAt),
    },
  });

  return NextResponse.json(heartbeat, { status: 201 });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");

  const where: Record<string, unknown> = {};
  if (source) where.source = source;

  const heartbeats = await prisma.feedHeartbeat.findMany({
    where,
    orderBy: { ranAt: "desc" },
    take: 100,
  });

  return NextResponse.json(heartbeats);
}
