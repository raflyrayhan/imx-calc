"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";

const NAV = [
  { label: "Home", href: "/" },
  { label: "E-books", href: "/ebook" },
  { label: "Links", href: "/links" },
  { label: "Calculator & Tools", href: "/tools" }, // consolidated
];

export default function Navbar() {
  const pathname = usePathname() || "/";
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mount flag prevents SSR/CSR mismatches for theme + active states
  useEffect(() => {
    setMounted(true);
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefers =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const startDark = saved ? saved === "dark" : !!prefers;
    setDarkMode(startDark);
    document.documentElement.classList.toggle("dark", startDark);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", next ? "dark" : "light");
      }
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/60 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-14 flex items-center justify-between gap-3">
          {/* Left: Logo + Nav */}
          <div className="flex items-center min-w-0">
            <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Go to Home">
              <Image
                src="/imx-logo-nb.png"        // ← replace with your logo path
                alt="Brand logo"
                width={32}
                height={32}
                priority
                className="h-9 w-9 object-contain"
              />
            </Link>

            <nav aria-label="Main navigation" className="ml-6">
              <ul className="flex flex-wrap items-center gap-5 text-sm">
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
                            ? "font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800"
                            : "text-slate-600 hover:text-slate-900 dark:text-slate-600 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70",
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Right: Theme toggle */}
          <button
            title="Toggle dark mode"
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {mounted && (darkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            ))}
          </button>
        </div>
      </div>
    </header>
  );
}
