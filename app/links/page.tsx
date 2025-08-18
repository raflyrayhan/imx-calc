"use client";

import Link from "next/link";
import Image from "next/image"; // kept for parity; using <img> for remote favicons/thumbnails
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

type Bookmark = {
  id: string;
  url: string;
  title: string;
  description?: string;
  image?: string;      // optional thumbnail (remote OK)
  tags?: string[];
};

const LINKS: Bookmark[] = [
  {
    id: "ashrae-55",
    url: "https://www.ashrae.org/technical-resources/bookstore/standard-55-thermal-environmental-conditions",
    title: "ASHRAE Standard 55 — Thermal Environmental Conditions",
    description: "Standard kenyamanan termal yang digunakan luas di HVAC.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=75&auto=format&fit=crop",
    tags: ["Standard", "HVAC"],
  },
  {
    id: "of-docs",
    url: "https://www.openfoam.com/documentation/",
    title: "OpenFOAM Documentation",
    description: "Dokumentasi resmi solver, utilitas, dan tutorial OpenFOAM.",
    tags: ["OpenFOAM", "CFD"],
  },
  {
    id: "api-610",
    url: "https://www.api.org/products-and-services/standards/important-standards/api610",
    title: "API 610 — Centrifugal Pumps for Petroleum",
    description: "Standar pompa sentrifugal untuk industri minyak & gas.",
    image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&q=75&auto=format&fit=crop",
    tags: ["Standard", "Pumps"],
  },
  {
    id: "automation-forum",
    url: "https://automationforum.co/",
    title: "Automation Forum",
    description: "Automation & control engineering resources, articles, and discussions.",
    image: "https://cdn.automationforum.co/uploads/2025/08/Checklist-for-Installation-of-Local-Instruments-Complete-Guide-for-EPC-QA-QC-and-Commissioning-Engineers-2-1536x878.jpg",
    tags: ["automation", "Community", "Control", "PLC", "SCADA", "Instrumentation"],
  },
  {
    id: "real-pars",
    url: "https://www.realpars.com/",
    title: "Realpars",
    description: "Video tutorials for PLC, SCADA, and industrial automation.",
    image: "https://cdn.prod.website-files.com/65f854814fd223fc3678ea45/66017a8d760dfed7279caa46_iStock-1323651560-p-1600.webp",
    tags: ["PLC", "SCADA", "Automation", "Tutorials"],
  },
  {
    id: "instrumentation-tools",
    url: "https://instrumentationtools.com/",
    title: "Inst Tools",
    description: "Instrumentation & control engineering resources, articles, and tools.",
    image: "https://instrumentationtools.com/wp-content/uploads/2024/05/Instrument-and-Electrical-Teams-Main-Duties.jpg",
    tags: ["Instrumentation", "Control", "EPC", "Tools"],
  },
  {
    id: "herve-baron",
    url: "https://www.youtube.com/@HerveBARONauthor",
    title: "Hervé Baron — Instrumentation & Control",
    description: "Expertise in instrumentation & control engineering with practical insights.",
    image: "/images/herve-baron.jpg",
    tags: ["Instrumentation", "Control", "EPC", "Engineering"],
  },
  {
    id: "savree-3d",
    url: "https://www.youtube.com/@savree-3d",
    title: "Savree 3D",
    description: "3D animations of industrial equipment and processes.",
    image: "https://yt3.googleusercontent.com/ytc/AIdro_nVlYDh-kDBVuTcS4dkAAdNh4zniJtbkYq5wHzUUoSOvQ=s160-c-k-c0x00ffffff-no-rj",
    tags: ["3D", "Animation", "Engineering", "Equipment"],
  },
  {
    id: "commissioning",
    url: "https://www.youtube.com/@commissioning",
    title: "Institute of Commissioning & Assurance",
    description: "Commissioning & assurance resources for engineering projects.",
    image: "https://yt3.googleusercontent.com/ArF2RWWb-XY2dXVTbPJGB2wi6-9MnVSI08ubNrCeKxzmScS-ld4o_1VnyhP0k6_gUitzfSO-Z_M=s160-c-k-c0x00ffffff-no-rj",
    tags: ["Commissioning", "Assurance", "Engineering"],
  },
  {
    id: "imx-calc",
    url: "https://imx-calc.vercel.app/",
    title: "IMX Engineering Portal",
    description: "A focused suite of engineering dashboard and tools.",
    image: "/images/imx-calc.png",
    tags: ["IMX", "Engineering", "Tools"],
  }
];

function domainFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function LinksPage() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("");

  const allTags = Array.from(new Set(LINKS.flatMap((l) => l.tags ?? []))).sort();

  const filtered = LINKS.filter((l) => {
    const q = query.trim().toLowerCase();
    const matchesQ =
      !q ||
      l.title.toLowerCase().includes(q) ||
      l.url.toLowerCase().includes(q) ||
      (l.description && l.description.toLowerCase().includes(q));
    const matchesTag = !activeTag || (l.tags && l.tags.includes(activeTag));
    return matchesQ && matchesTag;
  });

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard.");
    } catch {
      alert("Failed to copy link.");
    }
  };

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
        <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Important <span className="text-indigo-700 dark:text-indigo-600 font-extrabold">Links</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
          Bookmark bergaya Notion: favicon, judul, deskripsi, domain, tag, dan aksi cepat.
        </motion.p>

        {/* Quick CTA (optional) */}
        <motion.div variants={fadeUp} className="mt-5">
          
        </motion.div>
      </motion.section>

      {/* Filters */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari judul/url/desk…"
              className="w-72 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="w-48 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              value={activeTag}
              onChange={(e) => setActiveTag(e.target.value)}
            >
              <option value="">Semua Tag</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-slate-600">
            Total: <span className="font-semibold text-slate-900">{filtered.length}</span> link
          </div>
        </div>
      </section>

      {/* Notion-style cards */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-14">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {filtered.map((l) => {
            const domain = domainFromUrl(l.url);
            const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

            return (
              <motion.article
                key={l.id}
                variants={fadeUp}
                className="group flex items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-md transition"
              >
                {/* Text left */}
                <div className="flex min-w-0 flex-1 flex-col p-4">
                  <div className="mb-1 flex items-center gap-2">
                    {/* Using <img> for remote favicon (no next.config change needed) */}
                    <img src={favicon} alt="" className="h-5 w-5 rounded" />
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="line-clamp-2 font-semibold text-slate-900 hover:underline"
                      title={l.title}
                    >
                      {l.title}
                    </a>
                  </div>

                  <p className="mb-3 line-clamp-3 text-sm text-slate-600">
                    {l.description ?? "No description provided."}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">{domain}</span>
                    {l.tags?.map((t) => (
                      <span key={t} className="rounded bg-indigo-50 px-2 py-1 text-indigo-700">
                        {t}
                      </span>
                    ))}

                    <span className="ml-auto inline-flex items-center gap-1">
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-50"
                        title="Open link"
                      >
                        Open
                      </a>
                      <button
                        onClick={() => copy(l.url)}
                        className="rounded-md bg-indigo-600 px-2 py-1 text-white hover:bg-indigo-700"
                        title="Copy link"
                      >
                        Copy
                      </button>
                    </span>
                  </div>
                </div>

                {/* Thumbnail right (optional, remote OK) */}
                {l.image ? (
                  <div className="relative hidden w-40 shrink-0 bg-slate-100 sm:block md:w-48">
                    <img src={l.image} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : null}
              </motion.article>
            );
          })}

          {!filtered.length && (
            <div className="col-span-full rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              Tidak ada link yang cocok dengan filter.
            </div>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="mt-auto">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-6 text-center text-sm text-slate-500 dark:text-slate-300">
          © {new Date().getFullYear()} <strong className="text-indigo-700 dark:text-indigo-600">IMX</strong> Resources.
          All rights reserved.
        </div>
      </footer>
    </main>
  );
}

import { useState } from "react";
