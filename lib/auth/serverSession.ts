// lib/auth/serverSession.ts
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "imx_session";

export async function getServerUser() {
  // Next 15: cookies() dapat berupa Promise — await dulu
  const jar = await cookies();
  const cookie = jar.get(COOKIE_NAME)?.value;
  if (!cookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    return decoded; // berisi uid, email, dll
  } catch {
    return null;
  }
}
