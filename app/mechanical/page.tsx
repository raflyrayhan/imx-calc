// app/mechanical/page.tsx
"use client";

import { useMemo, useState, ChangeEvent } from "react";
import {
  MATERIAL_DB,
  MaterialKey,
  MixType,
  computeMechanicalMix,
} from "@/lib/mechanical";
import { printCalculationPdf } from "@/lib/pdf";
import { mechanicalPdfAdapter } from "@/lib/pdf-adapters/mechanical";
import DocMetaForm from "@/components/DocMetaForm";
import { DocMeta } from "@/lib/pdf";

type Row = { material: MaterialKey; percent: number };

export default function MechanicalEstimatorPage() {

    const [doc, setDoc] = useState<DocMeta>({
        date: new Date().toISOString().slice(0,10),
        });

  const [type, setType] = useState<MixType>("alloy");
  const [rows, setRows] = useState<Row[]>([
    { material: "Carbon Steel", percent: 100 },
  ]);
  const [description, setDescription] = useState("");

  const result = useMemo(
    () => computeMechanicalMix({ type, components: rows }),
    [type, rows]
  );

  const materials = Object.keys(MATERIAL_DB) as MaterialKey[];

  const totalPct = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.percent) || 0), 0),
    [rows]
  );

  const addRow = () =>
    setRows((r) => [...r, { material: "Carbon Steel", percent: 0 }]);

  const removeRow = (idx: number) =>
    setRows((r) => (r.length > 1 ? r.filter((_, i) => i !== idx) : r));

  const updateRow = (idx: number, patch: Partial<Row>) =>
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  const onPercentChange =
    (idx: number) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = Number(String(e.target.value).replace(",", "."));
      updateRow(idx, { percent: Number.isFinite(v) ? v : 0 });
    };

  const onMaterialChange =
    (idx: number) =>
    (e: ChangeEvent<HTMLSelectElement>) => {
      updateRow(idx, { material: e.target.value as MaterialKey });
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

      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-center text-3xl md:text-4xl font-extrabold text-indigo-900">
          Estimator Sifat Mekanik Material Campuran
        </h1>

            <section className="mt-6 bg-white shadow rounded-2xl border border-slate-100">
            <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
            </section>

        <section className="mt-10 bg-white shadow-xl rounded-2xl border border-slate-100">
          <header className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold text-slate-900 text-center">
              Input Data
            </h2>
          </header>

          <div className="p-6 space-y-6">
            {/* Mix type + total */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Jenis Campuran">
                <select
                  className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  value={type}
                  onChange={(e) => setType(e.target.value as MixType)}
                >
                  <option value="alloy">Alloy</option>
                  <option value="composite">Composite</option>
                </select>
              </Field>

              <Field label="Total Komposisi">
                <div className="w-full rounded-xl border border-slate-200 px-4 py-2 bg-slate-50">
                  <strong>{totalPct.toFixed(2)}%</strong>
                  <span className="text-slate-500 ml-2"> (harus 100%)</span>
                </div>
              </Field>
            </div>

            {/* Components */}
            <div className="space-y-3">
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-3 items-center"
                >
                  <div className="col-span-7 md:col-span-8">
                    <label className="text-sm text-slate-700">Material</label>
                    <select
                      className="mt-1 w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                      value={row.material}
                      onChange={onMaterialChange(idx)}
                    >
                      {materials.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4 md:col-span-3">
                    <label className="text-sm text-slate-700">% Komposisi</label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                      value={row.percent}
                      min={0}
                      max={100}
                      onChange={onPercentChange(idx)}
                    />
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button
                      className="mt-6 inline-flex items-center justify-center rounded-full w-10 h-10 border border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                      onClick={() => removeRow(idx)}
                      title="Hapus baris"
                      disabled={rows.length === 1}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <button
                  className="rounded-full px-4 py-2 border border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                  onClick={addRow}
                >
                  Tambah Material
                </button>
              </div>
            </div>

            {/* Optional description for PDF header */}
            <Field label="Deskripsi (opsional)">
              <textarea
                className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tambahkan keterangan untuk dicetak di PDF (opsional)"
              />
            </Field>

            {/* Calculate */}
            <div>
              <button
                className="w-full rounded-full py-4 text-white font-semibold text-lg shadow-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95"
                onClick={() => setRows((r) => [...r])} // trigger recompute explicitly
              >
                Hitung Sifat Mekanik
              </button>
            </div>

            {/* Print */}
            {result && (
              <div className="mt-3">
                <button
                  className="w-full rounded-full py-3 text-indigo-700 border border-indigo-300 bg-white hover:bg-indigo-50"
                  onClick={() =>
                    printCalculationPdf(mechanicalPdfAdapter, { type, rows }, result, {
                    description,
                    meta: doc,
                    })
                  }
                >
                  Cetak PDF
                </button>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 p-4">
                <ul className="list-disc pl-5">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Results */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card title="Output Estimasi – Sifat Mekanik">
                <Row k="Tensile Strength (UTS)" v={result.properties.tensile} unit="MPa" />
                <Row k="Elongation" v={result.properties.elongation} unit="%" />
                <Row k="Young's Modulus" v={result.properties.E} unit="GPa" />
                <Row k="Hardness (Brinell, est.)" v={result.properties.hardness} unit="HB" />
                <Row k="Toughness" v={result.properties.toughness} unit="kJ/m²" />
                <Row k="Fatigue Strength" v={result.properties.fatigue} unit="MPa" />
                <Row k="Density" v={result.properties.density} unit="kg/m³" />
                <p className="text-xs text-slate-500 mt-2">
                  Metode: rata-rata berbobot (rule of mixtures linear) untuk estimasi awal.
                </p>
              </Card>

              <Card title="Catatan">
                <p className="text-sm text-slate-600">
                  Hasil bersifat perkiraan. Untuk desain, gunakan data material spesifik
                  (grade, perlakuan panas, orientasi serat).
                </p>
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
      <div className="text-sm font-semibold text-slate-700 mb-2">
        {props.label}
      </div>
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

function Row({
  k,
  v,
  unit,
  digits = 2,
}: {
  k: string;
  v: number;
  unit?: string;
  digits?: number;
}) {
  const text =
    typeof v === "number" && Number.isFinite(v) ? v.toFixed(digits) : "-";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">{k}</span>
      <span className="font-semibold text-slate-900">
        {text} {unit ?? ""}
      </span>
    </div>
  );
}
