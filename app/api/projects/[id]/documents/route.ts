import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const docs = await prisma.document.findMany({
    where: { projectId: params.id },
    orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
    select: { id: true, code: true, title: true, revision: true, status: true },
  });
  return NextResponse.json(docs);
}
