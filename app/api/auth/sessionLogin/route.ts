// app/api/auth/sessionLogin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "imx_session";
const EXPIRES_DAYS = Number(process.env.SESSION_COOKIE_DAYS || 7);

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return new Response("Bad Request", { status: 400 });

    // Verify ID token
    const decoded = await adminAuth.verifyIdToken(idToken, true);

    // Create session cookie
    const expiresIn = EXPIRES_DAYS * 24 * 60 * 60 * 1000; // ms
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Prepare response and set the session cookie
    const res = NextResponse.json({ ok: true, uid: decoded.uid, email: decoded.email });
    res.cookies.set({
      name: COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: Math.floor(expiresIn / 1000), // seconds
      path: "/",
    });

    return res;
  } catch (error: unknown) {
    console.error("Session creation failed:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response("Unauthorized: " + errorMessage, { status: 401 });
  }
}