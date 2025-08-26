// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "imx_session";
const PUBLIC_PATHS = ["/login", "/api/auth", "/favicon", "/images", "/_next", "/public"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // cek session cookie
  const hasCookie = req.cookies.get(COOKIE_NAME)?.value;
  if (!hasCookie) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
