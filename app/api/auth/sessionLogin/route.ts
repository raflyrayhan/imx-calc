// app/api/auth/sessionLogin/route.ts
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "imx_session";
const EXPIRES_DAYS = Number(process.env.SESSION_COOKIE_DAYS || 7);

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return new Response("Bad Request", { status: 400 });

    // verifikasi ID token dari client
    const decoded = await adminAuth.verifyIdToken(idToken, true);

    // buat session cookie httpOnly
    const expiresIn = EXPIRES_DAYS * 24 * 60 * 60 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    cookies().set(COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn / 1000,
      path: "/",
    });

    return new Response(JSON.stringify({ ok: true, uid: decoded.uid, email: decoded.email }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}
