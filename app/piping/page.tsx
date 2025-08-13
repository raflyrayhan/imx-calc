// app/piping/page.tsx
"use client";

import { motion } from "framer-motion";
import CategoryCard from "@/components/CategoryCard";
import { PIPING_CATEGORIES } from "@/lib/catalog";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } }
};
const item = {
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }
};

export default function PipingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 py-12"
      >
        <motion.h1
          variants={item}
          className="text-3xl md:text-4xl font-semibold tracking-tight text-center text-slate-900 dark:text-white"
        >
          Piping Calculations
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-3 text-center text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
        >
          Curated calculators and selectors for piping design—organized by topic.
        </motion.p>

        <motion.div
          variants={container}
          className="grid auto-rows-fr items-stretch md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8"
        >
          {PIPING_CATEGORIES.map((c) => (
            <motion.div
              key={c.slug}
              variants={item}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="group"
            >
            <div className="h-[8vh] md:h-[10vh] lg:h-[50vh]">
              <CategoryCard
                title={c.title}
                description={c.description}
                href={`/piping/${c.slug}`}
                className="h-full"   // <- ensure the card stretches
              />
            </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100/80 to-transparent dark:from-slate-900/60"
      />
    </main>
  );
}
