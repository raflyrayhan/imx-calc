// app/api/ebooks/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const EBOOKS_BUCKET = process.env.NEXT_PUBLIC_EBOOKS_BUCKET || "E-books";
const COVERS_BUCKET = process.env.NEXT_PUBLIC_EBOOK_COVERS_BUCKET || "ebook-covers";

// Enum lokal agar aman dari hot-reload
const CATEGORY_VALUES = ["EBOOK", "DATASHEET", "STANDARD_DRAWING", "CODE_STANDARD"] as const;
type CategoryValue = typeof CATEGORY_VALUES[number];

function sanitize<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

async function findByIdOrSlug(idOrSlug: string) {
  const byId = await prisma.ebook.findUnique({ where: { id: idOrSlug } });
  if (byId) return byId;
  return prisma.ebook.findUnique({ where: { slug: idOrSlug } });
}

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
        data.category = up as any; // enum di DB
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

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const idOrSlug = decodeURIComponent(params.id || "").trim();
    if (!idOrSlug) return NextResponse.json({ error: "Missing id or slug" }, { status: 400 });

    const row = await findByIdOrSlug(idOrSlug);
    if (!row) return NextResponse.json({ error: "E-book not found" }, { status: 404 });

    const supabase = getSupabaseAdmin();

    if (row.fileKey) {
      await supabase.storage.from(EBOOKS_BUCKET).remove([row.fileKey]);
    }
    if (row.coverKey) {
      await supabase.storage.from(COVERS_BUCKET).remove([row.coverKey]);
    }

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
