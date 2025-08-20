// app/piping/[slug]/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  const router = useRouter();

  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
      ? params.slug[0]
      : "";

  const cat = PIPING_CATEGORIES.find((c) => c.slug === slug);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/piping");
    }
  };

  if (!cat) {
    return (
      <main className="min-h-screen relative">
        {/* Subtle grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(100%_60%_at_50%_0%,black,transparent)]"
        >
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(2,6,23,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-6">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M12.5 4.5a1 1 0 0 0-1.4 0l-5 5a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L8.41 11H16a1 1 0 1 0 0-2H8.41l4.09-4.1a1 1 0 0 0 0-1.4Z" />
            </svg>
            Back
          </button>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 text-center">
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

        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100/80 to-transparent"
        />
      </main>
    );
  }

  const items: ToolItem[] = cat.items ?? [];

  return (
    <main className="min-h-screen relative">
      {/* Subtle grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(100%_60%_at_50%_0%,black,transparent)]"
      >
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(2,6,23,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-6">
        {/* Back button */}
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M12.5 4.5a1 1 0 0 0-1.4 0l-5 5a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L8.41 11H16a1 1 0 1 0 0-2H8.41l4.09-4.1a1 1 0 0 0 0-1.4Z" />
          </svg>
          Back
        </button>

        {/* Header */}
        <motion.header variants={fadeIn} initial="hidden" animate="show" className="mt-6">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{cat.title}</h1>
          <p className="mt-3 max-w-3xl">{cat.description}</p>
          <div className="mt-4 text-xs uppercase tracking-wide">
            {items.length} tool{items.length !== 1 ? "s" : ""}
          </div>
        </motion.header>

        {/* Cards */}
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
                  className={`h-full rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-5 md:p-6 shadow-sm ${
                    disabled ? "" : "hover:shadow-md"
                  } transition`}
                  aria-disabled={disabled}
                >
                  {disabled ? (
                    <div className="cursor-not-allowed opacity-70">
                      <h3 className="text-lg font-semibold">{t.title}</h3>
                      <p className="mt-2 text-sm">{t.description}</p>
                      <span className="mt-4 inline-block text-sm text-slate-400">Coming soon</span>
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

 
      <footer className="mt-auto">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-6 text-center text-sm text-slate-500 dark:text-slate-300">
          © 2025 <strong className="text-indigo-700 dark:text-indigo-600">IMX</strong> Calc.
          All rights reserved.
        </div>
      </footer>
    </main>
  );
}
