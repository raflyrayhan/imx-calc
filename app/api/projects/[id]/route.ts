import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;            // ✅ await params
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const p = await prisma.project.findUnique({
    where: { id },
    select: { id: true, code: true, name: true, status: true, startDate: true, endDate: true },
  });

  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(p);
}
