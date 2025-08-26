// app/api/ebooks/[key]/cover/route.ts
import { prisma } from "@/lib/prisma";
import { getDriveWithAuth } from "@/lib/googleDrive";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      return new Response(null, { status: 204 });
    }

    const reqHeaders = await auth.getRequestHeaders();

    let authHeader: string | null = null;
    if (reqHeaders && typeof (reqHeaders as any).get === "function") {
      const h = reqHeaders as Headers;
      authHeader = h.get("authorization") ?? h.get("Authorization");
    } else if (reqHeaders && typeof reqHeaders === "object") {
      const h = reqHeaders as unknown as Record<string, string | undefined>;
      authHeader = h.authorization ?? h.Authorization ?? null;
    }

    const res = await fetch(thumbUrl, {
      headers: authHeader ? { Authorization: authHeader } : undefined,
    });

    if (!res.ok || !res.body) return new Response("Failed", { status: 502 });

    return new Response(res.body, {
      headers: {
        "Content-Type": res.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("GET /api/ebooks/[key]/cover error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
