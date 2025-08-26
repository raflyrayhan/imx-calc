"use client";

import { useMemo, useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import DocMetaForm from "@/components/DocMetaForm";
import { printCalculationPdf } from "@/lib/pdf";
import { calculateRequiredThickness, calculateMaxAllowablePressure, calculateHydrotestPressure, validateThickness } from "@/lib/pipe-thickness-calculator";
import { pipeThicknessPdfAdapter } from "@/lib/pdf-adapters/pipe-thickness";
import { pipeSchedules } from "@/lib/pipe-schedule-db"; // Explicitly using pipe schedule data

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

export default function PipeThicknessCalculatorPage() {
  const [doc, setDoc] = useState({
    date: new Date().toISOString().slice(0, 10),
    documentTitle: "Pipe Thickness Calculation",
  });

  const [form, setForm] = useState({
    designPressure: 400, // psig
    designTemp: 120, // °F
    corrosionAllowance: 13, // inches
    flangeRating: 900, // lb
    nps: 6, // Nominal Pipe Size (inches)
    requiredThickness: 0.432, // inches
    pipeSchedule: 80, // Pipe schedule (selected schedule)
    nominalWallThickness: 0.432, // inches
  });

  const [description, setDescription] = useState("");

  const validateForm = () => {
    if (isNaN(form.designPressure) || isNaN(form.nps) || isNaN(form.requiredThickness)) {
      return false;
    }
    return true;
  };

  const result = useMemo(() => {
    if (!validateForm()) {
      return {
        requiredThickness: NaN,
        maxAllowablePressure: NaN,
        hydrotestPressure: NaN,
        warnings: ["Please provide valid inputs for all fields."],
      };
    }

    return {
      requiredThickness: calculateRequiredThickness(form),
      maxAllowablePressure: calculateMaxAllowablePressure(form),
      hydrotestPressure: calculateHydrotestPressure(form),
      warnings: [validateThickness(form)],
    };
  }, [form]);

  const inputCls = "w-full border border-slate-300 dark:border-slate-700 rounded-md bg-transparent px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600";

  const onNum = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(String(e.target.value).replace(",", "."));
    setForm((p) => ({ ...p, [name]: Number.isFinite(v) ? v : 0 }));
  };

  const onSel = (name: string) => (e: ChangeEvent<HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [name]: e.target.value as any }));
  };

  return (
    <main className="min-h-screen">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10">
        <motion.header variants={fadeIn} initial="hidden" animate="show" className="text-center text-black">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Pipe Thickness Calculation</h1>
          <p className="mt-4 mx-auto max-w-4xl">
            Calculates pipe thickness, maximum allowable pressure, and hydrotest pressure based on design data.
          </p>
        </motion.header>

        <motion.section variants={fadeIn} initial="hidden" animate="show" className="mt-8">
          <Card title="Document Info">
            <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
          </Card>
        </motion.section>

        <motion.section variants={fadeIn} initial="hidden" animate="show" className="mt-10 grid gap-8 lg:grid-cols-3">
          <motion.div variants={fadeIn} className="space-y-6">
            <Card title="Pipe Data">
              <Field label="Nominal Pipe Size (NPS)">
                <select className={inputCls} value={form.nps} onChange={onSel("nps")}>
                  {pipeSchedules.map((schedule) => (
                    <option key={schedule.schedule} value={schedule.schedule}>
                      {schedule.schedule} — {schedule.thickness} inches
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Pipe Schedule">
                <select className={inputCls} value={form.pipeSchedule} onChange={onSel("pipeSchedule")}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={40}>40</option>
                  <option value={80}>80</option>
                </select>
              </Field>

              <Field label="Corrosion Allowance">
                <input type="number" className={inputCls} value={form.corrosionAllowance} onChange={onNum("corrosionAllowance")} />
              </Field>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} className="space-y-6">
            <Card title="Fluid Data">
              <Field label="Design Pressure (psig)">
                <input type="number" className={inputCls} value={form.designPressure} onChange={onNum("designPressure")} />
              </Field>

              <Field label="Design Temperature (°F)">
                <input type="number" className={inputCls} value={form.designTemp} onChange={onNum("designTemp")} />
              </Field>

              <Field label="Nominal Wall Thickness (tn)">
                <input type="number" className={inputCls} value={form.nominalWallThickness} onChange={onNum("nominalWallThickness")} />
              </Field>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} className="space-y-6">
            <Card title="Results">
              <KV k="Required Thickness (tr)" v={result.requiredThickness} unit="inches" />
              <KV k="Max Allowable Pressure" v={result.maxAllowablePressure} unit="psig" />
              <KV k="Hydrotest Pressure" v={result.hydrotestPressure} unit="psig" />
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="w-full rounded-md border border-blue-600 bg-blue-600/10 text-white py-3 font-semibold hover:opacity-95"
                onClick={() => setForm({ ...form })}
                title="Recalculate using current inputs"
              >
                Recalculate
              </button>
              <button
                className="w-full rounded-md border border-blue-600 bg-white text-blue-700 dark:bg-slate-900/10 dark:text-blue-400 py-3 font-semibold hover:bg-blue-50 dark:hover:bg-slate-900/60"
                onClick={() =>
                  printCalculationPdf(pipeThicknessPdfAdapter, form, result, { description, meta: doc })
                }
                title="Export the calculation as a PDF"
              >
                Print PDF
              </button>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </main>
  );
}

// Helper Components

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</div>
      {children}
    </label>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm">
      <h3 className="mb-4 text-base md:text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function KV({ k, v, unit }: { k: string; v: number | string; unit?: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-slate-600 dark:text-slate-300">{k}</span>
      <span className="font-semibold text-slate-900 dark:text-white">{v} {unit ?? ""}</span>
    </div>
  );
}
