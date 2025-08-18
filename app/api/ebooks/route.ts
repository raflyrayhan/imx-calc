// app/api/ebooks/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, Visibility } from "@prisma/client";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const prisma = new PrismaClient();

// Match your actual bucket names via env
const EBOOKS_BUCKET = process.env.NEXT_PUBLIC_EBOOKS_BUCKET || "ebooks";
const COVERS_BUCKET = process.env.NEXT_PUBLIC_EBOOK_COVERS_BUCKET || "ebook-covers";

/* ---------------- helpers ---------------- */

// JSON-safe: convert BigInt to string
function sanitize<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let attempt = base;
  let i = 2;
  while (true) {
    const exists = await prisma.ebook.findUnique({ where: { slug: attempt } });
    if (!exists) return attempt;
    attempt = `${base}-${i++}`;
  }
}

async function ensureBuckets() {
  const { data, error } = await supabaseAdmin.storage.listBuckets();
  if (error) {
    console.warn("listBuckets error:", error.message);
    return;
  }
  const names = new Set((data ?? []).map((b) => b.name));
  if (!names.has(EBOOKS_BUCKET)) {
    await supabaseAdmin.storage.createBucket(EBOOKS_BUCKET, { public: false });
  }
  if (!names.has(COVERS_BUCKET)) {
    await supabaseAdmin.storage.createBucket(COVERS_BUCKET, { public: true });
  }
}

/* ---------------- GET: list (always SIGN PDFs) ---------------- */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const tag = searchParams.get("tag") ?? "";

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
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const withUrls = await Promise.all(
    items.map(async (e) => {
      // 🔒 Always sign PDFs so they work with private buckets too
      let pdfUrl: string | null = null;
      const { data: signed, error: signErr } = await supabaseAdmin.storage
        .from(EBOOKS_BUCKET)
        .createSignedUrl(e.fileKey, 3600); // 1 hour
      if (!signErr) pdfUrl = signed.signedUrl;

      // Covers remain public (fast)
      const coverUrl = e.coverKey
        ? supabaseAdmin.storage.from(COVERS_BUCKET).getPublicUrl(e.coverKey).data.publicUrl
        : null;

      return { ...e, pdfUrl, coverUrl };
    })
  );

  return NextResponse.json(sanitize(withUrls), {
    headers: { "Cache-Control": "private, max-age=30" },
  });
}

/* ---------------- POST: upload & create ---------------- */
export async function POST(req: Request) {
  await ensureBuckets();

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

  const baseSlug = slugify(title);
  const finalSlug = await uniqueSlug(baseSlug);

  const version = 1;
  const vdir = `v${String(version).padStart(4, "0")}`;

  // Keys are paths INSIDE the bucket (no bucket name in the key)
  const fileKey = `${finalSlug}/${vdir}/book.pdf`;
  const coverKey = cover ? `${finalSlug}.jpg` : null;

  // Upload PDF
  const pdfBuf = Buffer.from(await pdf.arrayBuffer());
  const up1 = await supabaseAdmin.storage
    .from(EBOOKS_BUCKET)
    .upload(fileKey, pdfBuf, { contentType: pdf.type || "application/pdf", upsert: false });
  if (up1.error) return NextResponse.json({ error: up1.error.message }, { status: 500 });

  // Upload cover (optional)
  if (cover && coverKey) {
    const coverBuf = Buffer.from(await cover.arrayBuffer());
    const up2 = await supabaseAdmin.storage
      .from(COVERS_BUCKET)
      .upload(coverKey, coverBuf, { contentType: cover.type || "image/jpeg", upsert: true });
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
