// app/piping/pipe-sizing-liquids/page.tsx
"use client";

import { useMemo, useState, ChangeEvent } from "react";
import DocMetaForm from "@/components/DocMetaForm";
import { printCalculationPdf, type DocMeta } from "@/lib/pdf";
import {
  computePipeSizing,
  type PipeSizingInput,
  S40,
} from "@/lib/pipe-sizing-liquids";
import { pipeSizingLiquidsPdfAdapter } from "@/lib/pdf-adapters/pipe-sizing-liquids";

export default function PipeSizingLiquidsPage() {
  const [doc, setDoc] = useState<DocMeta>({
    date: new Date().toISOString().slice(0, 10),
    documentTitle: "Pipe Sizing — Liquids & Solvents",
  });

  const [form, setForm] = useState<PipeSizingInput>({
    method: "velocity",
    targetVelocity: 3,
    targetDPL_bar_per_100m: 1,
    lengthM: 30,
    roughnessMm: 0.0018,
    flowType: "mass",
    massFlow_kg_h: 4000,
    volFlow_m3_h: undefined,
    rho: 1000,
    mu_cP: 0.89,
    schedule: "STD/40/40S",
    overrideNPS: null,
  });

  const [description, setDescription] = useState("");

  const result = useMemo(() => computePipeSizing(form), [form]);

  const inputCls =
    "w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 " +
    "bg-white dark:bg-slate-800/10 text-slate-900 dark:text-slate-100 " +
    "focus:outline-none focus:ring-1 focus:ring-indigo-500";

  const onNum = (name: keyof PipeSizingInput) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(String(e.target.value).replace(",", "."));
    setForm((p) => ({ ...p, [name]: Number.isFinite(v) ? v : 0 }));
  };

  const onSel = (name: keyof PipeSizingInput) => (e: ChangeEvent<HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [name]: e.target.value as any }));
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center">
          Pipe Sizing – Liquids & Solvents
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-center">
          Pipe sizing based on velocity (and Darcy–Weisbach hydraulics) with standard
          Schedule 40 sizes. Enter flow, fluid properties, line length, and roughness.
        </p>

        <section className="mt-8 shadow rounded-2xl border border-slate-200 dark:border-slate-800">
          <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
        </section>

        <section className="mt-10 grid lg:grid-cols-3 gap-8">
          {/* Left column: method & flow */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Calculate Pipe Diameter">
              <Field label="Method">
                <select className={inputCls} value={form.method} onChange={onSel("method")}>
                  <option value="velocity">based on Velocity</option>
                  <option value="dpl">based on Pressure Drop / Length</option>
                </select>
              </Field>

              {form.method === "velocity" ? (
                <Field label="Velocity (target)">
                  <div className="grid grid-cols-[1fr,90px] gap-2">
                    <input type="number" className={inputCls} value={form.targetVelocity} onChange={onNum("targetVelocity")} />
                    <Unit>m/s</Unit>
                  </div>
                </Field>
              ) : (
                <Field label="ΔP / 100 m (target)">
                  <div className="grid grid-cols-[1fr,120px] gap-2">
                    <input type="number" className={inputCls} value={form.targetDPL_bar_per_100m ?? 0} onChange={onNum("targetDPL_bar_per_100m")} />
                    <Unit>bar/100m</Unit>
                  </div>
                </Field>
              )}

              <hr className="my-3" />

              <Field label="Flow Type">
                <select className={inputCls} value={form.flowType} onChange={onSel("flowType")}>
                  <option value="mass">Mass Flow</option>
                  <option value="vol">Volumetric Flow</option>
                </select>
              </Field>

              {form.flowType === "mass" ? (
                <Field label="Mass Flowrate">
                  <div className="grid grid-cols-[1fr,90px] gap-2">
                    <input type="number" className={inputCls} value={form.massFlow_kg_h ?? 0} onChange={onNum("massFlow_kg_h")} />
                    <Unit>kg/h</Unit>
                  </div>
                </Field>
              ) : (
                <Field label="Volumetric Flowrate">
                  <div className="grid grid-cols-[1fr,90px] gap-2">
                    <input type="number" className={inputCls} value={form.volFlow_m3_h ?? 0} onChange={onNum("volFlow_m3_h")} />
                    <Unit>m³/h</Unit>
                  </div>
                </Field>
              )}
            </Card>

            <Card title="Solvent">
              <Field label="Density">
                <div className="grid grid-cols-[1fr,90px] gap-2">
                  <input type="number" className={inputCls} value={form.rho} onChange={onNum("rho")} />
                  <Unit>kg/m³</Unit>
                </div>
              </Field>
              <Field label="Viscosity">
                <div className="grid grid-cols-[1fr,120px] gap-2">
                  <input type="number" className={inputCls} value={form.mu_cP} onChange={onNum("mu_cP")} />
                  <Unit>centipoise</Unit>
                </div>
              </Field>
            </Card>
          </div>

          {/* Middle column: pipe details */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Pipe Details">
              <Field label="Pipe Length">
                <div className="grid grid-cols-[1fr,90px] gap-2">
                  <input type="number" className={inputCls} value={form.lengthM} onChange={onNum("lengthM")} />
                  <Unit>m</Unit>
                </div>
              </Field>
              <Field label="Pipe Roughness">
                <div className="grid grid-cols-[1fr,90px] gap-2">
                  <input type="number" className={inputCls} step={0.00001} value={form.roughnessMm} onChange={onNum("roughnessMm")} />
                  <Unit>mm</Unit>
                </div>
              </Field>

              <hr className="my-3" />

              <Field label="Pipe Schedule">
                <select className={inputCls} value={form.schedule} onChange={onSel("schedule")}>
                  <option value="STD/40/40S">STD / 40 / 40S</option>
                </select>
              </Field>

              <Field label="Override Pipe Size (optional)">
                <select
                  className={inputCls}
                  value={form.overrideNPS ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, overrideNPS: e.target.value || null }))
                  }
                >
                  <option value="">— Use Recommended —</option>
                  {S40.map((r) => (
                    <option key={r.nps} value={r.nps}>
                      {r.nps} ({r.dn}) — ID {r.id_mm.toFixed(3)} mm
                    </option>
                  ))}
                </select>
              </Field>
            </Card>
          </div>

          {/* Right column: results + PDF */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Result">
              <KV k="Pipe ID (Calculated)" v={result.requiredID_mm} unit="mm" digits={4} />
              <div className="mt-3 rounded-md bg-slate-100 dark:bg-slate-800/10 p-3 text-sm">
                Pipe size selected based on the next higher available ID in STD Schedule.
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <KV k="Pipe Size" v={result.recommendedNPS ?? "-"} />
                <KV k="Nominal" v={result.recommendedDN ?? "-"} />
              </div>
              <KV k="Pipe Inside Diameter (ID)" v={result.selectedID_mm} unit="mm" digits={3} />
              <hr className="my-3" />
              <KV k="Velocity" v={result.velocity_m_s} unit="m/s" digits={2} />
              <KV k="Pressure Drop / Length" v={result.dpl_bar_per_100m} unit="bar/100m" digits={2} />
              <KV k="Pressure Drop" v={result.dp_bar} unit="bar" digits={3} />
              <KV k="Reynolds Number" v={result.reynolds} digits={0} />
              <KV k="Flow Regime" v={result.regime ?? "-"} />
              <KV k="Friction factor" v={result.frictionFactor} digits={5} />
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="w-full border border-indigo-600 bg-indigo-600/10 text-white py-3 font-semibold"
                onClick={() => setForm({ ...form })}
              >
                Recalculate
              </button>
              <button
                className="w-full border border-indigo-600 bg-white text-indigo-700 py-3 font-semibold dark:bg-slate-900/10 dark:text-indigo-300"
                onClick={() =>
                  printCalculationPdf(pipeSizingLiquidsPdfAdapter, form, result, {
                    description,
                    meta: doc,
                  })
                }
              >
                Print PDF
              </button>
            </div>

            {result.warnings.length > 0 && (
              <div className="rounded-md bg-amber-100 dark:bg-amber-900/10 border border-amber-300 dark:border-amber-600 p-4">
                <ul className="list-disc pl-5 text-sm">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8">
          <Field label="Description (optional)">
            <textarea
              className={inputCls + " w-full"}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes to appear under the PDF title (optional)"
            />
          </Field>
        </section>
      </div>
    </main>
  );
}

/* ---------- helpers ---------- */
function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold mb-2">{props.label}</div>
      {props.children}
    </label>
  );
}
function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5">
      <h3 className="font-semibold mb-4">{props.title}</h3>
      <div className="space-y-3">{props.children}</div>
    </div>
  );
}
function Unit({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center border border-slate-300 dark:border-slate-600 px-3 text-sm">
      {children}
    </div>
  );
}
function KV({
  k,
  v,
  unit,
  digits = 2,
}: {
  k: string;
  v: number | string | null | undefined;
  unit?: string;
  digits?: number;
}) {
  let val: string = "-";
  if (typeof v === "number" && Number.isFinite(v)) val = v.toFixed(digits);
  if (typeof v === "string") val = v;
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span>{k}</span>
      <span className="font-semibold">
        {val} {unit ?? ""}
      </span>
    </div>
  );
}