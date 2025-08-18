import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { status, note } = await req.json();
  const prev = await prisma.document.findUnique({ where: { id: params.id } });
  if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const doc = await prisma.document.update({ where: { id: params.id }, data: { status } });
  await prisma.documentHistory.create({
    data: { documentId: doc.id, revision: doc.revision, status, note },
  });

  return NextResponse.json(doc);
}
