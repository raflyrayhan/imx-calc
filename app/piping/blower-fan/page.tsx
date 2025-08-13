// app/cfd/blower-fan/page.tsx
"use client";

import { useMemo, useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import DocMetaForm from "@/components/DocMetaForm";
import { printCalculationPdf, type DocMeta } from "@/lib/pdf";
import {
  DEFAULT_BLOWER_FAN_INPUT,
  type BlowerFanInput,
  computeBlowerFan,
} from "@/lib/blower-fan";
import { blowerFanPdfAdapter } from "@/lib/pdf-adapters/blower-fan";

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};
const list = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

export default function BlowerFanPage() {
  const [doc, setDoc] = useState<DocMeta>({
    date: new Date().toISOString().slice(0, 10),
    documentTitle: "Blower & Fan Calculation",
  });

  const [form, setForm] = useState<BlowerFanInput>(DEFAULT_BLOWER_FAN_INPUT);
  const [notes, setNotes] = useState("");
  const R = useMemo(() => computeBlowerFan(form), [form]);

  const inputCls =
    "w-full rounded-md border border-slate-300 dark:border-slate-700 " +
    "bg-white dark:bg-slate-900/40 px-3 py-2 " +
    "text-slate-900 dark:text-slate-100 placeholder-slate-400 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500";

  const onNum =
    (k: keyof BlowerFanInput) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = Number(String(e.target.value).replace(",", "."));
      setForm((p) => ({ ...p, [k]: Number.isFinite(v) ? v : 0 }));
    };

  return (
    <main className="relative min-h-screen bg-white dark:bg-slate-950">
      {/* subtle tech grid bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(100%_60%_at_50%_0%,black,transparent)]"
      >
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(2,6,23,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.05)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-60" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <motion.header variants={fadeIn} initial="hidden" animate="show" className="text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Blower &amp; Fan Calculation
          </h1>
          <p className="mt-4 mx-auto max-w-4xl text-slate-600 dark:text-slate-300">
            Compute power from airflow and static pressure and scale performance with Affinity Laws.
          </p>
        </motion.header>

        {/* Doc meta */}
        <motion.section variants={fadeIn} initial="hidden" animate="show" className="mt-8">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm">
            <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
          </div>
        </motion.section>

        {/* Two/Three column layout */}
        <motion.section variants={list} initial="hidden" animate="show" className="mt-10 grid gap-8 lg:grid-cols-3">
          {/* Existing */}
          <motion.div variants={fadeIn} className="space-y-6">
            <Card title="Operating Data (Existing)">
              <Field label="Air Flow, Q₁">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input type="number" className={inputCls} value={form.q1_cfm} onChange={onNum("q1_cfm")} />
                  <Unit>ft³/min</Unit>
                </div>
              </Field>
              <Field label="Static Pressure, SP₁">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input type="number" className={inputCls} value={form.sp1_inH2O} onChange={onNum("sp1_inH2O")} />
                  <Unit>inch H₂O</Unit>
                </div>
              </Field>
              <Field label="Speed, N₁">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input type="number" className={inputCls} value={form.n1_rpm} onChange={onNum("n1_rpm")} />
                  <Unit>rpm</Unit>
                </div>
              </Field>
              <Field label="Fan Diameter, D₁">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input type="number" className={inputCls} value={form.d1_in} onChange={onNum("d1_in")} />
                  <Unit>inch</Unit>
                </div>
              </Field>
            </Card>

            <Card title="Efficiencies (η)">
              <Grid2>
                <Field label="ηFan">
                  <div className="grid grid-cols-[1fr,90px] gap-2">
                    <input type="number" className={inputCls} value={form.etaFan_pct} onChange={onNum("etaFan_pct")} />
                    <Unit>%</Unit>
                  </div>
                </Field>
                <Field label="ηBelt">
                  <div className="grid grid-cols-[1fr,90px] gap-2">
                    <input type="number" className={inputCls} value={form.etaBelt_pct} onChange={onNum("etaBelt_pct")} />
                    <Unit>%</Unit>
                  </div>
                </Field>
                <Field label="ηMotor">
                  <div className="grid grid-cols-[1fr,90px] gap-2">
                    <input type="number" className={inputCls} value={form.etaMotor_pct} onChange={onNum("etaMotor_pct")} />
                    <Unit>%</Unit>
                  </div>
                </Field>
                <Field label="ηDrive">
                  <div className="grid grid-cols-[1fr,90px] gap-2">
                    <input type="number" className={inputCls} value={form.etaDrive_pct} onChange={onNum("etaDrive_pct")} />
                    <Unit>%</Unit>
                  </div>
                </Field>
              </Grid2>
              <KV k="Overall η" v={R.etaTotal * 100} unit="%" digits={2} />
            </Card>
          </motion.div>

          {/* New condition */}
          <motion.div variants={fadeIn} className="space-y-6">
            <Card title="New Condition">
              <Field label="Speed, N₂">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input type="number" className={inputCls} value={form.n2_rpm} onChange={onNum("n2_rpm")} />
                  <Unit>rpm</Unit>
                </div>
              </Field>
              <Field label="Fan Diameter, D₂">
                <div className="grid grid-cols-[1fr,110px] gap-2">
                  <input type="number" className={inputCls} value={form.d2_in} onChange={onNum("d2_in")} />
                  <Unit>inch</Unit>
                </div>
              </Field>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <KV k="N₂ / N₁" v={R.nRatio} digits={3} />
                <KV k="D₂ / D₁" v={R.dRatio} digits={3} />
              </div>
            </Card>

            <Card title="Power (Existing)">
              <KV k="Fan Power" v={R.hp1} unit="hp" digits={2} />
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                HP = (CFM × SP) / (6356 × η_total)
              </div>
            </Card>
          </motion.div>

          {/* Results */}
          <motion.div variants={fadeIn} className="space-y-6">
            <Card title="Affinity Results (New)">
              <KV k="Air Flow, Q₂" v={R.q2_cfm} unit="ft³/min" digits={0} />
              <KV k="Static Pressure, SP₂" v={R.sp2_inH2O} unit="inch H₂O" digits={2} />
              <KV k="Power, HP₂" v={R.hp2_viaFormula} unit="hp" digits={2} />
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Cross-check (affinity): {R.hp2_viaAffinity.toFixed(2)} hp
              </div>
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
                  printCalculationPdf(blowerFanPdfAdapter, form, R, {
                    description: notes,
                    meta: doc,
                  })
                }
              >
                Print PDF
              </button>
            </div>

            {R.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-300/60 bg-amber-50 text-amber-900 p-4 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-600/40">
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {R.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </motion.section>

        {/* Notes for PDF */}
        <motion.section variants={fadeIn} initial="hidden" animate="show" className="mt-8">
          <Card title="Description (optional)">
            <textarea
              className={inputCls}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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

/* ----- small themed UI helpers (same as other calc) ----- */
function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">{props.label}</div>
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
function Unit({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-3 text-slate-700 dark:text-slate-200">
      {children}
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
function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}
