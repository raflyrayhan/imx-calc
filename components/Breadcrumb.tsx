"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";

const FRIENDLY: Record<string, string> = {
  piping: "Piping",
  cfd: "CFD",
  "pipe-sizing-liquids": "Pipe Sizing (Liquids & Solvents)",
  "single-phase-flow": "Single Phase Fluid Flow",
  "compressible-flow": "Compressible Fluid Flow",
  cfdpage: "CFD Calculations",
};

function titleize(seg: string) {
  const pretty = FRIENDLY[seg] ?? seg.replace(/-/g, " ");
  return pretty.replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function Breadcrumb() {
  const pathname = usePathname() || "/";
  const parts = pathname.split("/").filter(Boolean);

  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const start = saved ? saved === "dark" : prefers;
    setDarkMode(start);
    document.documentElement.classList.toggle("dark", start);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  const crumbs = parts.map((seg, i) => ({
    href: "/" + parts.slice(0, i + 1).join("/"),
    label: titleize(decodeURIComponent(seg)),
  }));

  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="inline-flex items-center gap-2">
            <li>
              <Link href="/" className="font-medium hover:underline">
                Home
              </Link>
            </li>
            {crumbs.map((c, idx) => {
              const isLast = idx === crumbs.length - 1;
              return (
                <li key={c.href} className="inline-flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-600">/</span>
                  {isLast ? (
                    <span className="font-bold" aria-current="page">
                      {c.label}
                    </span>
                  ) : (
                    <Link href={c.href} className="hover:underline">
                      {c.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <button
          title="Toggle dark mode"
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
}