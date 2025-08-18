import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { taskId: string } }) {
  const t = await prisma.task.findUnique({
    where: { id: params.taskId },
    include: { project: { select: { id: true, name: true, code: true } } },
  });
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(t);
}
