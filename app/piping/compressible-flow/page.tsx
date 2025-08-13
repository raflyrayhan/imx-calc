// app/piping/compressible-flow/page.tsx
"use client";

import { useMemo, useState, ChangeEvent } from "react";
import DocMetaForm from "@/components/DocMetaForm";
import { printCalculationPdf, type DocMeta } from "@/lib/pdf";
import { S40 } from "@/lib/pipe-sizing-liquids";
import { computeCompressibleFlow, type GasFlowInput } from "@/lib/compressible-flow";
import { compressibleFlowPdfAdapter } from "@/lib/pdf-adapters/compressible-flow";

export default function CompressibleFlowPage() {
  const [doc, setDoc] = useState<DocMeta>({
    date: new Date().toISOString().slice(0, 10),
    documentTitle: "Compressible Fluid Flow",
  });

  const [description, setDescription] = useState("");

  const [form, setForm] = useState<GasFlowInput>({
    nps: "NPS 3",
    schedule: "40",
    lengthM: 100,
    roughnessMm: 0.00180,

    p1_barA: 7.0,
    p2_barA: 6.7,
    t_C: 25,
    z: 0.95,
    mw_g_per_mol: 29.0,
    mu_cP: 0.01, // gas viscosity example
    k: 1.35,
  });

  const res = useMemo(() => computeCompressibleFlow(form), [form]);

  const inputCls =
    "text-black w-full border border-slate-300 rounded-none px-3 py-2 " +
    "focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500";

  const onSel =
    (name: keyof GasFlowInput) =>
    (e: ChangeEvent<HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [name]: e.target.value as any }));

  const onNum =
    (name: keyof GasFlowInput) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = Number(String(e.target.value).replace(",", "."));
      setForm((p) => ({ ...p, [name]: Number.isFinite(v) ? v : 0 }));
    };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 text-center">Compressible Fluid Flow</h1>
        <p className="mt-4 text-slate-600 max-w-4xl text-center mx-auto">
          Calculates flow of a single-phase compressible fluid in a straight pipe for a given pressure drop
          (isothermal model). Darcy friction factor is obtained via Colebrook–White.
        </p>

        {/* Document info */}
        <section className="mt-8 bg-white shadow rounded-2xl border border-slate-200">
          <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
        </section>

        <section className="mt-10 grid lg:grid-cols-3 gap-8">
          {/* Left: Pipe data */}
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

              <Field label="Pipe Roughness, ε">
                <div className="grid grid-cols-[1fr,90px] gap-2">
                  <input
                    type="number"
                    className={inputCls}
                    value={form.roughnessMm}
                    step={0.00001}
                    onChange={onNum("roughnessMm")}
                  />
                  <Unit>mm</Unit>
                </div>
              </Field>
            </Card>
          </div>

          {/* Middle: Fluid data */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Fluid Data">
              <Field label="Inlet Pressure, P1">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input type="number" className={inputCls} value={form.p1_barA} onChange={onNum("p1_barA")} />
                  <Unit>bar a</Unit>
                </div>
              </Field>
              <Field label="Outlet Pressure, P2">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input type="number" className={inputCls} value={form.p2_barA} onChange={onNum("p2_barA")} />
                  <Unit>bar a</Unit>
                </div>
              </Field>
              <Field label="Flowing Temperature, T">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input type="number" className={inputCls} value={form.t_C} onChange={onNum("t_C")} />
                  <Unit>°C</Unit>
                </div>
              </Field>
              <Field label="Compressibility Factor, Z">
                <input type="number" className={inputCls} value={form.z} onChange={onNum("z")} step={0.01} />
              </Field>
              <Field label="Molecular Weight, MW">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input
                    type="number"
                    className={inputCls}
                    value={form.mw_g_per_mol}
                    onChange={onNum("mw_g_per_mol")}
                  />
                  <Unit>g/mol</Unit>
                </div>
              </Field>
              <Field label="Viscosity, μ">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input type="number" className={inputCls} value={form.mu_cP} onChange={onNum("mu_cP")} />
                  <Unit>cP</Unit>
                </div>
              </Field>
              <Field label="Specific Heat Ratio, Cp/Cv (k)">
                <input type="number" className={inputCls} value={form.k} onChange={onNum("k")} step={0.01} />
              </Field>
            </Card>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Result">
              <KV k="Pipe Inside Diameter" v={res.id_mm} unit="mm" digits={2} />
              <KV k="Fluid Density @ (P1, T)" v={res.rho1_kg_m3} unit="kg/m³" digits={2} />
              <KV k="Mass flowrate, W" v={res.w_kg_h} unit="kg/h" digits={0} />
              <KV k="Volumetric flowrate" v={res.qN_m3_h} unit="Nm³/h" digits={0} />
              <KV k="Reynold's Number" v={res.reynolds} digits={0} />
              <KV k="Friction factor" v={res.frictionFactor} digits={5} />
              <KV k="Fluid Velocity" v={res.velocity_m_s} unit="m/s" digits={2} />
              <KV k="Sonic Velocity" v={res.sonic_m_s} unit="m/s" digits={1} />
              <KV k="Mach number at Inlet" v={res.mach} digits={4} />
              <KV k="Erosional Velocity" v={res.erosional_m_s} unit="m/s" digits={2} />
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
                  printCalculationPdf(compressibleFlowPdfAdapter, form, res, {
                    description,
                    meta: doc,
                  })
                }
              >
                Print PDF
              </button>
            </div>

            {res.warnings.length > 0 && (
              <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 p-4">
                <ul className="list-disc pl-5 text-sm">
                  {res.warnings.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Optional note to appear under PDF title */}
        <section className="mt-8">
          <Field label="Description (optional)">
            <textarea
              className={inputCls + " w-full"}
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

/* ---------- tiny UI helpers ---------- */
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
