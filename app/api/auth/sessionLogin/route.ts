// app/api/auth/sessionLogin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "imx_session";
const EXPIRES_DAYS = Number(process.env.SESSION_COOKIE_DAYS || 7);

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return new Response("Bad Request", { status: 400 });

    // verifikasi ID token dari client
    const decoded = await adminAuth.verifyIdToken(idToken, true);

    // buat session cookie httpOnly
    const expiresIn = EXPIRES_DAYS * 24 * 60 * 60 * 1000; // ms
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // buat response dan SET cookie pada response (bukan lewat cookies())
    const res = NextResponse.json({ ok: true, uid: decoded.uid, email: decoded.email });
    res.cookies.set({
      name: COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: Math.floor(expiresIn / 1000), // detik
      path: "/",
    });

    return res;
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}
