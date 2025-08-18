// app/api/ebooks/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const prisma = new PrismaClient();
const EBOOKS_BUCKET = process.env.NEXT_PUBLIC_EBOOKS_BUCKET || "ebooks";
const COVERS_BUCKET = process.env.NEXT_PUBLIC_EBOOK_COVERS_BUCKET || "ebook-covers";

// JSON-safe: BigInt -> string
function sanitize<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

// DELETE /api/ebooks/:id
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  // 1) find the record
  const row = await prisma.ebook.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 2) try to delete file(s) from storage (best-effort)
  const toRemove: string[] = [];
  if (row.fileKey) toRemove.push(row.fileKey);
  if (row.coverKey) toRemove.push(row.coverKey);

  // PDFs live in EBOOKS_BUCKET; covers in COVERS_BUCKET
  if (row.fileKey) {
    const { error } = await supabaseAdmin.storage
      .from(EBOOKS_BUCKET)
      .remove([row.fileKey]);
    if (error && error.name !== "StorageApiError") {
      // keep going even if "already gone"
      console.warn("remove pdf error:", error.message);
    }
  }
  if (row.coverKey) {
    const { error } = await supabaseAdmin.storage
      .from(COVERS_BUCKET)
      .remove([row.coverKey]);
    if (error && error.name !== "StorageApiError") {
      console.warn("remove cover error:", error.message);
    }
  }

  // 3) delete DB row
  const deleted = await prisma.ebook.delete({ where: { id } });

  // 4) return the deleted row (sanitized) or 204
  return NextResponse.json(sanitize(deleted), { status: 200 });
}
