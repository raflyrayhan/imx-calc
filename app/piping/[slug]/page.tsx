// app/piping/[slug]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PIPING_CATEGORIES } from "@/lib/catalog";

interface ToolItem {
  title: string;
  description?: string;
  href?: string;
  slug?: string;
}

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};
const list = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

function resolveHref(catSlug: string, t: ToolItem): string | undefined {
  const rawHref =
    t.href?.trim() ||
    (t.slug?.trim() ? `/piping/${catSlug}/${t.slug.trim()}` : "");
  return rawHref || undefined;
}

export default function PipingCategoryPage() {
  const params = useParams();
  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
      ? params.slug[0]
      : "";

  // dark-mode sync
  const [darkMode, setDarkMode] = useState<boolean>(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const start = saved ? saved === "dark" : prefers;
    setDarkMode(start);
    document.documentElement.classList.toggle("dark", start);
  }, []);

  const cat = PIPING_CATEGORIES.find((c) => c.slug === slug);

  if (!cat) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold">Category not found</h1>
          <p className="mt-3">The requested category doesn’t exist.</p>
          <div className="mt-6">
            <Link
              href="/piping"
              className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Piping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const items: ToolItem[] = cat.items ?? [];

  return (
    <main className="min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(100%_60%_at_50%_0%,black,transparent)]"
      >
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(2,6,23,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.05)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-60" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10">
        <motion.header variants={fadeIn} initial="hidden" animate="show">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {cat.title}
          </h1>
          <p className="mt-3 max-w-3xl">{cat.description}</p>
          <div className="mt-4 text-xs uppercase tracking-wide">
            {items.length} tool{items.length !== 1 ? "s" : ""}
          </div>
        </motion.header>

        <motion.div
          variants={list}
          initial="hidden"
          animate="show"
          className="mt-8 grid gap-5 sm:grid-cols-2 auto-rows-fr"
        >
          {items.map((t, i) => {
            const to = resolveHref(cat.slug, t);
            const disabled = typeof to !== "string";
            return (
              <motion.div key={to ?? `disabled-${i}`} variants={fadeIn}>
                <div
                  className={`h-full rounded-xl border border-slate-200 dark:border-slate-800
                              bg-white/80 dark:bg-slate-100/10 backdrop-blur-sm p-5 md:p-6
                              shadow-sm ${disabled ? "" : "hover:shadow-md"}
                              transition`}
                  aria-disabled={disabled}
                >
                  {disabled ? (
                    <div className="cursor-not-allowed opacity-70">
                      <h3 className="text-lg font-semibold">{t.title}</h3>
                      <p className="mt-2 text-sm">{t.description}</p>
                      <span className="mt-4 inline-block text-sm text-slate-400">
                        Coming soon
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={to}
                      className="block h-full outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <h3 className="text-lg font-semibold">{t.title}</h3>
                      <p className="mt-2 text-sm">{t.description}</p>
                      <span className="mt-4 inline-block text-sm">Open →</span>
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100/80 to-transparent dark:from-slate-900/10"
      />
    </main>
  );
}