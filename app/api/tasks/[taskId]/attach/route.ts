import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { taskId: string } }) {
  const { documentId, note } = await req.json();
  if (!documentId) return NextResponse.json({ error: "Missing documentId" }, { status: 400 });

  const link = await prisma.documentLink.create({
    data: { taskId: params.taskId, documentId, note },
  });
  return NextResponse.json(link);
}
