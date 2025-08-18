"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CFD_TOOLS } from "@/lib/catalog";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const item = {
hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

export default function CfdPage() {
  return (
    <main className="min-h-screen">
      {/* subtle tech grid bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(100%_60%_at_50%_0%,black,transparent)]"
      >
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(2,6,23,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.05)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-60" />
      </div>

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-9xl px-4 pt-16 pb-10 text-center"
      >
        <motion.h1
          variants={item}
          className="text-3xl md:text-4xl font-semibold tracking-tight"
        >
          CFD Calculations
        </motion.h1>
        <motion.p
          variants={item}
          className="mx-auto mt-3 max-w-screen"
        >
          Solver selection, complexity estimation, and airflow/thermal calculators.
        </motion.p>
      </motion.section>

      {/* Card list */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-5 max-w-6xl"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 w-screen">
          {CFD_TOOLS.map((t, i) => {
            const to = typeof t.href === "string" && t.href.trim() ? t.href : undefined;
            const disabled = !to;

            const Body = (
              <div
                className="flex flex-col border-b border-slate-200 dark:border-slate-700
                            dark:hover:underline transition duration-200"
              >
                <div className="px-6 py-4">
                  <div className="text-lg font-medium">{t.title}</div>
                  {t.description && (
                    <p className="text-sm mt-1">{t.description}</p>
                  )}
                </div>
                <div className="px-6 py-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${
                      disabled
                        ? "text-slate-400 bg-slate-200/60 dark:bg-slate-800/60"
                        : "text-white bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {disabled ? "Coming soon" : "Open"}
                    {!disabled && (
                      <svg
                        className="size-4 translate-x-0 group-hover:translate-x-0.5 transition-transform"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M7.5 4.5a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.59 11H4a1 1 0 1 1 0-2h7.59L7.5 5.9a1 1 0 0 1 0-1.4Z" />
                      </svg>
                    )}
                  </span>
                </div>
              </div>
            );

            return (
              <motion.div key={to ?? `disabled-${i}`} variants={item} className="h-full">
                {disabled ? (
                  <div className="cursor-not-allowed opacity-75">{Body}</div>
                ) : (
                  <Link
                    href={to}
                    className="block h-full outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-600"
                  >
                    {Body}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100/80 to-transparent dark:from-slate-900/60"
      />
    </main>
  );
}