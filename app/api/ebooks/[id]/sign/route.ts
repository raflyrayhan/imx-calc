import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const prisma = new PrismaClient();
const EBOOKS_BUCKET = process.env.NEXT_PUBLIC_EBOOKS_BUCKET || "ebooks";

// Find by cuid `id` first; if not found, by unique `slug`
async function findByIdOrSlug(idOrSlug: string) {
  const byId = await prisma.ebook.findUnique({ where: { id: idOrSlug } });
  if (byId) return byId;
  const bySlug = await prisma.ebook.findUnique({ where: { slug: idOrSlug } });
  return bySlug;
}

export async function GET(req: Request) {
  try {
    // Grab last path segment as id/slug
    const url = new URL(req.url);
    const segs = url.pathname.replace(/\/+$/, "").split("/");
    const idOrSlug = decodeURIComponent(segs[segs.length - 2] === "sign"
      ? segs[segs.length - 3] // handle .../[id]/sign
      : segs[segs.length - 1]).trim();

    if (!idOrSlug) {
      return NextResponse.json({ error: "Missing id or slug" }, { status: 400 });
    }

    // Optional: ?expires=seconds (default 3600s, clamp to 30–604800)
    const q = url.searchParams;
    const expRaw = Number(q.get("expires") || 3600);
    const expiresIn = Math.max(30, Math.min(604800, isFinite(expRaw) ? expRaw : 3600));

    const row = await findByIdOrSlug(idOrSlug);
    if (!row) return NextResponse.json({ error: "E-book not found" }, { status: 404 });
    if (!row.fileKey) return NextResponse.json({ error: "File key missing" }, { status: 422 });

    const { data, error } = await supabaseAdmin.storage
      .from(EBOOKS_BUCKET)
      .createSignedUrl(row.fileKey, expiresIn);

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message || "Failed to sign URL" }, { status: 500 });
    }

    return NextResponse.json({ url: data.signedUrl, expiresIn });
  } catch (err: any) {
    console.error("GET /api/ebooks/[id]/sign error:", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
