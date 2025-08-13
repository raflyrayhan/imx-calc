// app/cfd/page.tsx
"use client";

import { useMemo, useState, ChangeEvent } from "react";
import {
  computeCfdComplexity,
  GEOMETRY_OPTIONS,
  PHYSICS_OPTIONS,
  SOLVER_OPTIONS,
  MESH_OPTIONS,
  POST_OPTIONS,
  type CfdInput,
  type Score,
} from "@/lib/cfd";
import { printCalculationPdf } from "@/lib/pdf";
import { cfdPdfAdapter } from "@/lib/pdf-adapters/cfd";
import { DocMeta } from "@/lib/pdf";
import DocMetaForm from "@/components/DocMetaForm";

export default function CfdClassifierPage() {
        const [doc, setDoc] = useState<DocMeta>({
        date: new Date().toISOString().slice(0,10),
        });
  const [form, setForm] = useState<CfdInput>({
    geometry: 1,
    physics: 1,
    solver: 1,
    mesh: 1,
    post: 1,
  });

  const [description, setDescription] = useState("");

  const result = useMemo(() => computeCfdComplexity(form), [form]);

  const onChange =
    (name: keyof CfdInput) =>
    (e: ChangeEvent<HTMLSelectElement>) => {
      const v = Number(e.target.value) as Score;
      setForm((prev) => ({ ...prev, [name]: v }));
    };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Brand */}
      <div className="py-6 text-center">
        <div className="inline-flex items-center gap-2">
          <div className="text-indigo-700 font-extrabold tracking-widest text-xl">
            INFIMECH
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-center text-3xl md:text-4xl font-extrabold text-indigo-900">
          CFD Study Complexity Classifier
        </h1>

            <section className="mt-6 bg-white shadow rounded-2xl border border-slate-100 text-black">
            <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
            </section>

        {/* Card */}
        <section className="mt-10 bg-white shadow-xl rounded-2xl border border-slate-100">
          <header className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold text-slate-900 text-center">
              Input Data
            </h2>
          </header>

            

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="1. Geometry Complexity">
                <select
                  className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-black"
                  value={form.geometry}
                  onChange={onChange("geometry")}
                >
                  {GEOMETRY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="2. Physics Involved">
                <select
                  className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-black"
                  value={form.physics}
                  onChange={onChange("physics")}
                >
                  {PHYSICS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="3. Solver & Turbulence Model">
                <select
                  className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-black"
                  value={form.solver}
                  onChange={onChange("solver")}
                >
                  {SOLVER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="4. Boundary & Mesh Complexity">
                <select
                  className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-black"
                  value={form.mesh}
                  onChange={onChange("mesh")}
                >
                  {MESH_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="5. Post-processing & Validation">
                <select
                  className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-black"
                  value={form.post}
                  onChange={onChange("post")}
                >
                  {POST_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Optional description for PDF header */}
            <Field label="Deskripsi (opsional)">
              <textarea
                className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-black"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tambahkan keterangan untuk dicetak di PDF (opsional)"
              />
            </Field>

            {/* Classify */}
            <div className="mt-2">
              <button
                className="w-full rounded-full py-4 text-white font-semibold text-lg shadow-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95"
                onClick={() => setForm({ ...form })} // recompute (memo already updates on change)
              >
                Classify Study
              </button>
            </div>

            {/* Print */}
            <div className="mt-3">
              <button
                className="w-full rounded-full py-3 text-indigo-700 border border-indigo-300 bg-white hover:bg-indigo-50"
                onClick={() =>
                 printCalculationPdf(cfdPdfAdapter, form, result, { description, meta: doc })
                }
              >
                Cetak PDF
              </button>
            </div>

            {/* Results */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card title="Classification Result">
                <div className="text-2xl font-extrabold text-indigo-700">
                  {result.level}
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  Average score: <strong>{result.average.toFixed(2)}</strong>
                </div>
              </Card>

              <Card title="Scores">
                <Row k="Geometry" v={result.scores.geometry} />
                <Row k="Physics" v={result.scores.physics} />
                <Row k="Solver" v={result.scores.solver} />
                <Row k="Mesh" v={result.scores.mesh} />
                <Row k="Post-processing" v={result.scores.post} />
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------- small UI helpers ---------- */
function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-slate-700 mb-2">{props.label}</div>
      {props.children}
    </label>
  );
}

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 bg-white shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4">{props.title}</h3>
      <div className="space-y-2">{props.children}</div>
    </div>
  );
}

function Row({ k, v, unit }: { k: string; v: number; unit?: string }) {
  const text = Number.isFinite(v) ? v.toFixed(2) : "-";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">{k}</span>
      <span className="font-semibold text-slate-900">
        {text} {unit ?? ""}
      </span>
    </div>
  );
}
