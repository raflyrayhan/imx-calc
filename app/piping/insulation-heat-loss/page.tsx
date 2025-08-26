"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { motion } from "framer-motion";
import DocMetaForm from "@/components/DocMetaForm";
import { printCalculationPdf } from "@/lib/pdf";
import { insulationHeatLossPdfAdapter } from "@/lib/pdf-adapters/insulation-heat-loss";
import { insulationMaterials, insulatedPipeHeatLoss, barePipeHeatLoss, calculateSurfaceTemperature } from "@/lib/insulation-heat-loss";

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

export default function InsulationHeatLossPage() {
  const [doc, setDoc] = useState({
    date: new Date().toISOString().slice(0, 10),
    documentTitle: "Insulation Heat Loss Calculation",
  });

  const [form, setForm] = useState({
    pipeSize: 3,  // inches
    operatingTemperature: 350,  // °F
    ambientTemperature: 75,  // °F
    windSpeed: 8,  // mph
    insulationMaterial: "Mineral Wool",  // Default insulation material
    insulationThickness: 1.5,  // inches
    surfaceEmissivity: 0.90,  // All Service Jacket
  });

  const [description, setDescription] = useState("");

  const result = useMemo(() => {
    const heatLoss = insulatedPipeHeatLoss(form);
    const surfaceTemperature = calculateSurfaceTemperature(form, heatLoss);
    const bareHeatLoss = barePipeHeatLoss(form);
    const bareSurfaceTemperature = form.operatingTemperature - (bareHeatLoss / 1000) * (form.pipeSize + 0.375);

    return {
      heatLoss,
      surfaceTemperature,
      barePipeHeatLoss: bareHeatLoss,
      barePipeSurfaceTemperature: bareSurfaceTemperature,
      warnings: ["Ensure that insulation material is correctly selected for the operating conditions."],
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
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Insulation Heat Loss Calculation</h1>
          <p className="mt-4 mx-auto max-w-4xl">
            This web application estimates Heat Loss from an Insulated and Bare Horizontal Steel Pipe along with calculation of Surface Temperature.
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
              <Field label="Pipe Size (inches)">
                <input type="number" className={inputCls} value={form.pipeSize} onChange={onNum("pipeSize")} />
              </Field>

              <Field label="Operating Temperature (°F)">
                <input type="number" className={inputCls} value={form.operatingTemperature} onChange={onNum("operatingTemperature")} />
              </Field>

              <Field label="Ambient Temperature (°F)">
                <input type="number" className={inputCls} value={form.ambientTemperature} onChange={onNum("ambientTemperature")} />
              </Field>

              <Field label="Wind Speed (mph)">
                <input type="number" className={inputCls} value={form.windSpeed} onChange={onNum("windSpeed")} />
              </Field>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} className="space-y-6">
            <Card title="Insulation Data">
              <Field label="Insulation Material">
                <select className={inputCls} value={form.insulationMaterial} onChange={onSel("insulationMaterial")}>
                  {Object.keys(insulationMaterials).map((material) => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </Field>

              <Field label="Insulation Thickness (inches)">
                <input type="number" className={inputCls} value={form.insulationThickness} onChange={onNum("insulationThickness")} />
              </Field>

              <Field label="Surface Emissivity">
                <input type="number" className={inputCls} value={form.surfaceEmissivity} onChange={onNum("surfaceEmissivity")} />
              </Field>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} className="space-y-6">
            <Card title="Results">
              <KV k="Insulated Pipe Heat Loss" v={result.heatLoss} unit="Btu/h/ft" />
              <KV k="Insulated Pipe Surface Temperature" v={result.surfaceTemperature} unit="°F" />
              <KV k="Bare Pipe Heat Loss" v={result.barePipeHeatLoss} unit="Btu/h/ft" />
              <KV k="Bare Pipe Surface Temperature" v={result.barePipeSurfaceTemperature} unit="°F" />
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
                  printCalculationPdf(insulationHeatLossPdfAdapter, form, result, { description, meta: doc })
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
