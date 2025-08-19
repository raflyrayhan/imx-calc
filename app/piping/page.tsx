// app/piping/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { PIPING_CATEGORIES } from "@/lib/catalog";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

type Cat = {
  slug: string;
  title: string;
  description?: string;
  items?: Array<{ title: string; slug?: string; href?: string }>;
};

export default function PipingPage() {
  const [query, setQuery] = useState("");

  const filtered: Cat[] = PIPING_CATEGORIES.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  return (
    <main className="relative min-h-screen flex flex-col">
      {/* Subtle grid background (same style as Links page) */}
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
          Piping <span className="text-indigo-700 font-extrabold">Calculations</span>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-slate-700"
        >
          Curated calculators and selectors for piping design—organized by topic.
        </motion.p>
      </motion.section>

      {/* Filters (mirrors Links page layout) */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search categories…"
              className="w-72 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-600">
            Total:{" "}
            <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
            categor{filtered.length === 1 ? "y" : "ies"}
          </div>
        </div>
      </section>

      {/* Notion-style cards (same card pattern as Links) */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-14">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {filtered.map((c) => {
            const toolCount = c.items?.length ?? 0;

            return (
              <motion.article
                key={c.slug}
                variants={fadeUp}
                className="group flex items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-md transition"
              >
                {/* Text-only card (no thumbnail for categories) */}
                <div className="flex min-w-0 flex-1 flex-col p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <Link
                      href={`/piping/${c.slug}`}
                      className="line-clamp-2 font-semibold text-slate-900 hover:underline"
                      title={c.title}
                    >
                      {c.title}
                    </Link>
                  </div>

                  <p className="mb-3 line-clamp-3 text-sm text-slate-600">
                    {c.description ?? "No description provided."}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">
                      {toolCount} tool{toolCount === 1 ? "" : "s"}
                    </span>

                    <span className="ml-auto inline-flex items-center gap-1">
                      <Link
                        href={`/piping/${c.slug}`}
                        className="rounded-md bg-indigo-600 px-2 py-1 text-white hover:bg-indigo-700"
                        title="Open category"
                      >
                        Open
                      </Link>
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}

          {!filtered.length && (
            <div className="col-span-full rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              No category matches your search.
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
