import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function fillTemplate(body: string, ctx: Record<string, string>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, k) => ctx[k] ?? "");
}

export async function POST(req: Request, { params }: { params: { taskId: string } }) {
  const { templateId, title, date, attendees, context } = await req.json();
  if (!templateId || !title || !date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const tpl = await prisma.moMTemplate.findUnique({ where: { id: templateId } });
  if (!tpl) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const task = await prisma.task.findUnique({ where: { id: params.taskId }, include: { project: true } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const ctx = {
    project: task.project.name,
    task: task.name,
    wbs: task.wbs ?? "",
    date,
    ...(context || {}),
  };

  const minutesMd = fillTemplate(tpl.body, ctx);

  const mom = await prisma.meeting.create({
    data: {
      taskId: params.taskId,
      ownerId: context?.ownerId ?? "", // TODO: replace with auth user id
      title,
      date: new Date(date),
      attendees: attendees || [],
      minutesMd,
    },
  });

  return NextResponse.json(mom);
}
