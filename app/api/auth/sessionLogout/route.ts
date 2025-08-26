// app/api/auth/sessionLogout/route.ts
import { cookies } from "next/headers";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "imx_session";

export async function POST() {
  // hapus cookie session
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
