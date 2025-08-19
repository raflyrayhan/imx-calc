// app/cfd/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { CFD_TOOLS } from "@/lib/catalog";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

type Tool = {
  title: string;
  description?: string;
  href?: string;
  slug?: string;
};

function resolveHref(t: Tool): string | undefined {
  const raw = t.href?.trim() || (t.slug?.trim() ? `/cfd/${t.slug.trim()}` : "");
  return raw || undefined;
}

export default function CfdPage() {
  const [query, setQuery] = useState("");

  const tools: Tool[] = CFD_TOOLS as Tool[];
  const filtered = tools.filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  return (
    <main className="relative min-h-screen flex flex-col">
      {/* Subtle grid background (same as Links) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10
                   bg-[linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),
                        linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)]
                   bg-[size:24px_24px]"
      />

      {/* Hero */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-6xl px-4 pt-14 pb-6 text-center"
      >
        <motion.h1
          variants={fadeUp}
          className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900"
        >
          CFD <span className="text-indigo-700 font-extrabold">Calculations</span>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-slate-700"
        >
          Solver selection, complexity estimation, and airflow/thermal calculators.
        </motion.p>
      </motion.section>

      {/* Filter bar (mirrors Links page) */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search tools…"
              className="w-72 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-600">
            Total:{" "}
            <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
            tool{filtered.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      {/* Cards (same pattern as Links page) */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-14">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {filtered.map((t, i) => {
            const to = resolveHref(t);
            const disabled = !to;

            const Card = (
              <div className="flex min-w-0 flex-1 flex-col p-4">
                <div className="mb-1">
                  {disabled ? (
                    <span className="line-clamp-2 font-semibold text-slate-400">{t.title}</span>
                  ) : (
                    <Link
                      href={to}
                      className="line-clamp-2 font-semibold text-slate-900 hover:underline"
                      title={t.title}
                    >
                      {t.title}
                    </Link>
                  )}
                </div>

                <p className="mb-3 line-clamp-3 text-sm text-slate-600">
                  {t.description ?? "No description provided."}
                </p>

                <div className="mt-auto flex items-center gap-2 text-xs">
                  {disabled ? (
                    <span className="rounded bg-slate-100 px-2 py-1 text-slate-500">
                      Coming soon
                    </span>
                  ) : (
                    <span className="ml-auto inline-flex items-center gap-1">
                      <Link
                        href={to}
                        className="rounded-md bg-indigo-600 px-2 py-1 text-white hover:bg-indigo-700"
                        title="Open tool"
                      >
                        Open
                      </Link>
                    </span>
                  )}
                </div>
              </div>
            );

            return (
              <motion.article
                key={to ?? `disabled-${i}`}
                variants={fadeUp}
                className={`group flex items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-white transition ${
                  disabled ? "" : "hover:shadow-md"
                }`}
                aria-disabled={disabled}
              >
                {Card}
              </motion.article>
            );
          })}

          {!filtered.length && (
            <div className="col-span-full rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              No tool matches your search.
            </div>
          )}
        </motion.div>
      </section>
      <footer className="mt-auto">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-6 text-center text-sm text-slate-500 dark:text-slate-300">
          © 2025 <strong className="text-indigo-700 dark:text-indigo-600">IMX</strong> Calc.
          All rights reserved.
        </div>
      </footer>
    </main>
  );
}
