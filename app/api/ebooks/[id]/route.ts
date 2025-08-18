import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const prisma = new PrismaClient();
const EBOOKS_BUCKET = process.env.NEXT_PUBLIC_EBOOKS_BUCKET || "ebooks";
const COVERS_BUCKET = process.env.NEXT_PUBLIC_EBOOK_COVERS_BUCKET || "ebook-covers";

function sanitize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
}
async function findByIdOrSlug(idOrSlug: string) {
  const byId = await prisma.ebook.findUnique({ where: { id: idOrSlug } });
  if (byId) return byId;
  return prisma.ebook.findUnique({ where: { slug: idOrSlug } });
}

export async function DELETE(req: Request) {
  try {
    const { pathname } = new URL(req.url);
    const idOrSlug = decodeURIComponent(pathname.replace(/\/+$/, "").split("/").pop() || "");
    if (!idOrSlug) return NextResponse.json({ error: "Missing id or slug" }, { status: 400 });

    const row = await findByIdOrSlug(idOrSlug);
    if (!row) return NextResponse.json({ error: "E-book not found" }, { status: 404 });

    const supabase = getSupabaseAdmin();

    if (row.fileKey) {
      const { error } = await supabase.storage.from(EBOOKS_BUCKET).remove([row.fileKey]);
      if (error) console.warn("PDF remove error:", error.message);
    }
    if (row.coverKey) {
      const { error } = await supabase.storage.from(COVERS_BUCKET).remove([row.coverKey]);
      if (error) console.warn("Cover remove error:", error.message);
    }

    const deleted = await prisma.ebook.delete({ where: { id: row.id } });
    return NextResponse.json(sanitize({ ok: true, deleted }), { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Delete failed" }, { status: 500 });
  }
}
