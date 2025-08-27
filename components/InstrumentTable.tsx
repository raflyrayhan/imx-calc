"use client";
import React from "react";
import Link from "next/link";
import { Instrument } from "@/lib/type";
import { useStore } from "@/lib/store";
import { exportCSV } from "@/lib/exporters";

export function InstrumentTable({ data }: { data: Instrument[] }) {
  const { deleteInstrument } = useStore();
  const [q, setQ] = React.useState("");
  const [disc, setDisc] = React.useState("All");

  const filtered = React.useMemo(() => {
    return data.filter((it) => {
      const okDisc = disc === "All" || it.discipline === disc;
      const text = `${it.tag} ${it.instrumentType} ${it.service} ${it.location} ${it.area} ${it.unit} ${it.system} ${it.lineNumber} ${it.equipmentNumber}`.toLowerCase();
      return okDisc && text.includes(q.toLowerCase());
    });
  }, [data, q, disc]);

  const totals = React.useMemo(
    () =>
      filtered.reduce(
        (a, it) => ({ ai: a.ai + (it.ai || 0), ao: a.ao + (it.ao || 0), di: a.di + (it.di || 0), do: a.do + (it.do || 0) }),
        { ai: 0, ao: 0, di: 0, do: 0 }
      ),
    [filtered]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="rounded-xl border border-slate-200 px-3 py-2 min-w-[260px]"
          placeholder="Search tag / service / location / system"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="rounded-xl border border-slate-200 px-3 py-2" value={disc} onChange={(e) => setDisc(e.target.value)}>
          {["All", "Instrumentation", "Control", "Electrical", "Analyzer"].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium">Totals:</span>
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">AI {totals.ai}</span>
          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">AO {totals.ao}</span>
          <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800">DI {totals.di}</span>
          <span className="px-2 py-1 rounded-full bg-violet-100 text-violet-800">DO {totals.do}</span>

          <button onClick={() => exportCSV(filtered, totals)} className="rounded-xl border px-3 py-2 hover:bg-slate-50">
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-slate-200 rounded-xl overflow-hidden">
          <thead className="bg-slate-50">
            <tr>
              {["Tag","Type","Service","Location","Area","Unit","System","Line No.","Equip No.","AI","AO","DI","DO","Remarks","Actions"].map((h) => (
                <th key={h} className="text-left text-sm font-semibold text-slate-600 px-4 py-3 border-b">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id} className="odd:bg-white even:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-800">
                  <Link className="underline underline-offset-2" href={`/instrument/${it.id}/datasheet`}>{it.tag}</Link>
                </td>
                <td className="px-4 py-3">{it.instrumentType}</td>
                <td className="px-4 py-3">{it.service}</td>
                <td className="px-4 py-3">{it.location}</td>
                <td className="px-4 py-3">{it.area}</td>
                <td className="px-4 py-3">{it.unit}</td>
                <td className="px-4 py-3">{it.system}</td>
                <td className="px-4 py-3">{it.lineNumber}</td>
                <td className="px-4 py-3">{it.equipmentNumber}</td>
                <td className="px-4 py-3">{it.ai}</td>
                <td className="px-4 py-3">{it.ao}</td>
                <td className="px-4 py-3">{it.di}</td>
                <td className="px-4 py-3">{it.do}</td>
                <td className="px-4 py-3">{it.remarks}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link className="text-blue-600 hover:underline" href={`/instrument/${it.id}/datasheet`}>Datasheet</Link>
                    <button className="text-red-600 hover:underline" onClick={() => deleteInstrument(it.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={15} className="px-4 py-10 text-center text-slate-500">No instruments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
