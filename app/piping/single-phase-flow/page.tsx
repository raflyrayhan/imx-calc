// app/piping/single-phase-flow/page.tsx
"use client";

import { useMemo, useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import DocMetaForm from "@/components/DocMetaForm";
import { printCalculationPdf, type DocMeta } from "@/lib/pdf";
import { computeSinglePhaseFlow, type SinglePhaseInput } from "@/lib/single-phase-flow";
import { S40 } from "@/lib/pipe-sizing-liquids";
import { singlePhaseFlowPdfAdapter } from "@/lib/pdf-adapters/single-phase-flow";

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};
const list = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

export default function SinglePhaseFlowPage() {
  const [doc, setDoc] = useState<DocMeta>({
    date: new Date().toISOString().slice(0, 10),
    documentTitle: "Single Phase Fluid Flow",
  });

  const [form, setForm] = useState<SinglePhaseInput>({
    nps: "NPS 3",
    schedule: "40",
    roughnessMm: 0.0018,
    flowType: "mass",
    massFlow_kg_h: 4000,
    volFlow_m3_h: undefined,
    rho: 800,
    mu_cP: 1,
  });

  const [description, setDescription] = useState("");
  const result = useMemo(() => computeSinglePhaseFlow(form), [form]);

  const inputCls =
    "w-full rounded-md border border-slate-300 dark:border-slate-700 text-white" +
    "bg-white dark:bg-slate-900/40 px-3 py-2 text-white" +
    "text-white dark:text-white placeholder-slate-400 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500";

  const onNum =
    (name: keyof SinglePhaseInput) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = Number(String(e.target.value).replace(",", "."));
      setForm((p) => ({ ...p, [name]: Number.isFinite(v) ? v : 0 }));
    };

  const onSel =
    (name: keyof SinglePhaseInput) =>
    (e: ChangeEvent<HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [name]: e.target.value as any }));
    };

  const displayNps = (nps: string) => nps.replace(/^NPS\s*/, "");

  return (
    <main className="relative min-h-screen bg-white dark:bg-slate-950">
      {/* subtle tech grid bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(100%_60%_at_50%_0%,black,transparent)]"
      >
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(2,6,23,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.05)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-60"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <motion.header variants={fadeIn} initial="hidden" animate="show" className="text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Single Phase Fluid Flow
          </h1>
          <p className="mt-4 mx-auto max-w-4xl text-slate-600 dark:text-slate-300">
            Calculates pressure drop in a straight pipe for a single-phase incompressible fluid
            (Darcy–Weisbach with Colebrook–White friction factor).
          </p>
        </motion.header>

        {/* Document meta */}
        <motion.section
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="mt-8"
        >
          <Card title="Document Info">
            <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
          </Card>
        </motion.section>

        {/* Three columns */}
        <motion.section
          variants={list}
          initial="hidden"
          animate="show"
          className="mt-10 grid gap-8 lg:grid-cols-3"
        >
          {/* Pipe data */}
          <motion.div variants={fadeIn} className="space-y-6">
            <Card title="Pipe Data">
              <Field label="Nominal Pipe Size">
                <select className={inputCls} value={form.nps} onChange={onSel("nps")}>
                  {S40.map((r) => (
                    <option key={r.nps} value={r.nps}>
                      {displayNps(r.nps)} ({r.dn}) — ID {r.id_mm.toFixed(2)} mm
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Schedule / Thickness">
                <select className={inputCls} value={form.schedule} onChange={onSel("schedule")}>
                  <option value="40">40</option>
                </select>
              </Field>

              <Field label="Pipe Roughness, ε">
                <div className="grid grid-cols-[1fr,96px] gap-2">
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
          </motion.div>

          {/* Fluid data */}
          <motion.div variants={fadeIn} className="space-y-6">
            <Card title="Fluid Data">
              <Field label="Flow Entry">
                <select className={inputCls} value={form.flowType} onChange={onSel("flowType")}>
                  <option value="mass">Select mass flowrate</option>
                  <option value="vol">Select volumetric flowrate</option>
                </select>
              </Field>

              {form.flowType === "mass" ? (
                <Field label="Mass flowrate">
                  <div className="grid grid-cols-[1fr,110px] gap-2">
                    <input
                      type="number"
                      className={inputCls}
                      value={form.massFlow_kg_h ?? 0}
                      onChange={onNum("massFlow_kg_h")}
                    />
                    <Unit>kg/h</Unit>
                  </div>
                </Field>
              ) : (
                <Field label="Volumetric flowrate">
                  <div className="grid grid-cols-[1fr,110px] gap-2">
                    <input
                      type="number"
                      className={inputCls}
                      value={form.volFlow_m3_h ?? 0}
                      onChange={onNum("volFlow_m3_h")}
                    />
                    <Unit>m³/h</Unit>
                  </div>
                </Field>
              )}

              <Field label="Density">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input type="number" className={inputCls} value={form.rho} onChange={onNum("rho")} />
                  <Unit>kg/m³</Unit>
                </div>
              </Field>

              <Field label="Viscosity">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input type="number" className={inputCls} value={form.mu_cP} onChange={onNum("mu_cP")} />
                  <Unit>cP</Unit>
                </div>
              </Field>
            </Card>
          </motion.div>

          {/* Results + actions */}
          <motion.div variants={fadeIn} className="space-y-6">
            <Card title="Result">
              <KV k="Pipe Inside Diameter" v={result.id_mm} unit="mm" digits={2} />
              <KV k="Fluid Velocity" v={result.velocity_m_s} unit="m/s" digits={3} />
              <KV k="Reynolds Number" v={result.reynolds} digits={0} />
              <KV k="Flow Regime" v={result.regime} />
              <KV k="Friction Factor" v={result.frictionFactor} digits={5} />
              <KV k="Pressure Drop" v={result.dpl_bar_per_100m} unit="bar/100 m" digits={5} />
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="w-full rounded-md border border-blue-600 bg-blue-600 text-white py-3 font-semibold hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-600"
                onClick={() => setForm({ ...form })}
              >
                Recalculate
              </button>
              <button
                className="w-full rounded-md border border-blue-600 bg-white text-blue-700 dark:bg-slate-900 dark:text-blue-400 py-3 font-semibold hover:bg-blue-50 dark:hover:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-blue-600"
                onClick={() =>
                  printCalculationPdf(singlePhaseFlowPdfAdapter, form, result, {
                    description,
                    meta: doc,
                  })
                }
              >
                Print PDF
              </button>
            </div>

            {result.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-300/60 bg-amber-50 text-amber-900 p-4 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-600/40">
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </motion.section>

        {/* Optional notes for PDF */}
        <motion.section variants={fadeIn} initial="hidden" animate="show" className="mt-8">
          <Card title="Description (optional)">
            <textarea
              className={inputCls}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes to appear under the PDF title (optional)"
            />
          </Card>
        </motion.section>
      </div>

      {/* bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100/80 to-transparent dark:from-slate-900/60"
      />
    </main>
  );
}

/* ---------- UI helpers ---------- */

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        {props.label}
      </div>
      {props.children}
    </label>
  );
}

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6
                    bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm">
      <h3 className="mb-4 text-base md:text-lg font-semibold text-slate-900 dark:text-white">
        {props.title}
      </h3>
      <div className="space-y-3">{props.children}</div>
    </div>
  );
}

function Unit({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-700
                    bg-slate-50 dark:bg-slate-900/40 px-3 text-slate-700 dark:text-slate-200">
      {children}
    </div>
  );
}

function KV({
  k,
  v,
  unit,
  digits = 2,
}: { k: string; v: number | string; unit?: string; digits?: number }) {
  let val = "-";
  if (typeof v === "number" && Number.isFinite(v)) val = v.toFixed(digits);
  if (typeof v === "string") val = v;
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-slate-600 dark:text-slate-300">{k}</span>
      <span className="font-semibold text-slate-900 dark:text-white">
        {val} {unit ?? ""}
      </span>
    </div>
  );
}
