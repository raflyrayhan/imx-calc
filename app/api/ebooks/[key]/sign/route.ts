// app/api/auth/sign/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const expected = process.env.IMX_EBOOK_API_KEY;

  if (!expected) {
    return NextResponse.json({ error: "IMX_EBOOK_API_KEY not set" }, { status: 500 });
  }
  if (token !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // buat response, lalu set cookie pada response
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "imx_ebook_key",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari (detik)
  });
  return res;
}

// (opsional) biar ga 405 untuk preflight/HEAD
export function OPTIONS() {
  return new Response(null, { status: 204 });
}
export function HEAD() {
  return new Response(null, { status: 200 });
}
