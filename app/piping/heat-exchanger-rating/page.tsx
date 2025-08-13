// app/piping/heat-exchanger-rating/page.tsx
"use client";

import { useMemo, useState } from "react";
import { computeHex, HexInput } from "@/lib/hex-rating";
import { printCalculationPdf, DocMeta } from "@/lib/pdf";
import { hexPdfAdapter } from "@/lib/pdf-adapters/hex-rating";
import DocMetaForm from "@/components/DocMetaForm"; // uses your existing form

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-slate-700 mb-2">{label}</div>
      {children}
    </label>
  );
}
function Row({ k, v, unit }: { k: string; v: number | string; unit?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div className="text-slate-600">{k}</div>
      <div className="font-medium">
        {typeof v === "number" && Number.isFinite(v)
          ? v.toLocaleString(undefined, { maximumFractionDigits: 3 })
          : v}
        {unit ? <span className="text-slate-400 ml-1">{unit}</span> : null}
      </div>
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="px-4 py-3 border-b font-semibold">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function HeatExchangerRatingPage() {
  // ---------------- Document Info (for PDF header) ----------------
  const today = new Date().toISOString().slice(0, 10);
  const [meta, setMeta] = useState<DocMeta>({
    project: "",
    documentNumber: "",
    documentTitle: "Heat Exchanger Rating",
    revision: "R0",
    engineer: "",
    date: today,
  });

  // ---------------- Inputs ----------------
  const [form, setForm] = useState<HexInput>({
    tubeSide: "hot",
    hot: {
      m_kgph: 120000,
      Tin_C: 104,
      Tout_C: 85.11,
      rho: 578,
      cp: 0.63 * 4.186, // kJ/kg.K
      k: 0.08,
      mu_cP_mean: 0.16,
      fouling_m2K_W: 0.00004,
    },
    cold: {
      m_kgph: 140000,
      Tin_C: 40,
      Tout_C: 60,
      rho: 716,
      cp: 0.51 * 4.186, // kJ/kg.K
      k: 0.11,
      mu_cP_mean: 0.62,
      fouling_m2K_W: 0.00005,
    },
    Nt: 414,
    Np: 2,
    L_m: 4.27,
    Do_mm: 19.05,
    t_mm: 1.65,
    pitchRatio: 1.25,
    layout: "30",
    shellID_mm: 609,
    baffleCut_pct: 25,
    baffleSpacing_mm: 400,
    sealingStrips: 2,
    tubeMaterial_k_W_mK: 16,
  });

  // ---------------- Calculation ----------------
  const res = useMemo(() => {
    try {
      return computeHex(form);
    } catch {
      return null;
    }
  }, [form]);

  const num = (v: any) => (Number.isFinite(+v) ? +v : 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title */}
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center">
          Heat Exchanger Rating
        </h1>
        <p className="mt-2 text-slate-600 text-center mx-auto">
          Shell-and-tube rating with LMTD correction (1 shell pass) and simplified tube/shell
          coefficients. Good for quick checks and iteration.
        </p>

        {/* -------- Document Info (header meta used by PDF) -------- */}
        <div className="mt-6 rounded-xl border bg-white">
          <DocMetaForm value={meta} onChange={(patch) => setMeta({ ...meta, ...patch })} />
        </div>

        {/* ---------------- Inputs ---------------- */}
        <section className="mt-6 grid lg:grid-cols-2 gap-6 text-black">
          <Card title="Stream Data – Hot">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Flow (kg/h)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.hot.m_kgph}
                  onChange={(e) => setForm({ ...form, hot: { ...form.hot, m_kgph: num(e.target.value) } })}
                />
              </Field>
              <Field label="ρ (kg/m³)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.hot.rho}
                  onChange={(e) => setForm({ ...form, hot: { ...form.hot, rho: num(e.target.value) } })}
                />
              </Field>
              <Field label="Cp (kJ/kg·K)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.hot.cp}
                  onChange={(e) => setForm({ ...form, hot: { ...form.hot, cp: num(e.target.value) } })}
                />
              </Field>
              <Field label="k (W/m·K)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.hot.k}
                  onChange={(e) => setForm({ ...form, hot: { ...form.hot, k: num(e.target.value) } })}
                />
              </Field>
              <Field label="μ (cP)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.hot.mu_cP_mean}
                  onChange={(e) => setForm({ ...form, hot: { ...form.hot, mu_cP_mean: num(e.target.value) } })}
                />
              </Field>
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <Field label="Tin (°C)">
                  <input
                    className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.hot.Tin_C}
                    onChange={(e) => setForm({ ...form, hot: { ...form.hot, Tin_C: num(e.target.value) } })}
                  />
                </Field>
                <Field label="Tout (°C)">
                  <input
                    className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.hot.Tout_C}
                    onChange={(e) => setForm({ ...form, hot: { ...form.hot, Tout_C: num(e.target.value) } })}
                  />
                </Field>
              </div>
              <Field label="Fouling (m²·K/W)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.hot.fouling_m2K_W ?? 0}
                  onChange={(e) => setForm({ ...form, hot: { ...form.hot, fouling_m2K_W: num(e.target.value) } })}
                />
              </Field>
            </div>
          </Card>

          <Card title="Stream Data – Cold">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Flow (kg/h)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.cold.m_kgph}
                  onChange={(e) => setForm({ ...form, cold: { ...form.cold, m_kgph: num(e.target.value) } })}
                />
              </Field>
              <Field label="ρ (kg/m³)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.cold.rho}
                  onChange={(e) => setForm({ ...form, cold: { ...form.cold, rho: num(e.target.value) } })}
                />
              </Field>
              <Field label="Cp (kJ/kg·K)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.cold.cp}
                  onChange={(e) => setForm({ ...form, cold: { ...form.cold, cp: num(e.target.value) } })}
                />
              </Field>
              <Field label="k (W/m·K)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.cold.k}
                  onChange={(e) => setForm({ ...form, cold: { ...form.cold, k: num(e.target.value) } })}
                />
              </Field>
              <Field label="μ (cP)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.cold.mu_cP_mean}
                  onChange={(e) => setForm({ ...form, cold: { ...form.cold, mu_cP_mean: num(e.target.value) } })}
                />
              </Field>
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <Field label="Tin (°C)">
                  <input
                    className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.cold.Tin_C}
                    onChange={(e) => setForm({ ...form, cold: { ...form.cold, Tin_C: num(e.target.value) } })}
                  />
                </Field>
                <Field label="Tout (°C)">
                  <input
                    className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.cold.Tout_C}
                    onChange={(e) => setForm({ ...form, cold: { ...form.cold, Tout_C: num(e.target.value) } })}
                  />
                </Field>
              </div>
              <Field label="Fouling (m²·K/W)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.cold.fouling_m2K_W ?? 0}
                  onChange={(e) => setForm({ ...form, cold: { ...form.cold, fouling_m2K_W: num(e.target.value) } })}
                />
              </Field>
            </div>
          </Card>

          <Card title="Geometry & Options">
            <div className="grid md:grid-cols-3 gap-3">
              <Field label="Tube Side">
                <select
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.tubeSide}
                  onChange={(e) => setForm({ ...form, tubeSide: e.target.value as any })}
                >
                  <option value="hot">Hot Fluid</option>
                  <option value="cold">Cold Fluid</option>
                </select>
              </Field>
              <Field label="Tubes (Nt)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.Nt}
                  onChange={(e) => setForm({ ...form, Nt: num(e.target.value) })}
                />
              </Field>
              <Field label="Passes (Np)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.Np}
                  onChange={(e) => setForm({ ...form, Np: num(e.target.value) })}
                />
              </Field>

              <Field label="Tube Length (m)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.L_m}
                  onChange={(e) => setForm({ ...form, L_m: num(e.target.value) })}
                />
              </Field>
              <Field label="Tube OD (mm)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.Do_mm}
                  onChange={(e) => setForm({ ...form, Do_mm: num(e.target.value) })}
                />
              </Field>
              <Field label="Wall Thick (mm)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.t_mm}
                  onChange={(e) => setForm({ ...form, t_mm: num(e.target.value) })}
                />
              </Field>

              <Field label="Pitch Ratio (Pt/Do)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.pitchRatio}
                  onChange={(e) => setForm({ ...form, pitchRatio: num(e.target.value) })}
                />
              </Field>
              <Field label="Layout">
                <select
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.layout}
                  onChange={(e) => setForm({ ...form, layout: e.target.value as any })}
                >
                  <option value="30">30° (triangular)</option>
                  <option value="45">45° (square)</option>
                  <option value="60">60° (square)</option>
                </select>
              </Field>
              <Field label="Shell ID (mm)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.shellID_mm}
                  onChange={(e) => setForm({ ...form, shellID_mm: num(e.target.value) })}
                />
              </Field>

              <Field label="Baffle Spacing (mm)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.baffleSpacing_mm}
                  onChange={(e) => setForm({ ...form, baffleSpacing_mm: num(e.target.value) })}
                />
              </Field>
              <Field label="Baffle Cut (%)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.baffleCut_pct}
                  onChange={(e) => setForm({ ...form, baffleCut_pct: num(e.target.value) })}
                />
              </Field>
              <Field label="Tube k (W/m·K)">
                <input
                  className="text-black w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.tubeMaterial_k_W_mK ?? 16}
                  onChange={(e) => setForm({ ...form, tubeMaterial_k_W_mK: num(e.target.value) })}
                />
              </Field>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-3">
              <button
                onClick={() => setForm({ ...form })}
                className="rounded-full py-3 bg-indigo-600 text-white font-semibold shadow"
              >
                Calculate
              </button>

              {res && (
                <button
                  onClick={() =>
                    printCalculationPdf(hexPdfAdapter, form, res, {
                      description: "Shell-and-tube rating (simplified).",
                      meta,
                    })
                  }
                  className="text-black rounded-full py-3 border border-indigo-300 bg-white hover:bg-indigo-50"
                >
                  Print PDF
                </button>
              )}
            </div>
          </Card>

          {/* ---------------- Results ---------------- */}
          {res && (
            <div className="lg:col-span-2 space-y-6">
              {res.warnings.length > 0 && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 p-4">
                  <ul className="list-disc pl-5">
                    {res.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-6">
                <Card title="Thermal Summary">
                  <Row k="Duty" v={res.duty_W} unit="W" />
                  <Row k="LMTD (uncorr.)" v={res.lmtd_C} unit="°C" />
                  <Row k="Ft" v={res.Ft} />
                  <Row k="LMTD (corr.)" v={res.lmtdCorrected_C} unit="°C" />
                  <Row k="U overall" v={res.U_overall_W_m2K} unit="W/m²·K" />
                  <Row k="Area Required" v={res.Areq_m2} unit="m²" />
                  <Row k="Area Available" v={res.AtubeAvail_m2} unit="m²" />
                  <Row k="Over Surface" v={res.overSurface_pct} unit="%" />
                </Card>

                <Card title="Tube Side">
                  <Row k="Di" v={res.tube.Di_m} unit="m" />
                  <Row k="Velocity" v={res.tube.velocity_m_s} unit="m/s" />
                  <Row k="Re" v={res.tube.Re} />
                  <Row k="Pr" v={res.tube.Pr} />
                  <Row k="Nu" v={res.tube.Nu} />
                  <Row k="h" v={res.tube.h_W_m2K} unit="W/m²·K" />
                  <Row k="ΔP est." v={res.tube.dP_bar_est} unit="bar" />
                </Card>

                <Card title="Shell Side">
                  <Row k="De (hyd.)" v={res.shell.De_m} unit="m" />
                  <Row k="Velocity" v={res.shell.velocity_m_s} unit="m/s" />
                  <Row k="Re" v={res.shell.Re} />
                  <Row k="Pr" v={res.shell.Pr} />
                  <Row k="Nu" v={res.shell.Nu} />
                  <Row k="h" v={res.shell.h_W_m2K} unit="W/m²·K" />
                  <Row k="ΔP est." v={res.shell.dP_bar_est} unit="bar" />
                </Card>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* small utility so inputs look consistent */}
      <style jsx global>{`
        .input {
          @apply rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500;
        }
      `}</style>
    </main>
  );
}
