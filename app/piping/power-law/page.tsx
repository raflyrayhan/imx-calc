// app/piping/power-law/page.tsx
"use client";

import { useMemo, useState, ChangeEvent } from "react";
import DocMetaForm from "@/components/DocMetaForm";
import { printCalculationPdf, type DocMeta } from "@/lib/pdf";
import { S40 } from "@/lib/pipe-sizing-liquids";
import {
  computePowerLaw,
  type PowerLawInput,
} from "@/lib/powerlaw";
import { powerLawPdfAdapter } from "@/lib/pdf-adapters/powerlaw";

export default function PowerLawPage() {
  const [doc, setDoc] = useState<DocMeta>({
    date: new Date().toISOString().slice(0, 10),
    documentTitle: "Power Law Fluid",
  });
  const [description, setDescription] = useState("");

  const [form, setForm] = useState<PowerLawInput>({
    nps: "NPS 3",
    schedule: "40",
    lengthM: 10,
    fittingK: 1.8,

    mDot_kg_h: 25000,
    rho_kg_m3: 960,
    K_Ns_2minusN_per_m2: 1.48, // N·s^(2−n)/m²  (≡ Pa·s^n)
    n: 0.64,
  });

  const res = useMemo(() => computePowerLaw(form), [form]);

  const inputCls =
    "text-black w-full border border-slate-300 rounded-none px-3 py-2 " +
    "focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500";

  const onSel =
    (name: keyof PowerLawInput) =>
    (e: ChangeEvent<HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [name]: e.target.value as any }));

  const onNum =
    (name: keyof PowerLawInput) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = Number(String(e.target.value).replace(",", "."));
      setForm((p) => ({ ...p, [name]: Number.isFinite(v) ? v : 0 }));
    };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 text-center">
          Power Law Fluid
        </h1>
        <p className="mt-4 text-slate-600 max-w-4xl text-center mx-auto">
          This web application calculates pressure drop in a straight pipe due to flow of a non-Newtonian
          power-law fluid. Generalized Reynolds number by Metzner–Reed; friction factor by Dodge–Metzner
          for turbulent and \(f=16/Re_g\) for laminar.
        </p>

        {/* Document info */}
        <section className="mt-8 bg-white shadow rounded-2xl border border-slate-200">
          <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
        </section>

        <section className="mt-10 grid lg:grid-cols-3 gap-8">
          {/* Pipe Data */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Pipe Data">
              <Field label="Nominal Pipe Size">
                <select className={inputCls} value={form.nps} onChange={onSel("nps")}>
                  {S40.map((r) => (
                    <option key={r.nps} value={r.nps}>
                      {r.nps.replace(/^NPS\s*/, "")} ({r.dn}) — ID {r.id_mm.toFixed(2)} mm
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Schedule / Thickness">
                <select className={inputCls} value={form.schedule} onChange={onSel("schedule")}>
                  <option value="40">40</option>
                </select>
              </Field>

              <Field label="Pipe Length, L">
                <div className="grid grid-cols-[1fr,90px] gap-2">
                  <input type="number" className={inputCls} value={form.lengthM} onChange={onNum("lengthM")} />
                  <Unit>m</Unit>
                </div>
              </Field>

              <Field label="Fitting Loss, ΣK">
                <div className="grid grid-cols-[1fr,90px] gap-2">
                  <input type="number" className={inputCls} value={form.fittingK} onChange={onNum("fittingK")} />
                  <Unit>–</Unit>
                </div>
              </Field>
            </Card>
          </div>

          {/* Fluid Data */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Fluid Data">
              <Field label="Mass flowrate">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input type="number" className={inputCls} value={form.mDot_kg_h} onChange={onNum("mDot_kg_h")} />
                  <Unit>kg/h</Unit>
                </div>
              </Field>

              <Field label="Density">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input type="number" className={inputCls} value={form.rho_kg_m3} onChange={onNum("rho_kg_m3")} />
                  <Unit>kg/m³</Unit>
                </div>
              </Field>

              <Field label="Flow Consistency Index, K">
                <div className="grid grid-cols-[1fr,140px] gap-2">
                  <input
                    type="number"
                    className={inputCls}
                    step={0.0001}
                    value={form.K_Ns_2minusN_per_m2}
                    onChange={onNum("K_Ns_2minusN_per_m2")}
                  />
                  <Unit>N·s^(2−n)/m²</Unit>
                </div>
              </Field>

              <Field label="Flow Behaviour Index, n">
                <input type="number" step={0.01} className={inputCls} value={form.n} onChange={onNum("n")} />
              </Field>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Result">
              <KV k="Pipe Inside Diameter" v={res.id_mm} unit="mm" digits={2} />
              <KV k="Volumetric flowrate" v={res.q_m3_h} unit="m³/h" digits={2} />
              <KV k="Velocity" v={res.velocity_m_s} unit="m/s" digits={2} />
              <KV k="Equivalent length due to fittings" v={res.le_m} unit="m" digits={2} />
              <KV k="Pressure Drop" v={res.dp_bar} unit="bar" digits={3} />
            </Card>

            <Card title="Re & Friction">
              <KV k="Reynold's Number (generalized)" v={res.reynolds_g} digits={1} />
              <KV k="Friction factor, f" v={res.frictionFactor} digits={4} />
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="w-full rounded-none border border-indigo-600 bg-indigo-600 text-white py-3 font-semibold hover:opacity-95"
                onClick={() => setForm({ ...form })}
              >
                Recalculate
              </button>
              <button
                className="w-full rounded-none border border-indigo-600 bg-white text-indigo-700 py-3 font-semibold hover:bg-indigo-50"
                onClick={() =>
                  printCalculationPdf(powerLawPdfAdapter, form, res, {
                    description,
                    meta: doc,
                  })
                }
              >
                Print PDF
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <Field label="Description (optional)">
            <textarea
              className={inputCls}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes to include on the PDF (optional)"
            />
          </Field>
        </section>
      </div>
    </main>
  );
}

/* ------- small UI helpers (local) ------- */
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
      <div className="space-y-3">{props.children}</div>
    </div>
  );
}
function Unit({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center border border-slate-300 rounded-none px-3 text-slate-700">
      {children}
    </div>
  );
}
function KV({
  k, v, unit, digits = 2,
}: { k: string; v: number | string; unit?: string; digits?: number }) {
  let val = "-";
  if (typeof v === "number" && Number.isFinite(v)) val = v.toFixed(digits);
  if (typeof v === "string") val = v;
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-slate-600">{k}</span>
      <span className="font-semibold text-slate-900">
        {val} {unit ?? ""}
      </span>
    </div>
  );
}
