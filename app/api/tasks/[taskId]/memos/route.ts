import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { taskId: string } }) {
  const items = await prisma.memo.findMany({
    where: { taskId: params.taskId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request, { params }: { params: { taskId: string } }) {
  const { authorId, content } = await req.json();
  if (!authorId || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const memo = await prisma.memo.create({ data: { taskId: params.taskId, authorId, content } });
  return NextResponse.json(memo);
}
