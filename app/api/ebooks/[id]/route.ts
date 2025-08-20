import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";  // Ensure your Prisma client is correctly imported
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Constants for the Supabase storage buckets
const EBOOKS_BUCKET = process.env.NEXT_PUBLIC_EBOOKS_BUCKET || "E-books";
const COVERS_BUCKET = process.env.NEXT_PUBLIC_EBOOK_COVERS_BUCKET || "ebook-covers";

// Enum for category validation
const CATEGORY_VALUES = ["EBOOK", "DATASHEET", "STANDARD_DRAWING", "CODE_STANDARD"] as const;
type CategoryValue = typeof CATEGORY_VALUES[number];

// Helper function to sanitize data before returning it
function sanitize<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

// Helper function to find an ebook by ID or slug
async function findByIdOrSlug(idOrSlug: string) {
  const byId = await prisma.ebook.findUnique({ where: { id: idOrSlug } });
  if (byId) return byId;
  return prisma.ebook.findUnique({ where: { slug: idOrSlug } });
}

// PATCH handler to update ebook data
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const idOrSlug = decodeURIComponent(params.id || "").trim();
    if (!idOrSlug) return NextResponse.json({ error: "Missing id or slug" }, { status: 400 });

    const row = await findByIdOrSlug(idOrSlug);
    if (!row) return NextResponse.json({ error: "E-book not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const tagsRaw: unknown = body.tags;
    const categoryRaw: unknown = body.category;

    const data: Record<string, any> = {};

    if (Array.isArray(tagsRaw)) {
      const tags = tagsRaw.map((t) => String(t).trim()).filter(Boolean);
      data.tags = tags;
    } else if (typeof tagsRaw === "string") {
      data.tags = tagsRaw
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    if (typeof categoryRaw === "string") {
      const up = categoryRaw.toUpperCase();
      if (CATEGORY_VALUES.includes(up as CategoryValue)) {
        data.category = up as any; // enum in DB
      }
    }

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: "No updatable fields" }, { status: 400 });
    }

    const updated = await prisma.ebook.update({
      where: { id: row.id },
      data,
    });

    return NextResponse.json(sanitize(updated));
  } catch (err: any) {
    console.error("[PATCH /api/ebooks/[id]] error:", err?.message || err);
    const msg =
      err?.code === "P1001"
        ? "Database unavailable"
        : err?.message || "Update failed";
    const status = err?.code === "P1001" ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

// DELETE handler to remove ebook data
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const idOrSlug = decodeURIComponent(params.id || "").trim();
    if (!idOrSlug) return NextResponse.json({ error: "Missing id or slug" }, { status: 400 });

    const row = await findByIdOrSlug(idOrSlug);
    if (!row) return NextResponse.json({ error: "E-book not found" }, { status: 404 });

    const supabase = getSupabaseAdmin();

    // Remove files from Supabase Storage if they exist
    if (row.fileKey) {
      await supabase.storage.from(EBOOKS_BUCKET).remove([row.fileKey]);
    }
    if (row.coverKey) {
      await supabase.storage.from(COVERS_BUCKET).remove([row.coverKey]);
    }

    // Delete ebook from database
    const deleted = await prisma.ebook.delete({ where: { id: row.id } });

    return NextResponse.json(sanitize({ ok: true, deleted }), { status: 200 });
  } catch (err: any) {
    console.error("[DELETE /api/ebooks/[id]] error:", err?.message || err);
    const msg =
      err?.code === "P1001"
        ? "Database unavailable"
        : err?.message || "Delete failed";
    const status = err?.code === "P1001" ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
