"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

type Row = {
  href: string;
  title: string;
  subtitle: string;
  bullets: string[];
};

const ROWS: Row[] = [
  {
    href: "/cfdpage",
    title: "CFD Calculations",
    subtitle:
      "Scope simulations with solver selection, complexity estimates, and quick airflow/thermal checks before you build a case.",
    bullets: [
      "Solver & turbulence model guidance",
      "Cell-count & timestep heuristics",
      "Airflow / thermal sanity checks",
    ],
  },
  {
    href: "/piping",
    title: "Piping Calculations",
    subtitle:
      "Pressure drop, pump power, properties, heat transfer, and sizing — consistent inputs, unit-aware, and fast.",
    bullets: [
      "Pressure drop & pump power",
      "Single-phase & compressible helpers",
      "Thermal estimates & line sizing",
    ],
  },
  {
    href: "/wbs-editor",
    title: "S-Curve & Weight Factor Generator",
    subtitle:
      "Build WBS, define windows, and generate planned/actual S-curves. Weights are derived from durations for consistency.",
    bullets: [
      "WBS editor with phases & packages",
      "Auto weight factors from durations",
      "Exportable S-curve for reporting",
    ],
  },
];

export default function ToolsPage() {
  return (
    <main className="relative min-h-screen flex flex-col">
      {/* Background grid (parity with Links page) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10
                   bg-[linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),
                        linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)]
                   dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),
                             linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]
                   bg-[size:24px_24px]"
      />

      {/* Hero — centered */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-6xl px-4 pt-14 pb-6 text-center"
      >
        <motion.h1
          variants={fadeUp}
          className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-100"
        >
          Calculator <span className="text-indigo-700 dark:text-indigo-600 font-extrabold">&amp; Tools</span>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300"
        >
          A focused directory of the tools you use most. Pick a track below and launch.
        </motion.p>
      </motion.section>

      {/* Editorial list (no images) */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-14">
        <motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          className="border-y border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800"
        >
          {ROWS.map((r) => (
            <motion.li key={r.title} variants={fadeUp}>
              <Link
                href={r.href}
                className="group relative block py-7 focus-visible:outline-none"
              >
                <div className="flex flex-col gap-3 md:gap-2">
                  <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    {r.title}
                  </h2>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {r.subtitle}
                  </p>

                  <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                    {r.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400/80 dark:bg-slate-500/80" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2">
                    Open
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>

                {/* subtle hover background to hint clickability */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition
                             bg-slate-900/[0.02] dark:bg-white/[0.03]"
                />
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </section>
      <footer className="mt-auto">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-6 text-center text-sm text-slate-500 dark:text-slate-300">
          © {new Date().getFullYear()} <strong className="text-indigo-700 dark:text-indigo-600">IMX</strong> Resources.
          All rights reserved.
        </div>
      </footer>
    </main>
  );
}
