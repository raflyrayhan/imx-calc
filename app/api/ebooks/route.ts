/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { Visibility } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/* ------------------------------------------------------------------ */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
const EBOOKS_BUCKET = process.env.NEXT_PUBLIC_EBOOKS_BUCKET || "E-books";
const COVERS_BUCKET = process.env.NEXT_PUBLIC_EBOOK_COVERS_BUCKET || "ebook-covers";

const CATEGORY_VALUES = ["EBOOK", "DATASHEET", "STANDARD_DRAWING", "CODE_STANDARD"] as const;
type CategoryValue = typeof CATEGORY_VALUES[number];

/* ------------------------------------------------------------------ */
function sanitize<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

/* ------------------------------------------------------------------ */
/*  Ensure the buckets exist and set a very large limit.                */
/*  If the bucket already exists with a smaller limit you must either   */
/*  drop it via SQL:  DROP storage.buckets WHERE id='E-books';          */
/*  or change it via SQL:                                               */
/*  UPDATE storage.buckets SET file_size_limit = 1024 * 1024 * 1024;    */
/* ------------------------------------------------------------------ */
async function ensureBuckets() {
  const supabase = getSupabaseAdmin();
  const upsertBucket = async (name: string, publicBucket = false) => {
    const { data: exists } = await supabase.storage.getBucket(name);
    if (exists) return;

    await supabase.storage.createBucket(name, {
      public: publicBucket,
      fileSizeLimit: "1024gb", // <— effectively unlimited
    });
  };
  await upsertBucket(EBOOKS_BUCKET, false);
  await upsertBucket(COVERS_BUCKET, true);
}

/* ================================================================== */
/*  GET  /api/ebooks                                                  */
/* ================================================================== */
export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").toLowerCase();
    const tag = searchParams.get("tag") ?? "";
    const categoryParam = (searchParams.get("category") ?? "").toUpperCase();
    const category = CATEGORY_VALUES.includes(categoryParam as CategoryValue)
      ? (categoryParam as CategoryValue)
      : undefined;

    const items = await prisma.ebook.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { author: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
          tag ? { tags: { has: tag } } : {},
          category ? { category: category as any } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    const withUrls = await Promise.all(
      items.map(async (e) => {
        const { data: signed, error } = await supabase.storage
          .from(EBOOKS_BUCKET)
          .createSignedUrl(e.fileKey, 3600);
        const pdfUrl = !error ? signed?.signedUrl ?? null : null;
        const coverUrl = e.coverKey
          ? supabase.storage.from(COVERS_BUCKET).getPublicUrl(e.coverKey).data.publicUrl
          : null;
        return { ...e, pdfUrl, coverUrl };
      })
    );

    return NextResponse.json(sanitize(withUrls), {
      headers: { "Cache-Control": "private, max-age=30" },
    });
  } catch (err: any) {
    console.error("[GET /api/ebooks] error:", err?.message || err);
    const msg =
      err?.code === "P1001"
        ? "Database unavailable"
        : err?.message || "Unexpected error";
    const status = err?.code === "P1001" ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/* ================================================================== */
/*  POST  /api/ebooks                                                 */
/*  - Vercel body limit removed via config below.                     */
/*  - Files are streamed to Supabase, never buffered fully.           */
/* ================================================================== */
export async function POST(req: NextRequest) {
  try {
    await ensureBuckets();

    const supabase = getSupabaseAdmin();
    const form = await req.formData();

    const title = String(form.get("title") ?? "").trim();
    if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

    const author = (form.get("author") as string) || null;
    const year = Number(form.get("year") || "") || null;

    const tags = ((form.get("tags") as string) || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const rawCat = ((form.get("category") as string) || "").toUpperCase();
    const category: CategoryValue = CATEGORY_VALUES.includes(rawCat as CategoryValue)
      ? (rawCat as CategoryValue)
      : "EBOOK";

    const visibility = (form.get("visibility") as keyof typeof Visibility) || "PRIVATE";

    const pdf = form.get("pdf") as File | null;
    if (!pdf) return NextResponse.json({ error: "pdf file required" }, { status: 400 });

    const cover = form.get("cover") as File | null;

    /* ---------- create slug ---------- */
    const slugify = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const base = slugify(title);
    let finalSlug = base;
    for (let i = 2; await prisma.ebook.findUnique({ where: { slug: finalSlug } }); i++) {
      finalSlug = `${base}-${i}`;
    }

    const version = 1;
    const vdir = `v${String(version).padStart(4, "0")}`;
    const fileKey = `${finalSlug}/${vdir}/book.pdf`;
    const coverKey = cover ? `${finalSlug}.jpg` : null;

    /* ---------- upload PDF (stream) ---------- */
    const pdfStream = pdf.stream();
    const { data: pdfData, error: pdfErr } = await supabase.storage
      .from(EBOOKS_BUCKET)
      .upload(fileKey, pdfStream, {
        contentType: pdf.type || "application/pdf",
        upsert: false,
      });
    if (pdfErr) return NextResponse.json({ error: pdfErr.message }, { status: 500 });

    /* ---------- upload cover (stream) ---------- */
    if (cover && coverKey) {
      const coverStream = cover.stream();
      const { error: coverErr } = await supabase.storage
        .from(COVERS_BUCKET)
        .upload(coverKey, coverStream, {
          contentType: cover.type || "image/jpeg",
          upsert: true,
        });
      if (coverErr) return NextResponse.json({ error: coverErr.message }, { status: 500 });
    }

    /* ---------- save record ---------- */
    const created = await prisma.ebook.create({
      data: {
        slug: finalSlug,
        title,
        author: author || undefined,
        year,
        tags,
        category: category as any,
        sizeBytes: BigInt(pdf.size),
        fileKey,
        coverKey: coverKey || undefined,
        visibility: visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE",
        version,
      },
    });

    return NextResponse.json(sanitize(created), { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/ebooks] error:", err?.message || err);
    const msg =
      err?.code === "P1001"
        ? "Database unavailable"
        : err?.message || "Upload failed";
    const status = err?.code === "P1001" ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}