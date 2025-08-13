// app/pyrolysis/page.tsx
"use client";

import { useMemo, useState, ChangeEvent } from "react";
import { computePyrolysis, PLASTICS, PlasticKey } from "@/lib/pyrolisis";
import { printCalculationPdf } from "@/lib/pdf";
import { pyrolysisPdfAdapter } from "@/lib/pdf-adapters/pyrolysis";
import DocMetaForm from "@/components/DocMetaForm";
import { DocMeta } from "@/lib/pdf";

export default function PyrolysisPage() {
  const [form, setForm] = useState({
    plastic: "PE" as PlasticKey,
    capacityKgPerDay: 11000,
    temperatureC: 500,
    residenceTimeMin: 30,
    yieldOilPct: 70,
    yieldGasPct: 20,
    yieldCharPct: 10,
  });

  const [doc, setDoc] = useState<DocMeta>({
  date: new Date().toISOString().slice(0,10),
});

  const [description, setDescription] = useState("");

  const result = useMemo(() => {
    try {
      return computePyrolysis(form);
    } catch {
      return null;
    }
  }, [form]);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "plastic" ? (value as PlasticKey) : Number(String(value).replace(",", ".")),
    }));
  };

  const plastOptions = Object.entries(PLASTICS).map(([k, v]) => ({
    key: k as PlasticKey,
    label: v.name,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Top brand */}
      <div className="py-6 text-center">
      </div>

      {/* Title */}
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-center text-3xl md:text-4xl font-extrabold text-indigo-900">
          Desain Reaktor Pirolisis (Plastik PE / PP / PS)
        </h1>

        <section className="mt-6 bg-white shadow rounded-2xl border border-slate-100">
        <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
        </section>  

        {/* Card */}
        <section className="mt-10 bg-white shadow-xl rounded-2xl border border-slate-100">
          <header className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold text-slate-900 text-center">Input Data</h2>
          </header>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-5">
              <Field label="Jenis Plastik">
                <select
                  name="plastic"
                  value={form.plastic}
                  onChange={onChange}
                  className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {plastOptions.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Kapasitas (kg/hari)">
                <input
                  type="number"
                  name="capacityKgPerDay"
                  value={form.capacityKgPerDay}
                  onChange={onChange}
                  className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </Field>

              <Field label="Suhu Operasi (°C)">
                <input
                  type="number"
                  name="temperatureC"
                  value={form.temperatureC}
                  onChange={onChange}
                  className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </Field>

              <Field label="Waktu Tinggal (menit)">
                <input
                  type="number"
                  name="residenceTimeMin"
                  value={form.residenceTimeMin}
                  onChange={onChange}
                  className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </Field>

              <Field label="Yield Bio-oil (%)">
                <input
                  type="number"
                  name="yieldOilPct"
                  value={form.yieldOilPct}
                  onChange={onChange}
                  className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </Field>

              <Field label="Yield Gas (%)">
                <input
                  type="number"
                  name="yieldGasPct"
                  value={form.yieldGasPct}
                  onChange={onChange}
                  className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </Field>

              <Field label="Yield Char (%)">
                <input
                  type="number"
                  name="yieldCharPct"
                  value={form.yieldCharPct}
                  onChange={onChange}
                  className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </Field>

              {/* Optional description for PDF header */}
              <Field label="Deskripsi (opsional)">
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-gray-500 w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  rows={2}
                  placeholder="Tambahkan keterangan untuk dicetak di PDF (opsional)"
                />
              </Field>
            </div>

            {/* Hitung */}
            <div className="mt-8">
              <button
                className="w-full rounded-full py-4 text-white font-semibold text-lg shadow-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95"
                onClick={() => setForm({ ...form })} // re-run compute
              >
                Hitung
              </button>
            </div>

            {result && (
              <>
                <div className="mt-3">
                  <button
                    className="w-full rounded-full py-3 text-indigo-700 border border-indigo-300 bg-white hover:bg-indigo-50"
                    onClick={() =>
                      printCalculationPdf(pyrolysisPdfAdapter, form, result, {
                        description,
                        meta: doc, // <--
                        })
                    }
                  >
                    Cetak PDF
                  </button>
                </div>

                <div className="mt-8 space-y-4">
                  {result.warnings.length > 0 && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 p-4">
                      <ul className="list-disc pl-5">
                        {result.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card title="Ringkasan Feed">
                      <Row k="Feed (kg/jam)" v={result.feedKgPerHour} unit="kg/h" />
                      <Row k="Feed (kg/det)" v={result.feedKgPerSec} unit="kg/s" />
                    </Card>

                    <Card title="Produk (kg/hari)">
                      <Row k="Bio-oil" v={result.oilKgPerDay} unit="kg/d" />
                      <Row k="Gas" v={result.gasKgPerDay} unit="kg/d" />
                      <Row k="Char" v={result.charKgPerDay} unit="kg/d" />
                    </Card>

                    <Card title="Produk (kg/jam)">
                      <Row k="Bio-oil" v={result.oilKgPerHour} unit="kg/h" />
                      <Row k="Gas" v={result.gasKgPerHour} unit="kg/h" />
                      <Row k="Char" v={result.charKgPerHour} unit="kg/h" />
                    </Card>

                    <Card title="Sizing Reaktor (Silinder, L/D = 3)">
                      <Row k="Volume" v={result.reactorVolumeM3} unit="m³" />
                      <Row k="Diameter" v={result.reactorDiameterM} unit="m" />
                      <Row k="Panjang/Height" v={result.reactorLengthM} unit="m" />
                    </Card>

                    <Card title="Estimasi Kebutuhan Panas">
                      <Row k="Duty" v={result.estDutyKW} unit="kW" />
                      <p className="text-xs text-slate-500 mt-2">
                        Catatan: perkiraan duty = ṁ × (Cp·ΔT + ΔH<sub>pyro</sub>); sangat kasar untuk tahap awal.
                      </p>
                    </Card>
                  </div>
                </div>
              </>
            )}
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
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">{k}</span>
      <span className="font-semibold text-slate-900">
        {Number.isFinite(v) ? v.toFixed(3) : "-"} {unit ?? ""}
      </span>
    </div>
  );
}
