// app/cfd/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CFD_TOOLS } from "@/lib/catalog";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

export default function CfdPage() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-slate-950">
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
        className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-10 text-center"
      >
        <motion.h1
          variants={item}
          className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          CFD Calculations
        </motion.h1>
        <motion.p
          variants={item}
          className="mx-auto mt-3 max-w-3xl text-slate-600 dark:text-slate-300"
        >
          Solver selection, complexity estimation, and airflow/thermal calculators.
        </motion.p>
      </motion.section>

      {/* Cards: equal height via auto-rows-fr + h-full flex card */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 auto-rows-fr gap-6 px-4 pb-20 sm:grid-cols-2"
      >
        {CFD_TOOLS.map((t, i) => {
          const to = typeof t.href === "string" && t.href.trim() ? t.href : undefined;
          const disabled = !to;

          const Body = (
            <div className="flex h-full flex-col">
              <div>
                <div className="text-lg md:text-xl font-medium text-slate-900 dark:text-white">
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
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold",
                    disabled
                      ? "text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-800/60 cursor-not-allowed"
                      : "text-white bg-indigo-600 hover:bg-indigo-700",
                  ].join(" ")}
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
              <div
                className={[
                  "group h-full rounded-2xl border border-slate-200 dark:border-slate-800",
                  "bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8",
                  "shadow-sm", disabled ? "" : "hover:shadow-md",
                  "ring-0", disabled ? "" : "hover:ring-2 hover:ring-indigo-500/30 dark:hover:ring-indigo-500/25",
                  "transition",
                ].join(" ")}
                aria-disabled={disabled}
              >
                {disabled ? (
                  <div className="h-full cursor-not-allowed opacity-75">{Body}</div>
                ) : (
                  <Link
                    href={to}
                    className="block h-full outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
                  >
                    {Body}
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.section>

      {/* bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100/80 to-transparent dark:from-slate-900/60"
      />
    </main>
  );
}
