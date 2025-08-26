import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const expected = process.env.IMX_EBOOK_API_KEY;

  if (!expected) {
    return NextResponse.json({ error: "IMX_EBOOK_API_KEY not set" }, { status: 500 });
  }
  if (token !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  cookies().set("imx_ebook_key", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // penting: biar bisa set cookie di http://localhost
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  return NextResponse.json({ ok: true });
}

// (opsional) biar ga 405 untuk preflight/HEAD
export function OPTIONS() { return new Response(null, { status: 204 }); }
export function HEAD()    { return new Response(null, { status: 200 }); }
