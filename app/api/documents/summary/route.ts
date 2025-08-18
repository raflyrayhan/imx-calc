import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const projectId = new URL(req.url).searchParams.get("projectId");
  if (!projectId) return NextResponse.json([], { status: 200 });

  const groups = await prisma.document.groupBy({
    by: ["status"],
    where: { projectId },
    _count: { _all: true },
  });

  return NextResponse.json(groups.map(g => ({ status: g.status, count: g._count._all })));
}
