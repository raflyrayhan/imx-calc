"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

// ⬇️ Firebase Auth (client)
import { onAuthStateChanged, signOut } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";

const NAV = [
  { label: "Home", href: "/" },
  { label: "E-books", href: "/ebook" },
  { label: "Links", href: "/links" },
  { label: "Calculator & Tools", href: "/tools" },
];

export default function Navbar() {
  const pathname = usePathname() || "/";
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // auth state
  const [user, setUser] = useState<null | { uid: string; email?: string | null }>(null);

  // Prevent hydration mismatch for active states
  useEffect(() => setMounted(true), []);

  // Subscribe Firebase auth
  useEffect(() => {
    const unsub = onAuthStateChanged(clientAuth, (u) => {
      setUser(u ? { uid: u.uid, email: u.email } : null);
    });
    return () => unsub();
  }, []);

  // Close the mobile menu on route change
  useEffect(() => {
    if (!mounted) return;
    setOpen(false);
  }, [pathname, mounted]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Click outside to close (mobile)
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  async function doLogout() {
    try {
      // hapus session cookie (server) + signOut Firebase (client)
      await fetch("/api/auth/sessionLogout", { method: "POST" });
      await signOut(clientAuth);
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-14 flex items-center justify-between gap-3">
          {/* Left: Logo */}
          <div className="flex items-center min-w-0">
            <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Go to Home">
              <Image
                src="/imx-logo-nb.png"
                alt="Brand logo"
                width={36}
                height={36}
                priority
                className="h-9 w-9 object-contain"
              />
            </Link>
          </div>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm">
              {NAV.map((item) => {
                const active = mounted && isActive(item.href);
                return (
                  <li key={item.href} className="shrink-0">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "px-2 py-1 rounded-md transition",
                        active
                          ? "font-semibold text-slate-900 bg-slate-100"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Desktop: auth actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <button
                onClick={doLogout}
                className="px-2 py-1 rounded-md transition text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                aria-label="Logout"
                title={user.email || "Logout"}
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="px-2 py-1 rounded-md transition text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100 transition"
            aria-label="Open menu"
            aria-controls="mobile-menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay + panel */}
      {open && (
        <>
          {/* Clickable overlay */}
          <div
            className="fixed inset-0 z-30 bg-black/20"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div
            ref={panelRef}
            id="mobile-menu"
            className="absolute inset-x-0 top-14 z-40 md:hidden"
          >
            <nav className="mx-4 rounded-xl border border-slate-200 bg-white shadow-lg">
              <ul className="py-2">
                {NAV.map((item) => {
                  const active = mounted && isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={[
                          "block px-4 py-3 text-sm rounded-lg mx-1",
                          active
                            ? "font-semibold text-slate-900 bg-slate-100"
                            : "text-slate-700 hover:bg-slate-100",
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}

                {/* Divider */}
                <li className="my-1">
                  <div className="h-px bg-slate-200 mx-3" />
                </li>

                {/* Mobile: auth action */}
                <li>
                  {user ? (
                    <button
                      onClick={doLogout}
                      className="w-full text-left block px-4 py-3 text-sm rounded-lg mx-1 text-slate-500 hover:bg-slate-100"
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-4 py-3 text-sm rounded-lg mx-1 text-slate-700 hover:bg-slate-100"
                    >
                      Login
                    </Link>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
