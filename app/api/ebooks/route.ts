import { NextResponse } from "next/server";
import { PrismaClient, Visibility } from "@prisma/client";
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

async function ensureBuckets() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.listBuckets();
  if (error) { console.warn("listBuckets error:", error.message); return; }
  const names = new Set((data ?? []).map(b => b.name));
  if (!names.has(EBOOKS_BUCKET)) await supabase.storage.createBucket(EBOOKS_BUCKET, { public: false });
  if (!names.has(COVERS_BUCKET)) await supabase.storage.createBucket(COVERS_BUCKET, { public: true });
}

export async function GET(req: Request) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const tag = searchParams.get("tag") ?? "";

  const items = await prisma.ebook.findMany({
    where: {
      AND: [
        q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { author: { contains: q, mode: "insensitive" } }] } : {},
        tag ? { tags: { has: tag } } : {},
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
        ? getSupabaseAdmin().storage.from(COVERS_BUCKET).getPublicUrl(e.coverKey).data.publicUrl
        : null;
      return { ...e, pdfUrl, coverUrl };
    })
  );

  return NextResponse.json(sanitize(withUrls), { headers: { "Cache-Control": "private, max-age=30" } });
}

export async function POST(req: Request) {
  await ensureBuckets();

  const supabase = getSupabaseAdmin();
  const form = await req.formData();

  const title = String(form.get("title") ?? "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const author = (form.get("author") as string) || null;
  const yearStr = (form.get("year") as string) || "";
  const year = yearStr ? Number(yearStr) : null;
  const tags = ((form.get("tags") as string) || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const visibility = (form.get("visibility") as keyof typeof Visibility) || "PRIVATE";

  const pdf = form.get("pdf") as File | null;
  if (!pdf) return NextResponse.json({ error: "pdf file required" }, { status: 400 });
  const cover = form.get("cover") as File | null;

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const base = slugify(title);
  let finalSlug = base;
  for (let i = 2; await prisma.ebook.findUnique({ where: { slug: finalSlug } }); i++) finalSlug = `${base}-${i}`;

  const version = 1;
  const vdir = `v${String(version).padStart(4, "0")}`;
  const fileKey = `${finalSlug}/${vdir}/book.pdf`;
  const coverKey = cover ? `${finalSlug}.jpg` : null;

  const pdfBuf = Buffer.from(await pdf.arrayBuffer());
  const up1 = await supabase.storage.from(EBOOKS_BUCKET).upload(fileKey, pdfBuf, {
    contentType: pdf.type || "application/pdf",
    upsert: false,
  });
  if (up1.error) return NextResponse.json({ error: up1.error.message }, { status: 500 });

  if (cover && coverKey) {
    const coverBuf = Buffer.from(await cover.arrayBuffer());
    const up2 = await supabase.storage.from(COVERS_BUCKET).upload(coverKey, coverBuf, {
      contentType: cover.type || "image/jpeg",
      upsert: true,
    });
    if (up2.error) console.warn("cover upload failed:", up2.error.message);
  }

  const created = await prisma.ebook.create({
    data: {
      slug: finalSlug,
      title,
      author: author || undefined,
      year: year || undefined,
      tags,
      sizeBytes: BigInt(pdf.size),
      fileKey,
      coverKey: coverKey || undefined,
      visibility: visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE",
      version,
    },
  });

  return NextResponse.json(sanitize(created), { status: 201 });
}
