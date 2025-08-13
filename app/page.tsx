// app/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } }
};

const card = {
  rest: { y: 0, boxShadow: "0 1px 0 rgba(15,23,42,0.04)" },
  hover: {
    y: -3,
    boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
    transition: { type: "spring", stiffness: 250, damping: 18 }
  }
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-slate-950">
      {/* subtle tech grid bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(100%_60%_at_50%_0%,black,transparent)]"
      >
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(2,6,23,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.05)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-60"></div>
      </div>

      {/* Intro */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-6xl px-4 pt-20 pb-12 text-center"
      >
        <motion.h1
          variants={item}
          className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          Engineering Tools
        </motion.h1>
        <motion.p
          variants={item}
          className="mx-auto mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-300"
        >
          A focused suite of engineering calculators and selectors for daily design work.
          Pick a collection to begin.
        </motion.p>
      </motion.section>

      {/* Cards: equal height via auto-rows-fr + h-full flex cards */}
      <section className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 auto-rows-fr gap-6 px-4 pb-20 md:grid-cols-2">
        <MotionCard
          href="/piping"
          title="Piping Calculations"
          subtitle="Fluid flow, heat transfer, equipment sizing, properties, and more—organized by topic."
        />
        <MotionCard
          href="/cfdpage"
          title="CFD Calculations"
          subtitle="Solver selection, complexity estimation, and airflow/thermal calculators."
          accent="indigo"
        />
      </section>

      {/* bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100/80 to-transparent dark:from-slate-900/60"
      />
    </main>
  );
}

function MotionCard({
  href,
  title,
  subtitle,
  accent = "blue",
}: {
  href: string;
  title: string;
  subtitle: string;
  accent?: "blue" | "indigo" | "sky" | "violet";
}) {
  const accentRing =
    {
      blue: "focus-visible:ring-blue-600",
      indigo: "focus-visible:ring-indigo-600",
      sky: "focus-visible:ring-sky-600",
      violet: "focus-visible:ring-violet-600",
    }[accent];

  const accentBg =
    {
      blue: "bg-blue-600",
      indigo: "bg-indigo-600",
      sky: "bg-sky-600",
      violet: "bg-violet-600",
    }[accent];

  const accentHover =
    {
      blue: "hover:bg-blue-700",
      indigo: "hover:bg-indigo-700",
      sky: "hover:bg-sky-700",
      violet: "hover:bg-violet-700",
    }[accent];

  return (
    <motion.div variants={item} className="h-full">
      <motion.div
        variants={card}
        initial="rest"
        whileHover="hover"
        animate="rest"
        className="group relative h-full rounded-2xl border border-slate-200 dark:border-slate-800
                   bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8
                   transition will-change-transform shadow-sm hover:shadow-md"
      >
        {/* subtle inner sheen */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]" />

        {/* content as flex column so CTA pins to bottom */}
        <Link
          href={href}
          className={`block h-full outline-none focus-visible:ring-2 ${accentRing} focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 rounded-xl`}
        >
          <div className="flex h-full flex-col">
            <div>
              <h2 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white">
                {title}
              </h2>
              <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
                {subtitle}
              </p>
            </div>

            {/* CTA aligned bottom for perfect row alignment */}
            <div className="mt-auto pt-6">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors ${accentBg} ${accentHover}`}
              >
                Enter
                <ArrowRight className="h-4 w-4 text-white/90" />
              </span>
            </div>
          </div>
        </Link>

        {/* hover ring */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 group-hover:ring-blue-500/30 dark:group-hover:ring-blue-500/25 transition" />
      </motion.div>
    </motion.div>
  );
}
