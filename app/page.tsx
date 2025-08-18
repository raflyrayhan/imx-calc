"use client";

import Link from "next/link";
import Image from "next/image";
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

type Section = {
  href: string;
  title: string;
  blurb: string;
  image: string;
  cta: string;
  accent: string;
  imageFit?: "cover" | "contain";
};

const sections: Section[] = [
  {
    href: "/erp/projects",
    title: "EPC Project Dashboard",
    blurb:
      "Compact Control for EPC: document control with status tracking & charts, project control with tasks/schedule, per-task attachments, memos, and Minutes-of-Meeting templates.",
    image: "/images/dashboard.png",
    cta: "Open Dashboard",
    accent: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600",
    imageFit: "contain",
  },
  {
    href: "/piping",
    title: "Piping Calculations",
    blurb:
      "From pressure drops and pump power to heat transfer, properties, and sizing. Built to speed up everyday design work with consistent, unit-aware inputs.",
    image: "/images/piping.webp",
    cta: "Open calculators",
    accent: "bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-600",
  },
  {
    href: "/cfdpage",
    title: "CFD Calculations",
    blurb:
      "Quick helpers for solver selection, complexity estimation, airflow/thermal checks, and setup guidance. Build to scope work before setting up a case.",
    image: "/images/cfd.png",
    cta: "Explore CFD tools",
    accent: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-600",
  },
  {
    href: "/wbs-editor",
    title: "S-Curve & Weight Factor Generator (Test)",
    blurb:
      "Build work-breakdown structures, set windows, and generate planned/actual S-curves. Weight factors are computed automatically from durations so planning stays consistent.",
    image: "/images/scurve.jpg",
    cta: "Open S-Curve tool",
    accent: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600",
  },
  {
    href: "/ebook",
    title: "E-Book Library",
    blurb:
      "Colection of engineering e-books. All in PDF format, with cover images, metadata, and tags for easy browsing.",
    image: "/images/ebooklibrary.jpg",
    cta: "Open E-Books",
    accent: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-600",
  },
  {
    href: "/links",
    title: "Important Links & References",
    blurb: "Reference links for engineering work. Bookmarkable with title, description, tags, and quick actions.",
    image: "/images/link.png",
    cta: "Open Links",
    accent: "bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-600",
  },
];

export default function HomePage() {
  const featured =
    sections.find((s) => s.href.startsWith("/erp")) ?? sections[0];
  const tools = sections.filter((s) => s.href !== featured.href);

  return (
    <main className="relative min-h-screen flex flex-col">
      {/* Subtle grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10
                   bg-[linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),
                        linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)]
                   dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),
                             linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]
                   bg-[size:24px_24px]"
      />

      {/* Hero */}
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
          <span className="text-indigo-700 dark:text-indigo-600 font-extrabold">IMX</span>{" "}
          Engineering Portal{" "}
          <span className="text-slate-500 dark:text-slate-400 text-sm">(beta v0.1.2)</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300"
        >
          A focused suite of engineering dashboard and tools.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-6 flex items-center justify-center gap-3">
         
        </motion.div>
      </motion.section>

      {/* FEATURE SPOTLIGHT — EPC ERP */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-12">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"  
          viewport={{ once: true, amount: 0.2 }}
          className="grid items-center gap-6 md:gap-10 md:grid-cols-2"
        >
          {/* Copy */}
          <motion.div variants={fadeUp}>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100">
             EPC Project Dashboard — built for projects, documents, and control
            </h2>
            <p className="mt-3 text-slate-700 dark:text-slate-300 leading-relaxed">
              Streamline project execution: status-tracked documents, approvals, attachments,
              tasks & schedules, MoM templates, and real-time dashboards.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={featured.href}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm
                           bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
              >
                {featured.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            
            </div>
          </motion.div>

          {/* Media */}
          <motion.div variants={fadeUp}>
            <div className="rounded-2xl shadow-lg overflow-hidden bg-white dark:bg-slate-900/40">
              <Image
                src={featured.image}
                alt={featured.title}
                width={900}
                height={620}
                className={featured.imageFit === "contain"
                  ? "object-contain w-full h-[280px] md:h-[420px]"
                  : "object-cover w-full h-auto"}
                priority
              />
            </div>

            {/* Mini stats / badges */}
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 px-3 py-2">
                <div className="text-xl font-semibold text-slate-900 dark:text-slate-100">Docs</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Control & Status</div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 px-3 py-2">
                <div className="text-xl font-semibold text-slate-900 dark:text-slate-100">Tasks</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Plan & Track</div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 px-3 py-2">
                <div className="text-xl font-semibold text-slate-900 dark:text-slate-100">Dash</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Looker Studio</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ALL TOOLS — card grid */}
      <section id="tools" className="mx-auto w-full max-w-6xl px-4 pb-14">
        <div className="mb-5 text-center">
          <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Other tools & resources
          </h3>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Fast helpers that support daily engineering work.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {tools.map((t) => (
            <motion.article
              key={t.title}
              variants={fadeUp}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white dark:bg-slate-900/40 hover:shadow-md transition"
            >
              <div className="relative h-40 w-full bg-slate-100">
                <Image
                  src={t.image}
                  alt={t.title}
                  fill
                  className={t.imageFit === "contain" ? "object-contain p-6" : "object-cover"}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="space-y-3 p-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{t.title}</h4>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {t.blurb}
                </p>
                <Link
                  href={t.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 ${t.accent}`}
                >
                  {t.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="mt-auto">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-6 text-center text-sm text-slate-500 dark:text-slate-300">
          © {new Date().getFullYear()}{" "}
          <strong className="text-indigo-700 dark:text-indigo-600">IMX</strong> Engineering Portal.
          All rights reserved | by{" "}
          <strong className="text-indigo-700 dark:text-indigo-600">Infimech</strong>
        </div>
      </footer>
    </main>
  );
}
