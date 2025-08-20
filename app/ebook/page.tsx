// app/ebook/page.tsx
"use client";

import { motion } from "framer-motion";
import {
  Upload, X, Eye, Download, Pencil, Check, XCircle, Tags, Filter, ChevronDown, Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

type Category = "EBOOK" | "DATASHEET" | "STANDARD_DRAWING" | "CODE_STANDARD";
const CATEGORY_LABEL: Record<Category, string> = {
  EBOOK: "E-books",
  DATASHEET: "Datasheets",
  STANDARD_DRAWING: "Standard Drawings",
  CODE_STANDARD: "Code Standards",
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
  category?: Category;
};

function bytesToNice(n?: number | null) {
  if (!n) return "";
  const units = ["B", "KB", "MB", "GB"];
  let idx = 0; let x = n;
  while (x >= 1024 && idx < units.length - 1) { x /= 1024; idx++; }
  return `${x.toFixed(idx ? 1 : 0)} ${units[idx]}`;
}

export default function EbookPage() {
  const [items, setItems] = useState<EbookRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<Category>("EBOOK");

  // Sidebar (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Upload
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [category, setCategory] = useState<Category>("EBOOK");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOverPdf, setDragOverPdf] = useState(false);
  const [dragOverCover, setDragOverCover] = useState(false);

  // Row states
  const [busyId, setBusyId] = useState<string | null>(null);
  const [preview, setPreview] = useState<EbookRow | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTagsText, setEditTagsText] = useState("");

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(async (opts?: { category?: Category }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (activeTag) params.set("tag", activeTag);
      const cat = opts?.category ?? activeCategory;
      if (cat) params.set("category", cat);

      const res = await fetch(`/api/ebooks?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setItems(json);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [query, activeTag, activeCategory]);

  useEffect(() => { reload(); }, [reload]);

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
      const matchesCat = !activeCategory || (b.category || "EBOOK") === activeCategory;
      return matchesQ && matchesTag && matchesCat;
    });
  }, [items, query, activeTag, activeCategory]);

  // Upload handlers
  const onPickPdf = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf") { alert("Please select a PDF file."); return; }
    setPdfFile(f);
  };
  const onPickCover = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { alert("Cover must be an image (JPG/PNG)."); return; }
    setCoverFile(f);
  };
  const resetForm = () => {
    setTitle(""); setAuthor(""); setYear(""); setTags("");
    setVisibility("PRIVATE"); setCategory("EBOOK");
    setPdfFile(null); setCoverFile(null);
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
      fd.append("category", category);
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

  // Row ops
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
  const startEditTags = (row: EbookRow) => {
    setEditingId(row.id);
    setEditTagsText((row.tags || []).join(", "));
  };
  const cancelEditTags = () => { setEditingId(null); setEditTagsText(""); };
  const saveEditTags = async (row: EbookRow) => {
    const res = await fetch(`/api/ebooks/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: editTagsText }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      alert(e?.error || "Failed to update tags");
      return;
    }
    setEditingId(null);
    setEditTagsText("");
    await reload();
  };

  const readTime = (pages?: number | null) => {
    if (!pages) return null;
    const mins = Math.max(1, Math.round((pages / 10) * 2));
    return `${mins} min read`;
  };

  const onPickCategory = async (cat: Category) => {
    setActiveCategory(cat);
    await reload({ category: cat });
  };

  return (
    <main className="relative min-h-screen">
      {/* BG */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Header */}
      <motion.section variants={container} initial="hidden" animate="show" className="mx-auto w-full max-w-6xl px-4 pt-14 pb-6 text-center">
        <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          E-Book <span className="text-indigo-700 dark:text-indigo-600 font-extrabold">Library</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
          Colections of e-books, articles, and resources for learning journey.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-5 flex items-center justify-center gap-3">
          <button onClick={() => setShowUpload((s) => !s)} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            {showUpload ? "Close Uploader" : "Upload E-Book"}
          </button>
          <button onClick={() => setSidebarOpen((s) => !s)} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 lg:hidden">
            <Filter className="h-4 w-4" /> Filters
            <ChevronDown className={`h-4 w-4 transition ${sidebarOpen ? "rotate-180" : ""}`} />
          </button>
        </motion.div>
      </motion.section>

      {/* Upload form */}
      {showUpload && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-6">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                <input className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600" value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                <input type="number" inputMode="numeric" className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600" value={year} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")} placeholder="2025" min={1900} max={3000} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                  {(Object.keys(CATEGORY_LABEL) as Category[]).map((k) => <option key={k} value={k}>{CATEGORY_LABEL[k]}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
                <input className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="OpenFOAM, CFD, Meshing" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
                <select className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600" value={visibility} onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}>
                  <option value="PRIVATE">Private (signed URL)</option>
                  <option value="PUBLIC">Public</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">PDF File * (application/pdf)</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverPdf(true); }}
                  onDragLeave={() => setDragOverPdf(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOverPdf(false); const f = e.dataTransfer.files?.[0]; if (f) onPickPdf(f); }}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${dragOverPdf ? "border-indigo-600 bg-indigo-50" : "border-slate-300"}`}
                >
                  <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => onPickPdf(e.target.files?.[0] ?? null)} />
                  <button type="button" onClick={() => pdfInputRef.current?.click()} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Choose PDF</button>
                  <p className="mt-2 text-xs text-slate-600">or drag & drop your PDF here</p>
                  {pdfFile && (
                    <div className="mt-3 flex items-start gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left">
                      <div className="grow">
                        <div className="text-sm font-medium text-slate-900 line-clamp-1">{pdfFile.name}</div>
                        <div className="text-xs text-slate-600">{bytesToNice(pdfFile.size)}</div>
                      </div>
                      <button type="button" onClick={() => { setPdfFile(null); if (pdfInputRef.current) pdfInputRef.current.value = ""; }} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Remove PDF">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cover (optional, JPG/PNG)</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverCover(true); }}
                  onDragLeave={() => setDragOverCover(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOverCover(false); const f = e.dataTransfer.files?.[0]; if (f) onPickCover(f); }}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${dragOverCover ? "border-indigo-600 bg-indigo-50" : "border-slate-300"}`}
                >
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPickCover(e.target.files?.[0] ?? null)} />
                  <button type="button" onClick={() => coverInputRef.current?.click()} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Choose Image</button>
                  <p className="mt-2 text-xs text-slate-600">or drag & drop a JPG/PNG cover</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button type="button" onClick={() => { resetForm(); setShowUpload(false); }} className="rounded-full px-4 py-2 text-sm font-semibold border border-slate-300 bg-white text-slate-800 hover:bg-slate-50" disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60" disabled={isSubmitting}>
                <Upload className="h-4 w-4" />{isSubmitting ? "Uploading…" : "Upload E-Book"}
              </button>
            </div>
          </form>
        </section>
      )}

{/* TWO-COLUMN: Sidebar (left) + Small Cards (right) */}
<div className="mx-auto w-full max-w-7xl px-4 pb-14 flex gap-6">
  {/* Sidebar — always visible on desktop */}
  <aside className="w-[280px] shrink-0 sticky top-6 self-start rounded-2xl border border-slate-200 bg-white shadow-sm p-4 hidden lg:block">
    <h3 className="text-sm font-semibold text-slate-900">Categories</h3>
    <div className="mt-3 grid grid-cols-1 gap-2">
      {(Object.keys(CATEGORY_LABEL) as Category[]).map((cat) => (
        <button
          key={cat}
          onClick={() => onPickCategory(cat)}
          className={`rounded-lg px-3 py-2 text-sm border transition text-left ${
            activeCategory === cat
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          {CATEGORY_LABEL[cat]}
        </button>
      ))}
    </div>

    <div className="h-px bg-slate-200 my-4" />

    <h3 className="text-sm font-semibold text-slate-900">Search</h3>
    <input
      type="text"
      placeholder="Cari judul/penulis/tag…"
      className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => { if (e.key === "Enter") reload(); }}
    />

    <div className="h-px bg-slate-200 my-4" />

    <h3 className="text-sm font-semibold text-slate-900">Tag Filter</h3>
    <select
      className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
      value={activeTag}
      onChange={(e) => setActiveTag(e.target.value)}
    >
      <option value="">Semua Tag</option>
      {allTags.map((t) => (<option key={t} value={t}>{t}</option>))}
    </select>

    <p className="mt-4 text-xs text-slate-500">
      {loading ? "Loading…" : <>Total: <span className="font-semibold text-slate-900">{filtered.length}</span> item</>}
    </p>
  </aside>

  {/* Mobile filters toggleable (optional) */}
  <aside className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm p-4 lg:hidden">
    <button
      onClick={() => setSidebarOpen((s) => !s)}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
    >
      {sidebarOpen ? "Hide Filters" : "Show Filters"}
    </button>
    {sidebarOpen && (
      <div className="mt-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Categories</h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(CATEGORY_LABEL) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => onPickCategory(cat)}
                className={`rounded-lg px-3 py-2 text-sm border transition text-left ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {CATEGORY_LABEL[cat]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Search</h3>
          <input
            type="text"
            placeholder="Cari judul/penulis/tag…"
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") reload(); }}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Tag Filter</h3>
          <select
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            value={activeTag}
            onChange={(e) => setActiveTag(e.target.value)}
          >
            <option value="">Semua Tag</option>
            {allTags.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
      </div>
    )}
  </aside>

  {/* Content (small cards) */}
  <section className="min-w-0 flex-1">
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {filtered.map((b) => {
        const isEditing = editingId === b.id;
        return (
          <motion.div key={b.id} variants={fadeUp} className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-full">
            {/* Image on top (small, fixed aspect) */}
           <div className="relative w-full overflow-hidden rounded-t-xl bg-slate-100 flex items-center justify-center">
              <div className="p-3">
                {b.coverUrl ? (
                  <img src={b.coverUrl} alt={b.title} className="max-h-32 w-auto object-contain rounded-md border border-gray-300 shadow-sm" loading="lazy"/>
                ) : (
                  <div className="h-32 w-24 flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 text-slate-400">
                    No Cover
                  </div>
                )}
              </div>
              <span className="absolute top-2 left-2 rounded-full bg-black/60 text-white text-[10px] px-2 py-0.5">
                            {CATEGORY_LABEL[(b.category || "EBOOK") as Category]}
                          </span>
            </div>


            {/* Text */}
            <div className="p-3 flex-1">
              <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{b.title}</h3>
              <p className="mt-0.5 text-xs text-slate-600 line-clamp-1">
                {b.author ?? "Unknown"} {b.year ? `• ${b.year}` : ""} {b.pages ? `• ${b.pages}p` : ""}
              </p>

              {!isEditing ? (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                  {(b.tags ?? []).length ? (b.tags ?? []).slice(0, 3).map((t) => (
                    <span key={t} className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700">{t}</span>
                  )) : <span className="text-slate-400">No tags</span>}
                  {(b.tags?.length ?? 0) > 3 && <span className="text-slate-400">+{(b.tags!.length - 3)}</span>}
                </div>
              ) : (
                <div className="mt-2 space-y-1.5">
                  <label className="block text-[11px] font-medium text-slate-700">Edit tags</label>
                  <input
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    value={editTagsText}
                    onChange={(e) => setEditTagsText(e.target.value)}
                    placeholder="CFD, OpenFOAM, Meshing"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-3 pb-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {b.pdfUrl ? (
                  <>
                    <button onClick={() => setPreview(b)} className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </button>
                    <a href={b.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
                      Open
                    </a>
                    <a href={b.pdfUrl} download className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  </>
                ) : (
                  <span className="text-xs text-slate-500">Unavailable</span>
                )}

                {!isEditing ? (
                  <button
                    onClick={() => { setEditingId(b.id); setEditTagsText((b.tags || []).join(", ")); }}
                    className="ml-auto inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </button>
                ) : (
                  <div className="ml-auto flex items-center gap-1.5">
                    <button onClick={() => saveEditTags(b)} className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                      <Check className="h-3.5 w-3.5" /> Save
                    </button>
                    <button onClick={cancelEditTags} className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
                      <XCircle className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(b.id, b.title)}
                  className="inline-flex items-center rounded-md border border-red-300 bg-white px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                  disabled={busyId === b.id}
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> {busyId === b.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}

      {!loading && !filtered.length && (
        <div className="col-span-full rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          Tidak ada file di kategori ini / tidak cocok dengan filter.
        </div>
      )}
    </motion.div>
  </section>
</div>

      {/* Scribd-like Preview */}
      {preview && preview.pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setPreview(null)} />
          <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <h4 className="truncate text-sm font-semibold text-slate-900">{preview.title}</h4>
                <p className="truncate text-xs text-slate-600">
                  {preview.author ?? "Unknown"} {preview.year ? `• ${preview.year}` : ""} {preview.pages ? `• ${preview.pages} pages` : ""}
                </p>
              </div>
              <button onClick={() => setPreview(null)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Close preview">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <div className="h-[72vh] overflow-hidden">
                <iframe title={`Preview ${preview.title}`} src={`${preview.pdfUrl}#view=FitH&toolbar=0&navpanes=0`} className="h-[120vh] w-full" />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-white/0" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 border-t border-slate-200 bg-white/90 px-4 py-3">
                <div className="text-xs text-slate-600">Enjoying the sample? Continue in the full PDF.</div>
                <div className="flex items-center gap-2">
                  <a href={preview.pdfUrl} target="_blank" rel="noreferrer" className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Read full PDF</a>
                  <a href={preview.pdfUrl} download className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <Download className="h-4 w-4" /> Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-10">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-6 text-center text-sm text-slate-500 dark:text-slate-300">
          © {new Date().getFullYear()} <strong className="text-indigo-700 dark:text-indigo-600">IMX</strong> Library. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
