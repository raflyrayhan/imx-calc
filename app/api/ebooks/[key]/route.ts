// app/api/ebooks/[key]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDrive } from "@/lib/googleDrive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key: rawKey } = await params; // await params
    const key = decodeURIComponent(rawKey);
    const body = await req.json().catch(() => ({} as any));
    const tagText: string = body?.tags ?? "";
    const tags = String(tagText).split(",").map(t => t.trim()).filter(Boolean);

    const row =
      (await prisma.ebook.findUnique({ where: { id: key } })) ??
      (await prisma.ebook.findUnique({ where: { slug: key } }));

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.ebook.update({
      where: { id: row.id },
      data: { tags },
      select: { id: true, tags: true }, // hindari BigInt
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update tags" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key: rawKey } = await params; // await params
    const key = decodeURIComponent(rawKey);

    const row =
      (await prisma.ebook.findUnique({ where: { id: key } })) ??
      (await prisma.ebook.findUnique({ where: { slug: key } }));

    if (!row) return new Response("Not found", { status: 404 });

    if (row.storage === "DRIVE" && row.driveFileId) {
      const drive = await getDrive();
      await drive.files.delete({ fileId: row.driveFileId });
      if (row.driveCoverId) {
        try { await drive.files.delete({ fileId: row.driveCoverId }); } catch {}
      }
    }
    // TODO: hapus dari Supabase kalau storage SUPABASE

    await prisma.ebook.delete({ where: { id: row.id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Delete failed" },
      { status: 500 }
    );
  }
}
