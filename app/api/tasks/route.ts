import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { projectId, wbs, name, startDate, dueDate } = await req.json();
  if (!projectId || !name) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const t = await prisma.task.create({
    data: {
      projectId, wbs, name,
      startDate: startDate ? new Date(startDate) : null,
      dueDate:   dueDate   ? new Date(dueDate)   : null,
    },
  });
  return NextResponse.json(t);
}

export async function PUT(req: Request) {
  const { id, status, progressPct, name, startDate, dueDate } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const t = await prisma.task.update({
    where: { id },
    data: {
      status, progressPct, name,
      startDate: startDate ? new Date(startDate) : null,
      dueDate:   dueDate   ? new Date(dueDate)   : null,
    },
  });
  return NextResponse.json(t);
}
