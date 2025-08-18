"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type Accent = "blue" | "indigo" | "sky" | "violet";

interface Props {
  href: string;
  title: string;
  subtitle: string;
  accent?: Accent;
}

export default function MotionCard({ href, title, subtitle, accent = "blue" }: Props) {
  const accentRing = {
    blue:   "focus-visible:ring-blue-600",
    indigo: "focus-visible:ring-indigo-600",
    sky:    "focus-visible:ring-sky-600",
    violet: "focus-visible:ring-violet-600",
  }[accent];

  const accentBg = {
    blue:   "bg-blue-600",
    indigo: "bg-indigo-600",
    sky:    "bg-sky-600",
    violet: "bg-violet-600",
  }[accent];

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      className="h-full"
    >
      <motion.div
        variants={{
          rest: { y: 0, boxShadow: "0 1px 0 rgba(15,23,42,0.04)" },
          hover: {
            y: -3,
            boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
            transition: { type: "spring", stiffness: 250, damping: 18 },
          },
        }}
        initial="rest"
        whileHover="hover"
        animate="rest"
        className="group relative h-full rounded-2xl border border-slate-200/60 dark:border-slate-800/60
                   bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm hover:shadow-md transition"
      >
        <Link
          href={href}
          className={`block h-full outline-none rounded-2xl focus-visible:ring-2 ${accentRing}`}
        >
          <div className="flex flex-col p-5 gap-4">
            <h2 className="text-2xl font-medium text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">{subtitle}</p>
            <div>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-white ${accentBg}`}
              >
                Enter <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
