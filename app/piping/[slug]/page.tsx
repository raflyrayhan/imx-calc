// app/piping/[slug]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { PIPING_CATEGORIES } from "@/lib/catalog";

type ToolItem = {
  title: string;
  description?: string;
  href?: unknown;
  slug?: unknown;
};

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};
const list = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

// robust resolver: returns a non-empty string or undefined
function resolveHref(catSlug: string, t: ToolItem): string | undefined {
  const rawHref =
    (typeof t.href === "string" && t.href.trim()) ||
    (typeof t.slug === "string" && t.slug.trim()
      ? `/piping/${catSlug}/${String(t.slug).trim()}`
      : "");

  return rawHref && typeof rawHref === "string" ? rawHref : undefined;
}

export default function PipingCategoryPage() {
  const params = useParams();
  const slug = Array.isArray((params as any)?.slug)
    ? (params as any).slug[0]
    : (params as any)?.slug;

  const cat = PIPING_CATEGORIES.find((c) => c.slug === slug);

  if (!cat) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">
            Category not found
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            The requested category doesn’t exist.
          </p>
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

  const items = (cat.items as ToolItem[]) ?? [];

  return (
    <main className="relative min-h-screen bg-white dark:bg-slate-950">
      {/* subtle tech grid bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(100%_60%_at_50%_0%,black,transparent)]"
      >
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(2,6,23,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.05)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-60" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10">

        {/* Header */}
        <motion.header variants={fadeIn} initial="hidden" animate="show" className="mt-4">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {cat.title}
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">{cat.description}</p>
          <div className="mt-4 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {items.length} tool{items.length !== 1 ? "s" : ""}
          </div>
        </motion.header>

        {/* Tools grid */}
        <motion.div
          variants={list}
          initial="hidden"
          animate="show"
          className="mt-8 grid gap-5 sm:grid-cols-2 auto-rows-fr"
        >
          {items.map((t, i) => {
            const to = resolveHref(cat.slug, t);
            const disabled = typeof to !== "string";

            const CardInner = (
              <div className="flex h-full flex-col">
                <div>
                  <div className="text-base md:text-lg font-medium text-slate-900 dark:text-white">
                    {t.title}
                  </div>
                  {t.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {t.description}
                    </p>
                  )}
                </div>
                <div className="mt-auto pt-5">
                  <span
                    className={`inline-flex items-center gap-2 text-sm font-semibold ${
                      disabled
                        ? "text-slate-400 dark:text-slate-500"
                        : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {disabled ? "Coming soon" : "Open"}
                    {!disabled && (
                      <svg
                        className="size-4 translate-x-0 group-hover:translate-x-0.5 transition-transform"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M7.5 4.5a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.59 11H4a1 1 0 1 1 0-2h7.59L7.5 5.9a1 1 0 0 1 0-1.4Z" />
                      </svg>
                    )}
                  </span>
                </div>
              </div>
            );

            return (
              <motion.div key={to ?? `disabled-${i}`} variants={fadeIn} className="h-full">
                <div
                  className={`group h-full rounded-xl border border-slate-200 dark:border-slate-800
                              bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm p-5 md:p-6
                              shadow-sm ${disabled ? "" : "hover:shadow-md"}
                              ring-0 ${disabled ? "" : "hover:ring-2 hover:ring-blue-500/30 dark:hover:ring-blue-500/25"}
                              transition`}
                  aria-disabled={disabled}
                >
                  {disabled ? (
                    <div className="h-full cursor-not-allowed opacity-70">{CardInner}</div>
                  ) : (
                    <Link
                      href={to}
                      className="block h-full outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
                    >
                      {CardInner}
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100/80 to-transparent dark:from-slate-900/60"
      />
    </main>
  );
}
