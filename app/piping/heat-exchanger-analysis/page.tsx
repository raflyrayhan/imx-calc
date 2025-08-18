"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import DocMetaForm from "@/components/DocMetaForm";
import { printCalculationPdf, type DocMeta } from "@/lib/pdf";
import {
  computeHeatExchanger,
  type HeatExchangerInput,
} from "@/lib/heat-exchanger-analysis";
import { heatExchangerPdfAdapter } from "@/lib/pdf-adapters/heat-exchanger-analysis";

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};
const list = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

export default function HeatExchangerAnalysisPage() {
  const [doc, setDoc] = useState<DocMeta>({
    date: new Date().toISOString().slice(0, 10),
    documentTitle: "Heat-Exchanger Analysis (ε-NTU)",
  });

  const [form, setForm] = useState<HeatExchangerInput>({
    type: "counter",
    area: 10,
    U: 2000,
    mHot: 5000,
    T1h: 80,
    cpHot: 1,
    mCold: 8000,
    T1c: 20,
    cpCold: 1,
  });

  const [description, setDescription] = useState("");

  const result = useMemo(() => computeHeatExchanger(form), [form]);

  const inputCls =
    "w-full border border-slate-300 dark:border-slate-700 rounded-md bg-transparent px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600";

const onNum = (name: keyof HeatExchangerInput) => (value: number) =>
  setForm((p) => ({ ...p, [name]: value }));

const onSel = (value: string) =>
  setForm((p) => ({ ...p, type: value as HeatExchangerInput["type"] }));

  return (
    <main className="min-h-screen pt-15">
      {/* subtle grid */}

      <div className="max-w-7xl mx-auto px-4 pb-10 space-y-8">
        {/* HEADER */}
        
          <h1 className="text-4xl md:text-5xl font-semibold text-center text-slate-900 dark:text-slate-100 z-20">
            Heat-Exchanger Analysis (ε-NTU)
          </h1>
          <p className="mt-4 mx-auto max-w-4xl text-center text-slate-700 dark:text-slate-300">
            Effectiveness–NTU method for single-phase incompressible fluids.
          </p>
        

        {/* Document meta */}
        <motion.section variants={fadeIn} initial="hidden" animate="show">
          <Card title="Document Info">
            <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
          </Card>
        </motion.section>

        {/* Two-column layout */}
        <motion.section variants={list} initial="hidden" animate="show" className="grid gap-8 lg:grid-cols-3">
          {/* Inputs */}
          <div className="space-y-6">
            <Card title="Exchanger">
              <Select label="Type" value={form.type} onChange={onSel}>
                <option value="parallel">Parallel-Flow</option>
                <option value="counter">Counter-Flow</option>
                <option value="cross">Cross-Flow (both unmixed)</option>
              </Select>
              <Input label="Area (A)" value={form.area} unit="m²" onChange={onNum("area")} />
              <Input label="Overall U" value={form.U} unit="kcal/h·m²·°C" onChange={onNum("U")} />
            </Card>

            <Card title="Hot Stream">
              <Input label="Mass Flow" value={form.mHot} unit="kg/h" onChange={onNum("mHot")} />
              <Input label="Inlet Temp" value={form.T1h} unit="°C" onChange={onNum("T1h")} />
              <Input label="Specific Heat" value={form.cpHot} unit="kcal/kg·°C" onChange={onNum("cpHot")} />
            </Card>

            <Card title="Cold Stream">
              <Input label="Mass Flow" value={form.mCold} unit="kg/h" onChange={onNum("mCold")} />
              <Input label="Inlet Temp" value={form.T1c} unit="°C" onChange={onNum("T1c")} />
              <Input label="Specific Heat" value={form.cpCold} unit="kcal/kg·°C" onChange={onNum("cpCold")} />
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <Card title="Results">
              <KV k="Cr" v={result.Cr} />
              <KV k="NTU" v={result.NTU} />
              <KV k="Effectiveness (ε)" v={result.ε} />
              <KV k="Heat Transfer (Q)" v={result.Q} unit="kcal/h" />
              <KV k="Hot Outlet Temp" v={result.T2h} unit="°C" />
              <KV k="Cold Outlet Temp" v={result.T2c} unit="°C" />
            </Card>

            <Card title="Warnings">
              {result.warnings.length ? (
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {result.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-sm text-green-600">No warnings</span>
              )}
            </Card>

            <button
              className="w-full rounded-md border border-blue-600 bg-blue-600 text-white py-3 font-semibold"
              onClick={() =>
                printCalculationPdf(heatExchangerPdfAdapter, form, result, {
                  description,
                  meta: doc,
                })
              }
            >
              Print PDF
            </button>
          </div>
        </motion.section>

        {/* Optional description */}
        <motion.section variants={fadeIn} initial="hidden" animate="show">
          <Card title="Description (optional)">
            <textarea
              className={inputCls}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes to appear under the PDF title"
            />
          </Card>
        </motion.section>
      </div>
    </main>
  );
}

/* ---------- UI helpers ---------- */
function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6
                    bg-white dark:bg-slate-900/60 backdrop-blur-sm shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{props.title}</h3>
      <div className="space-y-3">{props.children}</div>
    </div>
  );
}

function Input(props: { label: string; value: number; unit: string; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{props.label}</span>
      <div className="flex items-center gap-2 mt-1">
        <input
          type="number"
          value={props.value}
          onChange={(e) => props.onChange(Number(e.target.value))}
          className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-transparent"
        />
        <span className="text-sm text-slate-500 dark:text-slate-400">{props.unit}</span>
      </div>
    </label>
  );
}

function Select(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{props.label}</span>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full mt-1 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-transparent"
      >
        {props.children}
      </select>
    </label>
  );
}

function KV(props: { k: string; v: number; unit?: string; digits?: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{props.k}</span>
      <span>
        {Number(props.v).toFixed(props.digits ?? 2)} {props.unit ?? ""}
      </span>
    </div>
  );
}
