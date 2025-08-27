"use client";
import { usePathname } from "next/navigation";

const HIDE_SET = new Set<string>([
  "/login",
  // kalau ada rute auth lain, tambahkan di sini, contoh:
  // "/auth/forgot", "/auth/register"
]);

export default function HideOnRoutes({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (Array.from(HIDE_SET).some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return null; 
  }
  return <>{children}</>;
}
