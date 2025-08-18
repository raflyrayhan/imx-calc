// app/ebook/page.tsx
//ini keren banget wkwkwkwkkwwkkw

"use client";

import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

type EbookRow = {
  id: string;
  slug: string;
  title: string;
  author?: string | null;
  year?: number | null;
  pages?: number | null;
  tags?: string[] | null;
  pdfUrl: string | null;
  coverUrl?: string | null;
};

function bytesToNice(n?: number | null) {
  if (!n) return "";
  const units = ["B", "KB", "MB", "GB"];
  let idx = 0;
  let x = n;
  while (x >= 1024 && idx < units.length - 1) {
    x /= 1024;
    idx++;
  }
  return `${x.toFixed(idx ? 1 : 0)} ${units[idx]}`;
}

export default function EbookPage() {
  const [items, setItems] = useState<EbookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("");
  const [showUpload, setShowUpload] = useState(false);

  // Upload form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOverPdf, setDragOverPdf] = useState(false);
  const [dragOverCover, setDragOverCover] = useState(false);

  // Delete state
  const [busyId, setBusyId] = useState<string | null>(null);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ebooks", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setItems(json);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    items.forEach((b) => b.tags?.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((b) => {
      const matchesQ =
        !q ||
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)));
      const matchesTag = !activeTag || (b.tags && b.tags.includes(activeTag));
      return matchesQ && matchesTag;
    });
  }, [items, query, activeTag]);

  // Upload handlers
  const onPickPdf = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }
    setPdfFile(f);
  };
  const onPickCover = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Cover must be an image (JPG/PNG).");
      return;
    }
    setCoverFile(f);
  };

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setYear("");
    setTags("");
    setVisibility("PRIVATE");
    setPdfFile(null);
    setCoverFile(null);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required.");
    if (!pdfFile) return alert("PDF is required.");

    try {
      setIsSubmitting(true);
      const fd = new FormData();
      fd.append("title", title.trim());
      if (author.trim()) fd.append("author", author.trim());
      if (year) fd.append("year", String(year));
      if (tags.trim()) fd.append("tags", tags);
      fd.append("visibility", visibility);
      fd.append("pdf", pdfFile);
      if (coverFile) fd.append("cover", coverFile);

      const res = await fetch("/api/ebooks", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.error || "Upload failed");
      }
      resetForm();
      setShowUpload(false);
      await reload();
      alert("E-Book uploaded successfully.");
    } catch (err: any) {
      alert(err?.message || "Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}" permanently? This will remove the PDF and cover.`)) return;
    try {
      setBusyId(id);
      const res = await fetch(`/api/ebooks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const e = await res.json().catch(() => ({} as any));
        throw new Error(e?.error || "Delete failed");
      }
      await reload();
    } catch (e: any) {
      alert(e?.message || "Delete failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col">
      {/* BG */}
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
          E-Book <span className="text-indigo-700 dark:text-indigo-600 font-extrabold">Library</span>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300"
        >
          Colections of e-books, articles, and resources for learning journey.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={() => setShowUpload((s) => !s)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            <Upload className="h-4 w-4" />
            {showUpload ? "Close Uploader" : "Upload E-Book"}
          </button>
        </motion.div>
      </motion.section>

      {/* Upload panel */}
      {showUpload && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-6">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                <input
                  type="number"
                  inputMode="numeric"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={year}
                  onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
                  placeholder="2025"
                  min={1900}
                  max={3000}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="OpenFOAM, CFD, Meshing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
                >
                  <option value="PRIVATE">Private (signed URL)</option>
                  <option value="PUBLIC">Public</option>
                </select>
              </div>
            </div>

            {/* File pickers */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* PDF */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">PDF File * (application/pdf)</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverPdf(true);
                  }}
                  onDragLeave={() => setDragOverPdf(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverPdf(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) onPickPdf(f);
                  }}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${
                    dragOverPdf ? "border-indigo-600 bg-indigo-50" : "border-slate-300"
                  }`}
                >
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => onPickPdf(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Choose PDF
                  </button>
                  <p className="mt-2 text-xs text-slate-600">or drag & drop your PDF here</p>

                  {pdfFile && (
                    <div className="mt-3 flex items-start gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left">
                      <div className="grow">
                        <div className="text-sm font-medium text-slate-900 line-clamp-1">{pdfFile.name}</div>
                        <div className="text-xs text-slate-600">{bytesToNice(pdfFile.size)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPdfFile(null);
                          if (pdfInputRef.current) pdfInputRef.current.value = "";
                        }}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100"
                        aria-label="Remove PDF"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cover (optional, JPG/PNG)</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverCover(true);
                  }}
                  onDragLeave={() => setDragOverCover(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverCover(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) onPickCover(f);
                  }}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${
                    dragOverCover ? "border-indigo-600 bg-indigo-50" : "border-slate-300"
                  }`}
                >
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPickCover(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Choose Image
                  </button>
                  <p className="mt-2 text-xs text-slate-600">or drag & drop a JPG/PNG cover</p>

                  {coverFile && (
                    <div className="mt-3 flex items-start gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left">
                      <div className="grow">
                        <div className="text-sm font-medium text-slate-900 line-clamp-1">{coverFile.name}</div>
                        <div className="text-xs text-slate-600">{bytesToNice(coverFile.size)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCoverFile(null);
                          if (coverInputRef.current) coverInputRef.current.value = "";
                        }}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100"
                        aria-label="Remove Cover"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowUpload(false);
                }}
                className="rounded-full px-4 py-2 text-sm font-semibold border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-60"
                disabled={isSubmitting}
              >
                <Upload className="h-4 w-4" />
                {isSubmitting ? "Uploading…" : "Upload E-Book"}
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Note: secure this uploader for admins only in production.
            </p>
          </form>
        </section>
      )}

      {/* Filters */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari judul/penulis/tag…"
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
            {loading ? (
              "Loading…"
            ) : (
              <>
                Total: <span className="font-semibold text-slate-900">{filtered.length}</span> item
              </>
            )}
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-14">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((b) => (
            <motion.article
              key={b.id}
              variants={fadeUp}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-md transition"
            >
              <div className="relative h-48 w-full bg-slate-100">
                {b.coverUrl ? (
                  <img src={b.coverUrl} alt={b.title} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">No Cover</div>
                )}
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <h3 className="line-clamp-2 font-semibold text-slate-900">{b.title}</h3>
                  <p className="text-sm text-slate-600">
                    {b.author ?? "Unknown"} {b.year ? `• ${b.year}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  {b.tags?.map((t) => (
                    <span key={t} className="rounded bg-indigo-50 px-2 py-1 text-indigo-700">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {b.pdfUrl ? (
                    <>
                      <a
                        href={b.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        View
                      </a>
                      <a
                        href={b.pdfUrl}
                        download
                        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Download
                      </a>
                    </>
                  ) : (
                    <span className="text-sm text-slate-500">Unavailable</span>
                  )}

                  {/* Delete (admin-only in production) */}
                  <button
                    onClick={() => handleDelete(b.id, b.title)}
                    className="ml-auto inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                    disabled={busyId === b.id}
                    title="Delete this e-book"
                  >
                    {busyId === b.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}

          {!loading && !filtered.length && (
            <div className="col-span-full rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              Tidak ada e-book yang cocok dengan filter.
            </div>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="mt-auto">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-6 text-center text-sm text-slate-500 dark:text-slate-300">
          © {new Date().getFullYear()} <strong className="text-indigo-700 dark:text-indigo-600">IMX</strong> Library. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
