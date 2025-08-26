import { prisma } from "@/lib/prisma";
import { getDrive } from "@/lib/googleDrive";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function authorizedByApiKey(req: Request) {
  const expected = process.env.IMX_EBOOK_API_KEY || "";
  if (!expected) return false;

  // cookie
  const cookieToken = cookies().get("imx_ebook_key")?.value;
  if (cookieToken && cookieToken === expected) return true;

  // Authorization: Bearer <token>
  const auth = req.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ") && auth.slice(7) === expected) {
    return true;
  }
  return false;
}

async function isAuthorized(req: Request) {
  if (process.env.IMX_EBOOK_DEV_OPEN === "true") return true;
  return authorizedByApiKey(req);
}

export async function GET(req: Request, { params }: { params: { key: string } }) {
  const key = decodeURIComponent(params.key);

  const row =
    (await prisma.ebook.findUnique({ where: { id: key } })) ??
    (await prisma.ebook.findUnique({ where: { slug: key } }));

  if (!row?.driveFileId) return new Response("Not found", { status: 404 });

  // PRIVATE butuh auth
  if (row.visibility === "PRIVATE") {
    const ok = await isAuthorized(req);
    if (!ok) return new Response("Unauthorized", { status: 401 });
  }

  const drive = await getDrive();
  const gRes = await drive.files.get(
    { fileId: row.driveFileId, alt: "media" as any },
    { responseType: "stream" }
  );

  const readable = gRes.data as unknown as NodeJS.ReadableStream;
  const stream = new ReadableStream({
    start(controller) {
      readable.on("data", (c) => controller.enqueue(c));
      readable.on("end", () => controller.close());
      readable.on("error", (e) => controller.error(e));
    },
  });

  return new Response(stream as any, {
    headers: {
      "Content-Type": row.mimeType || "application/pdf",
      "Cache-Control": "private, no-store",
    },
  });
}
