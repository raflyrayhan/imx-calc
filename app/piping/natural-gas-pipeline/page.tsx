// page.tsx
"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { calculatePipelineSizing, PipelineInput } from "@/lib/natural-gas-pipeline";
import DocMetaForm from "@/components/DocMetaForm";
import { printCalculationPdf } from "@/lib/pdf";
import { naturalGasPipelinePdfAdapter } from "@/lib/pdf-adapters/natural-gas-pipeline";

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const list = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

export default function PipelineSizingPage() {
  const [doc, setDoc] = useState({
    date: new Date().toISOString().slice(0, 10),
    documentTitle: "Natural Gas Pipeline Sizing",
  });

  const [form, setForm] = useState<PipelineInput>({
    flowrate_m3_h: 100000,
    pressure_inlet_bar: 80,
    pressure_outlet_bar: 70,
    pipeLength_km: 100,
    gasDensity_kg_m3: 0.8,
    gasViscosity_cp: 0.01,
    roughness_mm: 0.1,
    temperature_C: 20
  });

  const result = useMemo(() => calculatePipelineSizing(form), [form]);

  const inputCls =
    "w-full border border-slate-300 dark:border-slate-700 rounded-md bg-transparent px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600";

  const onNum = (name: keyof PipelineInput) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(String(e.target.value).replace(",", "."));
    setForm((prev) => ({ ...prev, [name]: Number.isFinite(v) ? v : 0 }));
  };

  const onSel = (name: keyof PipelineInput) => (e: ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value as any }));
  };

  return (
    <main className="min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(100%_60%_at_50%_0%,black,transparent)]"
      >
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(2,6,23,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.05)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-60" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <motion.header variants={fadeIn} initial="hidden" animate="show" className="text-center text-black">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Natural Gas Pipeline Sizing</h1>
          <p className="mt-4 mx-auto max-w-4xl">
            This tool calculates the optimal pipeline size, pressure drop, and other key parameters for a natural gas pipeline.
          </p>
        </motion.header>

        <motion.section variants={fadeIn} initial="hidden" animate="show" className="mt-8">
          <Card title="Document Info">
            <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
          </Card>
        </motion.section>

        <motion.section variants={list} initial="hidden" animate="show" className="mt-10 grid gap-8 lg:grid-cols-3">
          {/* Pipeline Inputs */}
          <motion.div variants={fadeIn} className="space-y-6">
            <Card title="Pipeline Data">
              <Field label="Flowrate (m³/h)">
                <input type="number" className={inputCls} value={form.flowrate_m3_h} onChange={onNum("flowrate_m3_h")} />
              </Field>
              <Field label="Inlet Pressure (bar)">
                <input type="number" className={inputCls} value={form.pressure_inlet_bar} onChange={onNum("pressure_inlet_bar")} />
              </Field>
              <Field label="Outlet Pressure (bar)">
                <input type="number" className={inputCls} value={form.pressure_outlet_bar} onChange={onNum("pressure_outlet_bar")} />
              </Field>
              <Field label="Pipe Length (km)">
                <input type="number" className={inputCls} value={form.pipeLength_km} onChange={onNum("pipeLength_km")} />
              </Field>
            </Card>
          </motion.div>

          {/* Gas Properties */}
          <motion.div variants={fadeIn} className="space-y-6">
            <Card title="Gas Properties">
              <Field label="Gas Density (kg/m³)">
                <input type="number" className={inputCls} value={form.gasDensity_kg_m3} onChange={onNum("gasDensity_kg_m3")} />
              </Field>
              <Field label="Gas Viscosity (cP)">
                <input type="number" className={inputCls} value={form.gasViscosity_cp} onChange={onNum("gasViscosity_cp")} />
              </Field>
              <Field label="Pipe Roughness (mm)">
                <input type="number" className={inputCls} value={form.roughness_mm} onChange={onNum("roughness_mm")} />
              </Field>
              <Field label="Temperature (°C)">
                <input type="number" className={inputCls} value={form.temperature_C} onChange={onNum("temperature_C")} />
              </Field>
            </Card>
          </motion.div>

          {/* Results */}
          <motion.div variants={fadeIn} className="space-y-6">
            <Card title="Results">
              <KV k="Pipe Diameter" v={result.pipeDiameter_mm} unit="mm" digits={2} />
              <KV k="Flow Velocity" v={result.flowVelocity_m_s} unit="m/s" digits={3} />
              <KV k="Reynolds Number" v={result.reynoldsNumber} />
              <KV k="Pressure Drop" v={result.pressureDrop_bar} unit="bar" digits={3} />
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="w-full rounded-md border border-blue-600 bg-blue-600/10 text-white py-3 font-semibold hover:opacity-95"
                onClick={() => setForm({ ...form })}
              >
                Recalculate
              </button>
              <button
                className="w-full rounded-md border border-blue-600 bg-white text-blue-700 dark:bg-slate-900/10 dark:text-blue-400 py-3 font-semibold hover:bg-blue-50 dark:hover:bg-slate-900/60"
                onClick={() =>
                  printCalculationPdf(naturalGasPipelinePdfAdapter, form, result, { description: "", meta: doc })
                }
              >
                Print PDF
              </button>
            </div>
          </motion.div>
        </motion.section>
      </div>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100/80 to-transparent dark:from-slate-900/60"
      />
    </main>
  );
}

/* Helper Components */
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
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm">
      <h3 className="mb-4 text-base md:text-lg font-semibold text-slate-900 dark:text-white">{props.title}</h3>
      <div className="space-y-3">{props.children}</div>
    </div>
  );
}

function KV({ k, v, unit, digits = 2 }: { k: string; v: number | string; unit?: string; digits?: number }) {
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
