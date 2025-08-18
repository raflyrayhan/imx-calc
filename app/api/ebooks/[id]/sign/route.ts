import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";                 // ✅
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ❌ REMOVE: import { PrismaClient } from "@prisma/client";
// ❌ REMOVE: const prisma = new PrismaClient();

const EBOOKS_BUCKET = process.env.NEXT_PUBLIC_EBOOKS_BUCKET || "ebooks";

async function findByIdOrSlug(idOrSlug: string) {
  const byId = await prisma.ebook.findUnique({ where: { id: idOrSlug } });
  if (byId) return byId;
  return prisma.ebook.findUnique({ where: { slug: idOrSlug } });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const segs = url.pathname.replace(/\/+$/, "").split("/");
    // …/api/ebooks/[id]/sign -> [id] is the penultimate segment
    const idOrSlug = decodeURIComponent(segs[segs.length - 2] || "").trim();
    if (!idOrSlug) return NextResponse.json({ error: "Missing id or slug" }, { status: 400 });

    const row = await findByIdOrSlug(idOrSlug);
    if (!row) return NextResponse.json({ error: "E-book not found" }, { status: 404 });
    if (!row.fileKey) return NextResponse.json({ error: "File key missing" }, { status: 422 });

    const expRaw = Number(url.searchParams.get("expires") || 3600);
    const expiresIn = Math.max(30, Math.min(604800, isFinite(expRaw) ? expRaw : 3600));

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(EBOOKS_BUCKET)
      .createSignedUrl(row.fileKey, expiresIn);

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message || "Failed to sign URL" }, { status: 500 });
    }

    return NextResponse.json({ url: data.signedUrl, expiresIn });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
