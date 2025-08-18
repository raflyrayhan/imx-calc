import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const prisma = new PrismaClient();
const EBOOKS_BUCKET = process.env.NEXT_PUBLIC_EBOOKS_BUCKET || "ebooks";
const COVERS_BUCKET = process.env.NEXT_PUBLIC_EBOOK_COVERS_BUCKET || "ebook-covers";

// BigInt -> string for JSON
function sanitize<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

// Find by cuid id first; if not found, fall back to slug (unique)
async function findByIdOrSlug(idOrSlug: string) {
  const byId = await prisma.ebook.findUnique({ where: { id: idOrSlug } });
  if (byId) return byId;
  const bySlug = await prisma.ebook.findUnique({ where: { slug: idOrSlug } });
  return bySlug;
}

export async function DELETE(req: Request) {
  try {
    // Extract the last path segment as the id/slug
    const { pathname } = new URL(req.url);
    const segs = pathname.replace(/\/+$/, "").split("/");
    const idOrSlug = decodeURIComponent(segs[segs.length - 1] || "").trim();

    if (!idOrSlug) {
      return NextResponse.json({ error: "Missing id or slug" }, { status: 400 });
    }

    const row = await findByIdOrSlug(idOrSlug);
    if (!row) {
      return NextResponse.json({ error: "E-book not found" }, { status: 404 });
    }

    // Best-effort: remove PDF in EBOOKS_BUCKET
    if (row.fileKey) {
      const { error } = await supabaseAdmin.storage
        .from(EBOOKS_BUCKET)
        .remove([row.fileKey]);
      if (error) console.warn("PDF remove error:", error.message);
    }

    // Best-effort: remove cover in COVERS_BUCKET
    if (row.coverKey) {
      const { error } = await supabaseAdmin.storage
        .from(COVERS_BUCKET)
        .remove([row.coverKey]);
      if (error) console.warn("Cover remove error:", error.message);
    }

    // Delete DB row
    const deleted = await prisma.ebook.delete({ where: { id: row.id } });

    return NextResponse.json(sanitize({ ok: true, deleted }), { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/ebooks/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Delete failed" },
      { status: 500 }
    );
  }
}
