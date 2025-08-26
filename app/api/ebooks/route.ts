// app/api/ebooks/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDrive } from '@/lib/googleDrive';
import { Readable } from 'node:stream';
import type { Visibility, Category } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sanitize = <T,>(obj: T) =>
  JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))
  );

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim();
  const tag = (searchParams.get('tag') ?? '').trim();
  const category = (searchParams.get('category') ?? '').trim() as Category | '';

  const items = await prisma.ebook.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { author: { contains: q, mode: 'insensitive' } },
                { tags: { has: q } },
              ],
            }
          : {},
        tag ? { tags: { has: tag } } : {},
        category ? { category } : {},
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 300,
  });

  const mapped = items.map((e) => {
    let pdfUrl: string | null = null;
    let coverUrl: string | null = null;

    if (e.storage === 'DRIVE' && e.driveFileId) {
      const isPublic = e.visibility === 'PUBLIC';
      pdfUrl = isPublic
        ? `https://drive.google.com/uc?id=${e.driveFileId}&export=download`
        : `/api/ebooks/${e.id}/download`;

      // Cover otomatis (thumbnail halaman pertama PDF via proxy route)
      coverUrl = `/api/ebooks/${e.id}/cover`;
    } else if (e.coverKey) {
      // Fallback untuk item lama Supabase yang punya coverKey
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET;
      if (base && bucket) {
        coverUrl = `${base}/storage/v1/object/public/${bucket}/${e.coverKey}`;
      }
    }

    return { ...e, pdfUrl, coverUrl };
  });

  return NextResponse.json(sanitize(mapped), {
    headers: { 'Cache-Control': 'private, max-age=30' },
  });
}

export async function POST(req: Request) {
  const form = await req.formData();

  const title = String(form.get('title') ?? '').trim();
  const pdf = form.get('pdf') as File | null;
  if (!title || !pdf) {
    return NextResponse.json({ error: 'title/pdf required' }, { status: 400 });
  }

  const author = (form.get('author') as string) || null;
  const year = (form.get('year') as string) ? Number(form.get('year')) : null;
  const tags = ((form.get('tags') as string) || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const visibility = ((form.get('visibility') as string) || 'PRIVATE') as Visibility;
  const category = ((form.get('category') as string) || 'EBOOK') as Category;

  // unique slug
  const base = slugify(title);
  let slug = base;
  for (let i = 2; await prisma.ebook.findUnique({ where: { slug } }); i++) {
    slug = `${base}-${i}`;
  }

  // Upload ke Google Drive
  const drive = await getDrive();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
  const buf = Buffer.from(await pdf.arrayBuffer());

  const { data: meta } = await drive.files.create(
    {
      requestBody: {
        name: `${slug}.pdf`,
        parents: [folderId],
        mimeType: 'application/pdf',
      },
      media: { mimeType: 'application/pdf', body: Readable.from([buf]) as any },
      fields: 'id, mimeType, size',
      supportsAllDrives: true, // ← penting kalau folder adalah Shared Drive
    } as any
  );

  // PUBLIC? anyone can read
  if (visibility === 'PUBLIC') {
    await drive.permissions.create(
      {
        fileId: meta.id!,
        requestBody: { role: 'reader', type: 'anyone' },
        supportsAllDrives: true,
      } as any
    );
  }

  const created = await prisma.ebook.create({
    data: {
      slug,
      title,
      author: author || undefined,
      year: year || undefined,
      tags,
      category,
      sizeBytes: BigInt(pdf.size),
      storage: 'DRIVE',
      driveFileId: meta.id!,
      mimeType: meta.mimeType ?? 'application/pdf',
      visibility,
      version: 1,
    },
  });

  const pdfUrl =
    visibility === 'PUBLIC'
      ? `https://drive.google.com/uc?id=${meta.id}&export=download`
      : `/api/ebooks/${created.id}/download`;

  // coverUrl langsung tersedia via proxy route (thumbnail bisa delay beberapa detik)
  const coverUrl = `/api/ebooks/${created.id}/cover`;

  return NextResponse.json(sanitize({ ...created, pdfUrl, coverUrl }), {
    status: 201,
  });
}
