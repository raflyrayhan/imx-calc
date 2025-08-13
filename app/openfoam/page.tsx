// app/openfoam/page.tsx
"use client";

import { useMemo, useState, ChangeEvent } from "react";
import DocMetaForm from "@/components/DocMetaForm";
import { printCalculationPdf, type DocMeta } from "@/lib/pdf";
import { recommendOpenFoamSolver, type OpenFoamInput } from "@/lib/openfoam";
import { openfoamPdfAdapter } from "@/lib/pdf-adapters/openfoam";

export default function OpenFoamSolverPage() {
  const [doc, setDoc] = useState<DocMeta>({
    date: new Date().toISOString().slice(0, 10),
    documentTitle: "OpenFOAM CFD Solver Selector",
  });

  const [form, setForm] = useState<OpenFoamInput>({
    compressibility: "incompressible",
    flowType: "single",
    heatTransfer: "no",
    time: "steady",
    turbulence: "laminar",
    special: "none",
  });

  const [description, setDescription] = useState("");
  const result = useMemo(() => recommendOpenFoamSolver(form), [form]);

  const inputCls =
    "text-black w-full border border-slate-300 rounded-none px-3 py-2 " +
    "focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500";

  const onSel =
    <K extends keyof OpenFoamInput>(name: K) =>
    (e: ChangeEvent<HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [name]: e.target.value as OpenFoamInput[K] }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-center text-3xl md:text-4xl font-extrabold text-slate-900">
          OpenFOAM CFD Solver Selector
        </h1>

        {/* Document Info */}
        <section className="mt-6 bg-white shadow rounded-2xl border border-slate-200">
          <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
        </section>

        {/* Form + Results */}
        <section className="mt-8 bg-white shadow-xl rounded-2xl border border-slate-100">
          <header className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold text-slate-900 text-center">Input Data</h2>
          </header>

          <div className="p-6 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <Card title="Flow & Physics">
                <Field label="Compressibility">
                  <select className={inputCls} value={form.compressibility} onChange={onSel("compressibility")}>
                    <option value="incompressible">Incompressible</option>
                    <option value="compressible">Compressible</option>
                  </select>
                </Field>

                <Field label="Flow Type">
                  <select className={inputCls} value={form.flowType} onChange={onSel("flowType")}>
                    <option value="single">Single-phase</option>
                    <option value="multiphase">Multiphase</option>
                  </select>
                </Field>

                <Field label="Heat Transfer?">
                  <select className={inputCls} value={form.heatTransfer} onChange={onSel("heatTransfer")}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </Field>

                <Field label="Time Dependency">
                  <select className={inputCls} value={form.time} onChange={onSel("time")}>
                    <option value="steady">Steady-State</option>
                    <option value="transient">Transient</option>
                  </select>
                </Field>

                <Field label="Turbulence">
                  <select className={inputCls} value={form.turbulence} onChange={onSel("turbulence")}>
                    <option value="laminar">Laminar</option>
                    <option value="turbulent">Turbulent</option>
                  </select>
                </Field>
              </Card>

              <Card title="Special Requirements">
                <Field label="Special">
                  <select className={inputCls} value={form.special} onChange={onSel("special")}>
                    <option value="none">None</option>
                    <option value="chemical">Chemical Reaction</option>
                    <option value="porous">Porous Media</option>
                    <option value="region">Multi-Region (CHT)</option>
                  </select>
                </Field>

                <div className="rounded-md border border-slate-200 p-3 bg-slate-50 text-sm text-slate-700">
                  Choose any special physics that dominate the setup. These rules override the generic selection.
                </div>
              </Card>
            </div>

            {/* Description for PDF */}
            <Field label="Description (optional)">
              <textarea
                className={inputCls}
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notes to appear under the PDF title (optional)"
              />
            </Field>

            {/* Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                className="w-full rounded-none border border-indigo-600 bg-indigo-600 text-white py-3 font-semibold hover:opacity-95"
                onClick={() => null}
              >
                Recalculate
              </button>

              <button
                className="w-full rounded-none border border-indigo-600 bg-white text-indigo-700 py-3 font-semibold hover:bg-indigo-50"
                onClick={() =>
                  printCalculationPdf(openfoamPdfAdapter, form, result, {
                    description,
                    meta: doc,
                  })
                }
              >
                Print PDF
              </button>
            </div>

            {/* Result */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card title="Recommended Solver">
                <div className="text-lg font-semibold text-indigo-700">{result.solver}</div>
              </Card>

              <Card title="Rationale / Notes">
                <ul className="list-disc pl-5 text-sm text-slate-700">
                  {result.rationale.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------- UI helpers ---------- */
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
