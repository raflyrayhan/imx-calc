// app/piping/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PIPING_CATEGORIES } from "@/lib/catalog";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const item = {
hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

export default function PipingPage() {
  return (
    <main className="min-h-screen">
      {/* subtle grid – dark-transparent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
                   bg-[linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),
                        linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)]
                   dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),
                             linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]
                   bg-[size:24px_24px]"
      />

      {/* Header */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-5xl px-4 pt-13 pb-10 text-center"
      >
        <motion.h1 variants={item} className="text-3xl md:text-4xl font-semibold pt-[-2vh]">
          Piping Calculations
        </motion.h1>
        <motion.p variants={item} className="mx-auto mt-3 max-w-3xl">
          Curated calculators and selectors for piping design—organized by topic.
        </motion.p>
      </motion.section>

      {/* One-column list */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-screen pb-2"
      >
        <div className="grid grid-cols-1 gap-6">
          {PIPING_CATEGORIES.map((c) => (
            <motion.div
              key={c.slug}
              variants={item}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Link
                href={`/piping/${c.slug}`}
                className="block outline-none rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <div className="flex flex-col border-b border-slate-200 dark:border-slate-700
                                hover:bg-indigo-50 dark:hover:bg-indigo-800/30 transition duration-200
                                px-6 py-4">
                  <h3 className="text-lg font-medium">{c.title}</h3>
                  {c.description && (
                    <p className="text-sm mt-1">{c.description}</p>
                  )}
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600">
                      Explore
                      <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7.5 4.5a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.59 11H4a1 1 0 1 1 0-2h7.59L7.5 5.9a1 1 0 0 1 0-1.4Z" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100/80 to-transparent dark:from-slate-900/20"
      />
    </main>
  );
}