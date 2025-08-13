// components/Breadcrumb.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FRIENDLY: Record<string, string> = {
  // Optional friendly labels for common routes
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

  // Build href for each crumb
  const crumbs = parts.map((seg, i) => ({
    href: "/" + parts.slice(0, i + 1).join("/"),
    label: titleize(decodeURIComponent(seg)),
  }));

  return (
    <header className="sticky top-0 z-20 bg-slate-950 backdrop-blur ">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <nav aria-label="Breadcrumb">
          <ol className="inline-flex items-center gap-2 text-sm">
            {/* Home */}
            <li>
              <Link
                href="/"
                className="text-white hover:underline font-medium"
              >
                Home
              </Link>
            </li>

            {/* Dynamic segments */}
            {crumbs.map((c, idx) => {
              const isLast = idx === crumbs.length - 1;
              return (
                <li key={c.href} className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="text-white">/</span>
                  {isLast ? (
                    <span
                      className="text-white font-extrabold"
                      aria-current="page"
                    >
                      {c.label}
                    </span>
                  ) : (
                    <Link
                      href={c.href}
                      className="text-white hover:underline"
                    >
                      {c.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </header>
  );
}
