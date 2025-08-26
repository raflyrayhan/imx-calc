// app/api/auth/sessionLogout/route.ts
import { NextResponse } from "next/server";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "imx_session";

export async function POST() {
  // buat response JSON
  const res = NextResponse.json({ ok: true });

  // hapus cookie session via response
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0, // hapus
  });

  // opsional: cegah cache
  res.headers.set("Cache-Control", "no-store");

  return res;
}
