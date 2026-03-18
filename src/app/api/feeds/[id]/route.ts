import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { authOptions } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const { id } = await params;

  const feed = await prisma.feed.findUnique({ where: { id } });
  if (!feed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [oppCount, rejCount, hbCount] = await Promise.all([
    prisma.opportunity.count({ where: { source: feed.name } }),
    prisma.rejection.count({ where: { source: feed.name } }),
    prisma.feedHeartbeat.count({ where: { source: feed.name } }),
  ]);

  if (oppCount + rejCount + hbCount > 0) {
    return NextResponse.json(
      {
        error: "Cannot delete feed with associated data",
        counts: {
          opportunities: oppCount,
          rejections: rejCount,
          heartbeats: hbCount,
        },
      },
      { status: 409 }
    );
  }

  await prisma.feed.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
