import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;            // ✅ await params
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tasks = await prisma.task.findMany({
    where: { projectId: id },
    orderBy: [{ startDate: "asc" }, { name: "asc" }],
    select: { id: true, wbs: true, name: true, status: true, startDate: true, dueDate: true, progressPct: true },
  });

  return NextResponse.json(tasks);
}
