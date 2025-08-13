// app/pyrolysis-combined/page.tsx
"use client";

import { useMemo, useState, ChangeEvent } from "react";
import {
  computeCombined,
  type CombinedInput,
  type PlasticKey,
} from "@/lib/combinedPyro";
import { printCalculationPdf } from "@/lib/pdf";
import { combinedPyroPdfAdapter } from "@/lib/pdf-adapters/combinedPyro";
import DocMetaForm from "@/components/DocMetaForm";
import { DocMeta } from "@/lib/pdf";

export default function CombinedPyroPage() {

        const [doc, setDoc] = useState<DocMeta>({
  date: new Date().toISOString().slice(0,10),
});

  const [form, setForm] = useState<CombinedInput>({
    totalFeedKg: 100,
    waterPct: 0,
    plastics: { PE: 100, PP: 0, PS: 0, PVC: 0, PET: 0 },
    bulkDensityKgM3: 250,
    targetTempC: 500,
    residenceTimeHr: 2,
    decompHeatMJperKg: 1.3,
    cpKJperKgK: 2.0,
  });

  const [description, setDescription] = useState("");

  const result = useMemo(() => computeCombined(form), [form]);

  const onNumber =
    (name: keyof CombinedInput) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = Number(String(e.target.value).replace(",", "."));
      setForm((prev) => ({ ...prev, [name]: Number.isFinite(v) ? v : 0 }));
    };

  const onPlastic =
    (key: PlasticKey) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = Number(String(e.target.value).replace(",", "."));
      setForm((prev) => ({
        ...prev,
        plastics: { ...prev.plastics, [key]: Number.isFinite(v) ? v : 0 },
      }));
    };

  const totalPct =
    form.waterPct +
    Object.values(form.plastics).reduce((s, v) => s + (Number(v) || 0), 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">

      <div className="py-5 max-w-6xl mx-auto px-4">
        <h1 className="text-center text-3xl md:text-4xl font-extrabold text-indigo-900">
          Combined Plastic Pyrolysis & Reactor Design
        </h1>

        <section className="mt-6 bg-white shadow rounded-2xl border border-slate-100">
  <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
</section>

        <section className="mt-10 bg-white shadow-xl rounded-2xl border border-slate-100">
          <header className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold text-slate-900 text-center">
              Inputs
            </h2>
          </header>

          <div className="p-6 space-y-8">
            {/* Feed + Water */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card title="Feed">
                <Field label="Total Feed Mass (kg)">
                  <input
                    type="number"
                    value={form.totalFeedKg}
                    onChange={onNumber("totalFeedKg")}
                    className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Water Content (% of Total Feed)">
                  <input
                    type="number"
                    value={form.waterPct}
                    onChange={onNumber("waterPct")}
                    className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <div className="text-sm text-slate-600">
                  <strong>Total % (plastics + water): {totalPct.toFixed(2)}%</strong>
                  <span className="ml-2 text-slate-500"> (must equal 100%)</span>
                </div>
              </Card>

              <Card title="Plastic Composition (%)">
                <div className="grid grid-cols-2 gap-4">
                  {(["PE", "PP", "PS", "PVC", "PET"] as PlasticKey[]).map((k) => (
                    <Field key={k} label={k}>
                      <input
                        type="number"
                        value={form.plastics[k]}
                        onChange={onPlastic(k)}
                        className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </Field>
                  ))}
                </div>
              </Card>
            </div>

            {/* Reactor inputs */}
            <Card title="Reactor Parameters">
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Plastic Bulk Density (kg/m³)">
                  <input
                    type="number"
                    value={form.bulkDensityKgM3}
                    onChange={onNumber("bulkDensityKgM3")}
                    className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Target Temperature (°C)">
                  <input
                    type="number"
                    value={form.targetTempC}
                    onChange={onNumber("targetTempC")}
                    className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Residence Time (hours)">
                  <input
                    type="number"
                    value={form.residenceTimeHr}
                    onChange={onNumber("residenceTimeHr")}
                    className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Decomposition Heat (MJ/kg)">
                  <input
                    type="number"
                    value={form.decompHeatMJperKg}
                    onChange={onNumber("decompHeatMJperKg")}
                    className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
                <Field label="Specific Heat Capacity (kJ/kg·K)">
                  <input
                    type="number"
                    value={form.cpKJperKgK}
                    onChange={onNumber("cpKJperKgK")}
                    className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Field>
              </div>
            </Card>

            {/* Description for PDF */}
            <Field label="Description (optional)">
              <textarea
                className="text-black w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
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
                onClick={() => setForm({ ...form })} // recompute trigger
              >
                Calculate
              </button>

              <button
                className="w-full rounded-full py-3 text-indigo-700 border border-indigo-300 bg-white hover:bg-indigo-50 disabled:opacity-40"
                disabled={!result.isValid}
                onClick={() =>
                  printCalculationPdf(combinedPyroPdfAdapter, form, result, {
                    description,
                    meta: doc,
                    })
                }
              >
                Print PDF
              </button>
            </div>

            {/* Warnings */}
            {(!result.isValid || result.warnings.length > 0) && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 p-4">
                <ul className="list-disc pl-5">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Results */}
            {result.isValid && result.pyrolysis && result.reactor && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card title="Pyrolysis Products (kg)">
                  <Row k="Water" v={result.pyrolysis.waterMassKg} />
                  <Row k="Gas" v={result.pyrolysis.gasKg} />
                  <Row k="Liquid Oil" v={result.pyrolysis.oilKg} />
                  <Row k="Wax" v={result.pyrolysis.waxKg} />
                  <Row k="Char/Solid" v={result.pyrolysis.charKg} />
                </Card>

                <Card title="Pyrolysis Summary">
                  <Row k="Average Pyrolysis Temperature" v={result.pyrolysis.avgPyroTempC} unit="°C" digits={1} />
                  <Row k="Total Heat Required" v={result.pyrolysis.totalHeatMJ} unit="MJ" />
                  <Row k="Heat Required per kg of Plastic" v={result.pyrolysis.heatPerKgPlasticMJ} unit="MJ/kg" />
                  <Row k="Total Decomposition Heat" v={result.pyrolysis.totalDecompHeatMJ} unit="MJ" />
                  <Row k="Overall Performance" v={result.pyrolysis.performancePct} unit="%" />
                </Card>

                <Card title="Reactor Design Results">
                  <Row k="Reactor Volume" v={result.reactor.reactorVolumeM3} unit="m³" digits={3} />
                  <Row k="Total Heat Required" v={result.reactor.totalHeatMJ} unit="MJ" />
                  <Row k="Heating Power Required" v={result.reactor.heatingPowerKW} unit="kW" />
                  <Row k="Heat Transfer Area" v={result.reactor.heatTransferAreaM2} unit="m²" />
                </Card>

                <Card title="Reactor Geometry (D = H)">
                  <Row k="Reactor Diameter" v={result.reactor.reactorDiameterM} unit="m" digits={3} />
                  <Row k="Reactor Height" v={result.reactor.reactorHeightM} unit="m" digits={3} />
                  <p className="text-xs text-slate-500 mt-2">
                    Note: Geometry uses V = (π/4)·D²·H with H = D ⇒ D = ∛(4V/π).
                  </p>
                </Card>
              </div>
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
