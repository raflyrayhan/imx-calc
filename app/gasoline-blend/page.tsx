"use client";

import { useMemo, useState, ChangeEvent } from "react";
import DocMetaForm from "@/components/DocMetaForm";
import { printCalculationPdf, type DocMeta } from "@/lib/pdf";
import { 
    COMPONENTS,
    DEFAULT_INPUT,
    computeGasolineBlend,
    type GasolineBlendInput,
} from "@/lib/gasoline-blend";
import { gasolineBlendPdfAdapter } from "@/lib/pdf-adapters/gasoline-blend";

export default function GasolineBlendPage() {
    const [doc, setDoc] = useState<DocMeta>({
        date: new Date().toISOString().slice(0, 10),
        documentTitle: "Gasoline Blend Property Calculator",
    });

    const [data, setData] = useState<GasolineBlendInput>({ ...DEFAULT_INPUT});
    const [description, setDescription] = useState("");
    
    const result = useMemo(() => computeGasolineBlend(data), [data]);   
    const inputCls =
        "text-black w-full border border-slate-300 rounded-none px-3 py-2 " +
        "focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500";
    
    const onNum =
        (comp: keyof GasolineBlendInput, field: keyof GasolineBlendInput[keyof GasolineBlendInput]) =>
        (e: ChangeEvent<HTMLInputElement>) => {
            const v = Number(String(e.target.value).replace(",", "."));
            setData((prev) => ({
               ...prev,
        [comp]: { ...prev[comp], [field]: Number.isFinite(v) ? v : 0 },
      }));
        };

return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-center text-3xl md:text-4xl font-extrabold text-indigo-900">
          Gasoline Blend Property Calculator
        </h1>

        {/* Document Info */}
        <section className="mt-6 bg-white shadow rounded-2xl border border-slate-200">
          <DocMetaForm value={doc} onChange={(p) => setDoc((d) => ({ ...d, ...p }))} />
        </section>

        {/* Editor */}
        <section className="mt-8 bg-white shadow-xl rounded-2xl border border-slate-100">
          <header className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold text-slate-900 text-center">Enter Component Properties</h2>
          </header>

          <div className="p-4 md:p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <Th>Component</Th>
                    <Th>RON</Th><Th>MON</Th><Th>RVP</Th><Th>Sulfur</Th>
                    <Th>Oxy</Th><Th>Aro</Th><Th>BZ</Th>
                    <Th>Density</Th><Th>Flash Pt</Th><Th>Volume (%)</Th>
                  </tr>
                </thead>
                <tbody>
                  {COMPONENTS.map((c, idx) => (
                    <tr key={c} className={idx % 2 ? "bg-slate-50/50" : ""}>
                      <Td className="font-medium">{c}</Td>
                      <Td><input type="number" className={inputCls} value={data[c].RON} onChange={onNum(c,"RON")} /></Td>
                      <Td><input type="number" className={inputCls} value={data[c].MON} onChange={onNum(c,"MON")} /></Td>
                      <Td><input type="number" className={inputCls} value={data[c].RVP} onChange={onNum(c,"RVP")} /></Td>
                      <Td><input type="number" className={inputCls} value={data[c].Sulfur} onChange={onNum(c,"Sulfur")} /></Td>
                      <Td><input type="number" className={inputCls} value={data[c].Oxy} onChange={onNum(c,"Oxy")} /></Td>
                      <Td><input type="number" className={inputCls} value={data[c].Aro} onChange={onNum(c,"Aro")} /></Td>
                      <Td><input type="number" className={inputCls} value={data[c].BZ} onChange={onNum(c,"BZ")} /></Td>
                      <Td><input type="number" className={inputCls} value={data[c].Dens} onChange={onNum(c,"Dens")} /></Td>
                      <Td><input type="number" className={inputCls} value={data[c].FP} onChange={onNum(c,"FP")} /></Td>
                      <Td><input type="number" className={inputCls} value={data[c].vol} onChange={onNum(c,"vol")} /></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Description for PDF */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description (optional)
              </label>
              <textarea
                className={inputCls + " w-full"}
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notes to appear under the PDF title (optional)"
              />
            </div>

            {/* Actions */}
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <button
                className="w-full rounded-none border border-indigo-600 bg-indigo-600 text-white py-3 font-semibold hover:opacity-95"
                onClick={() => null}
              >
                Calculate
              </button>

              <button
                className="w-full rounded-none border border-indigo-600 bg-white text-indigo-700 py-3 font-semibold hover:bg-indigo-50"
                onClick={() =>
                  printCalculationPdf(gasolineBlendPdfAdapter, data, result, {
                    description,
                    meta: doc,
                  })
                }
              >
                Print PDF
              </button>
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 text-amber-900 p-4">
                <ul className="list-disc pl-5 text-sm">
                  {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            {/* Results */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <Card title="Blend Results">
                <Row k="RON" v={result.RON} digits={2} />
                <Row k="MON" v={result.MON} digits={2} />
                <Row k="RVP" v={result.RVP} unit="psi" digits={2} />
                <Row k="Sulfur" v={result.Sulfur} unit="ppm" digits={1} />
                <Row k="Oxygenate" v={result.Oxy} unit="wt%" digits={2} />
                <Row k="Aromatic" v={result.Aro} unit="wt%" digits={2} />
                <Row k="Benzene" v={result.BZ} unit="vol%" digits={2} />
                <Row k="Density" v={result.Dens} unit="kg/m³" digits={1} />
                <Row k="Flash Point" v={result.FP} unit="°C" digits={1} />
              </Card>

              <Card title="Blend Info">
                <Row k="Total Volume Entered" v={result.volTotal} unit="%" digits={2} />
                <p className="text-xs text-slate-500 mt-2">
                  Calculation uses simple volume-weighted averaging (same as your original tool).
                </p>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------- UI helpers ---------- */
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-2 py-2 border-b border-slate-200">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={"px-2 py-1.5 border-b border-slate-100 " + (className ?? "")}>{children}</td>;
}
function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 bg-white shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4">{props.title}</h3>
      <div className="space-y-2">{props.children}</div>
    </div>
  );
}
function Row({ k, v, unit, digits = 2 }: { k: string; v: number; unit?: string; digits?: number }) {
  const text = Number.isFinite(v) ? v.toFixed(digits) : "-";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">{k}</span>
      <span className="font-semibold text-slate-900">
        {text} {unit ?? ""}
      </span>
    </div>
  );
}