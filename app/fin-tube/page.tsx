// app/fin-tube/page.tsx
"use client";

import { useMemo, useState, ChangeEvent } from "react";
import Image from "next/image";
import DocMetaForm from "@/components/DocMetaForm";
import { printCalculationPdf, type DocMeta } from "@/lib/pdf";
import { computeFinTube, type FinTubeInput } from "@/lib/fin-tube";
import { finTubePdfAdapter } from "@/lib/pdf-adapters/fin-tube";

export default function FinTubePage() {
  const [doc, setDoc] = useState<DocMeta>({
    date: new Date().toISOString().slice(0, 10),
    documentTitle: "Fin Tube Surface Area Calculator",
  });

  const [form, setForm] = useState<FinTubeInput>({
    Do: 0.073,
    L: 15.6,
    Nf: 276,
    Df: 0.111,
    tf: 0.0013,
    Nt: 48,
  });

  const [description, setDescription] = useState("");

  const result = useMemo(() => computeFinTube(form), [form]);

  const onNum =
    (name: keyof FinTubeInput) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = Number(String(e.target.value).replace(",", "."));
      setForm((prev) => ({ ...prev, [name]: Number.isFinite(v) ? v : 0 }));
    };

  const inputCls =
    "text-black w-full border border-slate-300 rounded-none px-3 py-2 " +
    "focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-center text-3xl md:text-4xl font-extrabold text-indigo-900">
          Fin Tube Surface Area Calculator
        </h1>

        {/* Optional diagram */}
        <div className="mt-4 flex justify-center">
          {/* Replace with your image path if available in public/ */}
          <Image
            src="/fin_tube_diagram.jpg"
            alt="Fin Tube Diagram"
            width={600}
            height={300}
            className="h-auto w-auto rounded-md border border-slate-200"
          />
        </div>

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
            {/* Inputs */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card title="Geometry & Fins">
                <Field label="Outer Diameter Do [m]">
                  <input type="number" className={inputCls} value={form.Do} step="0.0001" onChange={onNum("Do")} />
                </Field>
                <Field label="Tube Length L [m]">
                  <input type="number" className={inputCls} value={form.L} step="0.1" onChange={onNum("L")} />
                </Field>
                <Field label="Fins per Meter Nf [1/m]">
                  <input type="number" className={inputCls} value={form.Nf} onChange={onNum("Nf")} />
                </Field>
                <Field label="Fin Outer Diameter Df [m]">
                  <input type="number" className={inputCls} value={form.Df} step="0.0001" onChange={onNum("Df")} />
                </Field>
                <Field label="Fin Thickness tf [m]">
                  <input type="number" className={inputCls} value={form.tf} step="0.0001" onChange={onNum("tf")} />
                </Field>
                <Field label="Total Number of Tubes Nt [-]">
                  <input type="number" className={inputCls} value={form.Nt} onChange={onNum("Nt")} />
                </Field>
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
                onClick={() => setForm({ ...form })} // trigger recompute
              >
                Calculate
              </button>

              <button
                className="w-full rounded-none border border-indigo-600 bg-white text-indigo-700 py-3 font-semibold hover:bg-indigo-50"
                onClick={() =>
                  printCalculationPdf(finTubePdfAdapter, form, result, {
                    description,
                    meta: doc,
                  })
                }
              >
                Print PDF
              </button>
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 p-4">
                <ul className="list-disc pl-5 text-sm">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Results */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card title="Areas (per tube)">
                <Row k="Bare Tube Area Abt" v={result.Abt} unit="m²" digits={4} />
                <Row k="Total Fin Surface Area Af" v={result.Af} unit="m²" digits={4} />
                <Row k="Total Fin Edge Area Ap" v={result.Ap} unit="m²" digits={4} />
                <Row k="Total Surface Area per Tube Atube" v={result.Atube} unit="m²" digits={4} />
              </Card>

              <Card title="Total (all tubes)">
                <Row k={`Total Surface Area for ${form.Nt} Tubes`} v={result.Atotal} unit="m²" digits={4} />
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

function Row({ k, v, unit, digits = 4 }: { k: string; v: number; unit?: string; digits?: number }) {
  const text = Number.isFinite(v) ? v.toFixed(digits) : "-";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">{k}</span>
      <span className="font-semibold text-slate-900">
        {text} {unit ?? ""}
      </span>
    </div>
  );
}
