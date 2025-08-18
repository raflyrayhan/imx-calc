// app/analytics/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type ProjectDash = {
  id: string;
  code: string;
  name: string;
  status?: "Planning" | "On-Going" | "Hold" | "Closed";
  iframeSrc: string;
  height?: number;
};

const PROJECTS: ProjectDash[] = [
  {
    id: "revamp-desalter-cdu-v",
    code: "CDU-V",
    name: "Revamping Desalter CDU V",
    status: "On-Going",
    iframeSrc:
      "https://lookerstudio.google.com/embed/reporting/5e76502a-6be8-4101-88ed-4969c4fe601d/page/p_gowwxy1wud",
    height: 940,
  },
  {
    id: "saka-dev-3ph-sep",
    code: "SDP-3PH",
    name: "Saka Development – 3-Phase Separator",
    status: "Planning",
    iframeSrc:
      "https://lookerstudio.google.com/embed/reporting/fb56718b-b6bb-4a2b-a819-25ae57b8f1ef/page/p_djuedrkrud",
    height: 940,
  },
  {
    id: "cba-ammonia-heater",
    code: "CBA-HEAT",
    name: "CBA – Ammonia Heater Upgrade",
    status: "On-Going",
    iframeSrc:
      "https://lookerstudio.google.com/embed/reporting/zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz/page/1M",
    height: 940,
  },
];

type LayoutMode = "sidebar" | "top";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function EpcErpAnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-600">Loading dashboards…</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}

function AnalyticsContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [layout, setLayout] = useState<LayoutMode>("sidebar");

  // hydrate from URL
  useEffect(() => {
    const pid = params.get("project");
    const ly = (params.get("layout") as LayoutMode) || "sidebar";

    if (ly === "sidebar" || ly === "top") setLayout(ly);
    if (pid && PROJECTS.some((p) => p.id === pid)) {
      setSelectedId(pid);
    } else if (!pid && PROJECTS.length) {
      setSelectedId(PROJECTS[0].id);
    }
  }, [params]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROJECTS;
    return PROJECTS.filter((p) =>
      [p.code, p.name, p.status].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [query]);

  const selected = useMemo(
    () => PROJECTS.find((p) => p.id === selectedId),
    [selectedId]
  );

  const updateUrl = (next: Partial<{ project: string; layout: LayoutMode }>) => {
    // build a new query string from current params
    const sp = new URLSearchParams(Array.from(params.entries()));
    if (next.project) sp.set("project", next.project);
    if (next.layout) sp.set("layout", next.layout);
    router.replace(`?${sp.toString()}`, { scroll: false });
  };

  const pickProject = (id: string) => {
    setSelectedId(id);
    updateUrl({ project: id });
  };

  const switchLayout = (mode: LayoutMode) => {
    setLayout(mode);
    updateUrl({ layout: mode });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Project Dashboards</h1>
            <p className="text-slate-600">Pilih satu proyek untuk ditampilkan.</p>
          </div>

          {/* Layout toggle */}
          <div className="inline-flex overflow-hidden rounded-md border border-slate-300 bg-white">
            <button
              onClick={() => switchLayout("sidebar")}
              className={`px-3 py-1.5 text-sm ${
                layout === "sidebar" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Sidebar
            </button>
            <button
              onClick={() => switchLayout("top")}
              className={`px-3 py-1.5 text-sm ${
                layout === "top" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Topbar
            </button>
          </div>
        </div>

        {layout === "sidebar" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Narrow project list */}
            <aside className="lg:col-span-3">
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Cari project (kode/nama/status)…"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="max-h-[65vh] overflow-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead className="sticky top-0 bg-slate-100 text-left text-slate-700">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Code</th>
                        <th className="px-3 py-2">Project</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => {
                        const active = p.id === selectedId;
                        return (
                          <tr
                            key={p.id}
                            className={`cursor-pointer border-t border-slate-200 hover:bg-slate-50 ${
                              active ? "bg-blue-50" : ""
                            }`}
                            onClick={() => pickProject(p.id)}
                          >
                            <td className="px-3 py-2 align-middle">
                              <input
                                type="radio"
                                name="project"
                                className="h-4 w-4 accent-blue-600"
                                checked={active}
                                onChange={() => pickProject(p.id)}
                                aria-label={`Select ${p.name}`}
                              />
                            </td>
                            <td className="px-3 py-2 font-medium text-slate-900">{p.code}</td>
                            <td className="px-3 py-2 text-slate-800 truncate max-w-[10rem]" title={p.name}>
                              {p.name}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] ${
                                  p.status === "On-Going"
                                    ? "bg-green-100 text-green-700"
                                    : p.status === "Planning"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : p.status === "Hold"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {p.status ?? "-"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {!filtered.length && (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                            Tidak ada proyek yang cocok dengan filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </aside>

            {/* Right: wider Looker iframe */}
            <section className="lg:col-span-9">
              <div className="rounded-lg border border-slate-200 bg-white">
                <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {selected ? selected.name : "No project selected"}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {selected ? selected.code : "Pilih proyek di panel kiri"}
                    </p>
                  </div>
                  {selected?.iframeSrc && (
                    <a
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      href={selected.iframeSrc.replace("/embed/", "/")}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Looker Studio
                    </a>
                  )}
                </header>
                <div className="relative w-full" style={{ height: (selected?.height ?? 940) + 0 }}>
                  {selected?.iframeSrc ? (
                    <iframe
                      key={selected.id}
                      title={selected.name}
                      src={selected.iframeSrc}
                      width="100%"
                      height="100%"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="flex h-[420px] items-center justify-center text-slate-500">
                      Pilih proyek untuk menampilkan dashboard.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ======= TOPBAR LAYOUT (list above) ======= */}
        {layout === "top" && (
          <div className="space-y-4">
            {/* Top controls */}
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <input
                  type="text"
                  placeholder="Cari project (kode/nama/status)…"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 md:max-w-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="text-sm text-slate-600">
                  Selected:{" "}
                  <span className="font-semibold text-slate-900">
                    {selected ? selected.code : "—"}
                  </span>
                </div>
              </div>

              {/* Compact horizontal list (chips) */}
              <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
                {filtered.map((p) => {
                  const active = p.id === selectedId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => pickProject(p.id)}
                      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                      }`}
                      title={p.name}
                    >
                      <span className="font-medium">{p.code}</span>{" "}
                      <span className="opacity-80">— {p.name}</span>
                    </button>
                  );
                })}
                {!filtered.length && (
                  <div className="px-2 py-1.5 text-sm text-slate-500">
                    Tidak ada proyek yang cocok dengan filter.
                  </div>
                )}
              </div>
            </div>

            {/* Full-width Looker iframe */}
            <div className="rounded-lg border border-slate-200 bg-white">
              <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selected ? selected.name : "No project selected"}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {selected ? selected.code : "Pilih proyek di daftar atas"}
                  </p>
                </div>
                {selected?.iframeSrc && (
                  <a
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    href={selected.iframeSrc.replace("/embed/", "/")}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Looker Studio
                  </a>
                )}
              </header>
              <div className="relative w-full" style={{ height: (selected?.height ?? 940) + 0 }}>
                {selected?.iframeSrc ? (
                  <iframe
                    key={selected.id}
                    title={selected.name}
                    src={selected.iframeSrc}
                    width="100%"
                    height="100%"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex h-[420px] items-center justify-center text-slate-500">
                    Pilih proyek untuk menampilkan dashboard.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
