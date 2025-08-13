// app/cooling/page.tsx
"use client";

import { useMemo, useState, ChangeEvent } from "react";
import { computeCooling, type CoolingInput } from "@/lib/cooling";
import { printCalculationPdf } from "@/lib/pdf";
import { coolingPdfAdapter } from "@/lib/pdf-adapters/cooling";
import DocMetaForm from "@/components/DocMetaForm";
import { DocMeta } from "@/lib/pdf";

export default function CoolingCalculatorPage() {

    const [doc, setDoc] = useState<DocMeta>({
  date: new Date().toISOString().slice(0,10),
});

  const [form, setForm] = useState<CoolingInput>({
    area_m2: 1000,
    lighting_W_per_m2: 12,
    workers: 20,
    heat_per_worker_W: 500,
    furnaces: 2,
    furnace_heat_kW: 200,
    other_machines_kW: 100,
    solar_area_m2: 300,
    solar_rate_W_per_m2: 10,
    ambient_temp_C: 35,
    indoor_temp_C: 28,
  });

  const [description, setDescription] = useState("");

  const result = useMemo(() => computeCooling(form), [form]);

  const onNum =
    (name: keyof CoolingInput) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = Number(String(e.target.value).replace(",", "."));
      setForm((prev) => ({ ...prev, [name]: Number.isFinite(v) ? v : 0 }));
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
          Cooling Load & Required Air Flow Calculator
        </h1>

        <section className="mt-6 bg-white shadow rounded-2xl border border-slate-100">
  <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
</section>

        {/* Card */}
        <section className="mt-10 bg-white shadow-xl rounded-2xl border border-slate-100">
          <header className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold text-slate-900 text-center">
              Input Data
            </h2>
          </header>

          <div className="p-6 space-y-8">
            {/* Inputs */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card title="Workshop & Gains">
                <Field label="Workshop Area (m²)">
                  <input
                    type="number"
                    value={form.area_m2}
                    onChange={onNum("area_m2")}
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Lighting Power Density (W/m²)">
                  <input
                    type="number"
                    value={form.lighting_W_per_m2}
                    onChange={onNum("lighting_W_per_m2")}
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Sun-Exposed Area (m²)">
                  <input
                    type="number"
                    value={form.solar_area_m2}
                    onChange={onNum("solar_area_m2")}
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Solar Gain (W/m²)">
                  <input
                    type="number"
                    value={form.solar_rate_W_per_m2}
                    onChange={onNum("solar_rate_W_per_m2")}
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
              </Card>

              <Card title="People & Equipment">
                <Field label="Number of Workers">
                  <input
                    type="number"
                    value={form.workers}
                    onChange={onNum("workers")}
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Heat per Worker (W)">
                  <input
                    type="number"
                    value={form.heat_per_worker_W}
                    onChange={onNum("heat_per_worker_W")}
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Number of Furnaces">
                  <input
                    type="number"
                    value={form.furnaces}
                    onChange={onNum("furnaces")}
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Heat per Furnace (kW)">
                  <input
                    type="number"
                    value={form.furnace_heat_kW}
                    onChange={onNum("furnace_heat_kW")}
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Other Machines Heat (kW)">
                  <input
                    type="number"
                    value={form.other_machines_kW}
                    onChange={onNum("other_machines_kW")}
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
              </Card>
            </div>

            <Card title="Temperatures">
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Ambient Temp (°C)">
                  <input
                    type="number"
                    value={form.ambient_temp_C}
                    onChange={onNum("ambient_temp_C")}
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Target Temp (°C)">
                  <input
                    type="number"
                    value={form.indoor_temp_C}
                    onChange={onNum("indoor_temp_C")}
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <div className="flex items-end">
                  <div className="w-full rounded-xl border border-slate-200 px-4 py-2 bg-slate-50">
                    ΔT (Ambient − Target):{" "}
                    <strong>{result.deltaT_C.toFixed(2)} °C</strong>
                  </div>
                </div>
              </div>
            </Card>

            {/* Description for PDF */}
            <Field label="Description (optional)">
              <textarea
                className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any notes to appear in the PDF header (optional)"
              />
            </Field>

            {/* Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                className="w-full rounded-full py-4 text-white font-semibold text-lg shadow-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95"
                onClick={() => setForm({ ...form })} // trigger recompute
              >
                Calculate
              </button>

              <button
                className="w-full rounded-full py-3 text-indigo-700 border border-indigo-300 bg-white hover:bg-indigo-50"
                onClick={() =>
                  printCalculationPdf(coolingPdfAdapter, form, result, {
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
              <Card title="Cooling Load Breakdown (W)">
                <Row k="People" v={result.q_people_W} />
                <Row k="Furnaces" v={result.q_furnaces_W} />
                <Row k="Other Machines" v={result.q_machines_W} />
                <Row k="Lighting" v={result.q_lighting_W} />
                <Row k="Solar" v={result.q_solar_W} />
                <div className="h-px bg-slate-200 my-2" />
                <Row k="Total Cooling Load" v={result.q_total_W} />
              </Card>

              <Card title="Required Air Flow">
                <Row k="Mass Flow" v={result.mass_flow_kg_s} unit="kg/s" digits={2} />
                <Row k="Volumetric Flow" v={result.vol_flow_m3_s} unit="m³/s" digits={3} />
                <Row k="Volumetric Flow" v={result.vol_flow_m3_h} unit="m³/h" digits={1} />
                <Row k="Volumetric Flow" v={result.vol_flow_CFM} unit="CFM" digits={0} />
                <p className="text-xs text-slate-500 mt-2">
                  Assumptions: ρ = 1.2 kg/m³, Cp = 1005 J/kg·K.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------- UI helpers (must be in scope!) ---------- */
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
