// app/api/ebooks/[key]/cover/route.ts
import { prisma } from "@/lib/prisma";
import { getDriveWithAuth } from "@/lib/googleDrive";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// NOTE: Next.js 15: params is a Promise
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key: rawKey } = await params;
    const key = decodeURIComponent(rawKey);

    const row =
      (await prisma.ebook.findUnique({ where: { id: key } })) ??
      (await prisma.ebook.findUnique({ where: { slug: key } }));

    if (!row?.driveFileId) return new Response("Not found", { status: 404 });

    const { drive, auth } = await getDriveWithAuth();

    let thumbUrl: string | undefined;
    for (let i = 0; i < 5; i++) {
      const meta = await drive.files.get({
        fileId: row.driveFileId,
        fields: "thumbnailLink,hasThumbnail",
        supportsAllDrives: true as any,
      });
      thumbUrl = (meta.data as any).thumbnailLink as string | undefined;
      if (thumbUrl) break;
      await new Promise((r) => setTimeout(r, 700));
    }

    if (!thumbUrl) {
      // Tidak ada thumbnail dari Google Drive → 204 No Content
      return new Response(null, { status: 204 });
    }

    // --- FIX di sini ---
    // getRequestHeaders() bisa mengembalikan Web Headers atau object biasa.
    const reqHeaders = await auth.getRequestHeaders();
    const authHeader =
      typeof (reqHeaders as any)?.get === "function"
        ? (reqHeaders as Headers).get("Authorization")
        : (reqHeaders as Record<string, string>)?.Authorization;

    // Ambil thumbnail dari URL yang diberikan Drive; jika authHeader ada, sertakan
    const res = await fetch(thumbUrl, {
      headers: authHeader ? { Authorization: authHeader } : undefined,
    });

    if (!res.ok || !res.body) return new Response("Failed", { status: 502 });

    return new Response(res.body, {
      headers: {
        "Content-Type": res.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400", // 1 hari
      },
    });
  } catch (err) {
    console.error("GET /api/ebooks/[key]/cover error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
