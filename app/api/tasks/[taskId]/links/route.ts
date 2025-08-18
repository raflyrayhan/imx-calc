import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { taskId: string } }) {
  const links = await prisma.documentLink.findMany({
    where: { taskId: params.taskId },
    include: { document: { select: { id: true, code: true, title: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(links);
}
