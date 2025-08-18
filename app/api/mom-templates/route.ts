import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.moMTemplate.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, body: true },
  });
  return NextResponse.json(items);
}
